
import React from 'react';
import { AgentState } from '../types';

interface Props {
  agents: AgentState[];
  metrics: {
    totalCompleted: number;
    successRate: string;
    avgTime: string;
  };
}

const AgentDashboard: React.FC<Props> = ({ agents, metrics }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <i className="fas fa-microchip text-indigo-500"></i>
          Agent Cluster Visualizer
        </h3>
        <div className="flex gap-4 text-[10px] font-mono">
          <span className="text-emerald-400">SUCCESS: {metrics.successRate}</span>
          <span className="text-indigo-400">AVG: {metrics.avgTime}</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        {agents.map((agent) => (
          <div key={agent.id} className="relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  agent.status === 'active' ? 'bg-emerald-500 animate-pulse' : 
                  agent.status === 'error' ? 'bg-red-500' : 'bg-slate-600'
                }`}></div>
                <span className="text-[11px] font-bold text-slate-200">{agent.name}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                {agent.status} • {agent.progress}%
              </span>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-800/50">
              <div 
                className={`h-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.3)] ${
                  agent.status === 'active' ? 'bg-indigo-500' : 
                  agent.status === 'error' ? 'bg-red-500' : 'bg-slate-700'
                }`}
                style={{ width: `${agent.progress}%` }}
              ></div>
            </div>

            <div className="mt-1.5 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 truncate max-w-[180px]">
                {agent.currentTask || 'Awaiting instructions...'}
              </span>
              {agent.startTime && (
                <span className="text-[9px] text-slate-600 font-mono">
                  {Math.floor((Date.now() - agent.startTime) / 1000)}s
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Communication Flow Simulation */}
        <div className="mt-4 pt-6 border-t border-slate-800 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-[8px] text-slate-600 font-bold uppercase tracking-widest">
            Cross-Agent Pipeline
          </div>
          <div className="flex justify-between items-center px-4">
             <i className={`fas fa-search ${agents[0].status === 'active' ? 'text-indigo-400' : 'text-slate-700'}`}></i>
             <div className={`h-[1px] flex-1 mx-2 ${agents[0].status === 'active' ? 'bg-indigo-500/50' : 'bg-slate-800'}`}></div>
             <i className={`fas fa-code ${agents[1].status === 'active' ? 'text-indigo-400' : 'text-slate-700'}`}></i>
             <div className={`h-[1px] flex-1 mx-2 ${agents[1].status === 'active' ? 'bg-indigo-500/50' : 'bg-slate-800'}`}></div>
             <i className={`fas fa-vial ${agents[2].status === 'active' ? 'text-indigo-400' : 'text-slate-700'}`}></i>
             <div className={`h-[1px] flex-1 mx-2 ${agents[2].status === 'active' ? 'bg-indigo-500/50' : 'bg-slate-800'}`}></div>
             <i className={`fas fa-rocket ${agents[3].status === 'active' ? 'text-indigo-400' : 'text-slate-700'}`}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
