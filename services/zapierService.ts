
import { ResearchTask, ZapActivity } from "../types";

export const ZAPIER_TEMPLATES = [
  { name: "Research to GitHub Issue", description: "Create a GitHub issue when research completes" },
  { name: "Code to Discord", description: "Post generated snippets to #dev-showcase" },
  { name: "Error to PagerDuty", description: "Alert engineering on task failure" }
];

export const triggerZap = async (task: ResearchTask, eventType: 'COMPLETION' | 'ERROR' | 'DEPLOY'): Promise<ZapActivity> => {
  console.log(`[Zapier] Triggering Zap for ${eventType} on task ${task.id}`);
  
  // Simulation of Zapier Webhook trigger
  await new Promise(r => setTimeout(r, 800));
  
  return {
    id: `zap-${Math.random().toString(36).substr(2, 5)}`,
    name: `${eventType}: ${task.topic.substring(0, 15)}...`,
    status: 'success',
    timestamp: new Date()
  };
};

export const monitorZapStatus = async (zapId: string): Promise<'success' | 'running' | 'failed'> => {
  return 'success';
};

// Simulation of receiving a webhook to start a task
export const receiveZapTrigger = (payload: any): Partial<ResearchTask> => {
  return {
    id: `ext-${Date.now()}`,
    topic: payload.topic || "Triggered via Zapier",
    status: 'Pending' as any
  };
};
