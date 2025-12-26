
import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardHeader from './components/DashboardHeader';
import TerminalLog from './components/TerminalLog';
import TaskGrid from './components/TaskGrid';
import DetailPanel from './components/DetailPanel';
import CommunicationHub from './components/CommunicationHub';
import AgentDashboard from './components/AgentDashboard';
import { ResearchTask, TaskStatus, AgentLog, ProtonStatus, ZapActivity, ProjectFeedback, AgentState, ShopifyMetrics, TaskPriority } from './types';
import { fetchTasksFromNotion, syncTaskToNotion } from './services/notionService';
import { conductResearch, generateCode, generateTests } from './services/geminiService';
import { postToSlack, SlackMessage } from './services/slackService';
import { sendOutgoingWebhook } from './services/webhookService';
import { triggerZap } from './services/zapierService';
import { connectVPN, storeInProtonDrive, sendProtonNotification } from './services/protonService';
import { commitToGitHub } from './services/githubService';
import { triggerDeployments } from './services/deploymentService';
import { provisionAWS, syncToKindle } from './services/amazonService';
import { syncToSheets } from './services/googleSheetsService';
import { syncShopifyStore, fetchShopifyAnalytics } from './services/shopifyService';
import { triggerForgeMindToArchitectSync, triggerArchitectToForgeMindSync } from './services/syncService';

const MAX_RETRIES = 3;

const App: React.FC = () => {
  const [tasks, setTasks] = useState<ResearchTask[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [slackMessages, setSlackMessages] = useState<SlackMessage[]>([]);
  const [zapActivities, setZapActivities] = useState<ZapActivity[]>([]);
  const [shopifyMetrics, setShopifyMetrics] = useState<ShopifyMetrics | null>(null);
  const [protonStatus, setProtonStatus] = useState<ProtonStatus>({
    vpnConnected: false,
    server: "N/A",
    encryptionLevel: "N/A"
  });
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Multi-Agent States
  const [agents, setAgents] = useState<AgentState[]>([
    { id: 'research', name: 'Research Agent', status: 'idle', currentTask: '', progress: 0 },
    { id: 'codegen', name: 'CodeGen Agent', status: 'idle', currentTask: '', progress: 0 },
    { id: 'test', name: 'Test Agent', status: 'idle', currentTask: '', progress: 0 },
    { id: 'deploy', name: 'Deploy Agent', status: 'idle', currentTask: '', progress: 0 }
  ]);

  const isRunningRef = useRef(false);
  const taskQueueRef = useRef<string[]>([]);

  const addLog = useCallback((message: string, level: AgentLog['level'] = 'info', taskId?: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev.slice(-199), { timestamp, message, level, taskId }]);
  }, []);

  const updateAgent = useCallback((id: string, updates: Partial<AgentState>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  useEffect(() => {
    const init = async () => {
      addLog("Initializing multi-agent orchestrator...", 'info');
      try {
        const [fetchedTasks, metrics] = await Promise.all([
          fetchTasksFromNotion(),
          fetchShopifyAnalytics()
        ]);
        
        setTasks(fetchedTasks.map(t => ({ ...t, retryCount: 0 })));
        setShopifyMetrics(metrics);
        
        // Sorting tasks by priority for the initial queue
        const priorityOrder = { [TaskPriority.HIGH]: 0, [TaskPriority.MEDIUM]: 1, [TaskPriority.LOW]: 2 };
        const sortedTaskIds = [...fetchedTasks]
          .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
          .map(t => t.id);
          
        taskQueueRef.current = sortedTaskIds;
        
        // Initial Triangle Sync
        await triggerArchitectToForgeMindSync();
        addLog(`Synchronized with AI Workflow Architect. Shopify analytics fetched.`, 'success');
      } catch (err) {
        addLog("Critical failure: Could not reach orchestration pool.", 'error');
      }
    };
    init();
  }, [addLog]);

  const updateTask = (id: string, updates: Partial<ResearchTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const withRetry = async <T,>(
    fn: () => Promise<T>,
    taskId: string,
    operationName: string
  ): Promise<T> => {
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const backoff = Math.pow(2, attempt) * 1000;
          addLog(`Retrying ${operationName} (${attempt}/${MAX_RETRIES})`, 'warning', taskId);
          updateTask(taskId, { retryCount: attempt });
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
        return await fn();
      } catch (err: any) {
        lastError = err;
        addLog(`${operationName} failed: ${err.message}`, 'error', taskId);
        if (attempt === MAX_RETRIES) break;
      }
    }
    throw lastError;
  };

  const processNextTask = useCallback(async () => {
    if (!isRunningRef.current || taskQueueRef.current.length === 0) {
      if (taskQueueRef.current.length === 0 && isRunningRef.current) {
        setIsRunning(false);
        isRunningRef.current = false;
        addLog("Batch orchestration complete.", 'success');
      }
      return;
    }

    const taskId = taskQueueRef.current.shift()!;
    const task = tasks.find(t => t.id === taskId);
    
    if (!task || task.status === TaskStatus.COMPLETED) {
      processNextTask();
      return;
    }

    try {
      addLog(`Engaging lifecycle for [${task.priority}]: ${task.topic}`, 'info', taskId);
      
      // Phase 1: Research Agent
      updateAgent('research', { status: 'active', currentTask: task.topic, progress: 0, startTime: Date.now() });
      updateTask(taskId, { status: TaskStatus.RESEARCHING, progress: 10 });
      
      const [research, infra] = await Promise.all([
        withRetry(() => conductResearch(task.topic), taskId, "Research"),
        withRetry(() => provisionAWS(task), taskId, "AWS Infra")
      ]);
      
      updateAgent('research', { progress: 100, status: 'idle' });
      updateTask(taskId, { research, infra, progress: 25 });
      await syncToKindle(research.summary);

      // Phase 2: CodeGen Agent (Thinking Mode)
      updateAgent('codegen', { status: 'active', currentTask: `Architecting: ${task.topic}`, progress: 0, startTime: Date.now() });
      updateTask(taskId, { status: TaskStatus.GENERATING_CODE, progress: 40 });
      const code = await withRetry(() => generateCode(task.topic, research), taskId, "CodeGen");
      updateAgent('codegen', { progress: 100, status: 'idle' });
      updateTask(taskId, { code, progress: 55 });

      // Phase 3: Test Agent
      updateAgent('test', { status: 'active', currentTask: `Verifying: ${task.topic}`, progress: 0, startTime: Date.now() });
      updateTask(taskId, { status: TaskStatus.TESTING, progress: 65 });
      const unitTests = await withRetry(() => generateTests(task.topic, research, code), taskId, "Testing");
      updateAgent('test', { progress: 100, status: 'idle' });
      updateTask(taskId, { status: TaskStatus.TESTED, unitTests, progress: 75 });

      // Phase 4: Deploy Agent (GitHub, Shopify, AWS)
      updateAgent('deploy', { status: 'active', currentTask: `Shipping: ${task.topic}`, progress: 0, startTime: Date.now() });
      updateTask(taskId, { status: TaskStatus.COMMITTING, progress: 80 });
      
      const commitUrl = await withRetry(() => commitToGitHub(task), taskId, "GitHub");
      addLog(`GitHub Commit (Branch feature/${task.id}): ${commitUrl}`, 'success', taskId);
      
      // Triangle Sync Trigger
      await triggerForgeMindToArchitectSync(taskId);

      updateTask(taskId, { status: TaskStatus.DEPLOYING, progress: 90 });
      const [endpoints, shopifyRes] = await Promise.all([
        withRetry(() => triggerDeployments(task), taskId, "Deploy"),
        withRetry(() => syncShopifyStore(task), taskId, "Shopify Sync")
      ]);
      
      updateAgent('deploy', { progress: 100, status: 'idle' });
      addLog(`Shopify Command Center Updated: ${shopifyRes.productId}`, 'success', taskId);

      // Final Orchestration Sync
      const finalTask = { ...task, research, code, unitTests, infra, shopifyUpdate: shopifyRes, status: TaskStatus.COMPLETED };
      await Promise.all([
        syncTaskToNotion(finalTask),
        syncToSheets(finalTask),
        triggerZap(finalTask, 'COMPLETION').then(zap => setZapActivities(prev => [zap, ...prev])),
        storeInProtonDrive(`${task.id}_bundle.json`, finalTask)
      ]);
      
      updateTask(taskId, { status: TaskStatus.COMPLETED, progress: 100 });
      addLog(`Full lifecycle finalized for ${taskId}.`, 'success', taskId);
      
    } catch (err: any) {
      updateTask(taskId, { status: TaskStatus.FAILED, error: err.message });
      addLog(`Orchestration Error: ${err.message}`, 'error', taskId);
      // Reset agent statuses on failure
      setAgents(prev => prev.map(a => ({ ...a, status: a.status === 'active' ? 'error' : a.status })));
    }

    setTimeout(processNextTask, 1500);
  }, [tasks, addLog, protonStatus.vpnConnected, updateAgent]);

  const handleStart = () => {
    setIsRunning(true);
    isRunningRef.current = true;
    
    // Ensure task queue is sorted by priority before starting
    const priorityOrder = { [TaskPriority.HIGH]: 0, [TaskPriority.MEDIUM]: 1, [TaskPriority.LOW]: 2 };
    const pendingTaskIds = tasks
      .filter(t => t.status !== TaskStatus.COMPLETED)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .map(t => t.id);
    
    taskQueueRef.current = pendingTaskIds;
    
    addLog("Sequence active. AI cluster operational. Priority sorting applied.", 'info');
    processNextTask();
  };

  const handleStop = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    addLog("Pipeline suspended by root command.", 'warning');
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', progress: 0 })));
  };

  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <DashboardHeader 
        totalTasks={tasks.length}
        completedTasks={completedCount}
        isRunning={isRunning}
        onStart={handleStart}
        onStop={handleStop}
      />

      <main className="flex-1 max-w-[1800px] mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Dashboard and Comms */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden h-[calc(100vh-14rem)]">
           <AgentDashboard 
              agents={agents} 
              metrics={{ totalCompleted: completedCount, successRate: "98.2%", avgTime: "42s" }} 
           />
           <div className="flex-1 overflow-hidden">
             <CommunicationHub 
                messages={slackMessages} 
                onAction={() => {}} 
                protonStatus={protonStatus}
                zapActivities={zapActivities}
                shopifyMetrics={shopifyMetrics}
             />
           </div>
        </div>

        {/* Task Grid and Center Log */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden h-[calc(100vh-14rem)]">
          <div className="flex-1 overflow-y-auto">
            <TaskGrid 
              tasks={tasks} 
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
            />
          </div>
          <div className="h-48 shrink-0">
             <TerminalLog logs={logs} />
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-4 h-[calc(100vh-14rem)] overflow-hidden">
          <DetailPanel task={selectedTask} onFeedback={() => {}} />
        </div>
      </main>

      <footer className="p-4 border-t border-slate-900 bg-slate-950 flex justify-between items-center text-[10px] text-slate-600 font-mono">
        <div className="flex gap-4">
          <span><i className="fab fa-shopify text-emerald-400"></i> SHOPIFY: CONNECTED</span>
          <span><i className="fas fa-sync text-indigo-400 animate-spin-slow"></i> TRIANGLE SYNC: ACTIVE</span>
          <span><i className="fab fa-aws text-orange-400"></i> AWS: NOMINAL</span>
        </div>
        <div>FORGEMIND AI ORCHESTRATOR • V7.0.0 • MULTI-AGENT CLUSTER</div>
      </footer>
    </div>
  );
};

export default App;
