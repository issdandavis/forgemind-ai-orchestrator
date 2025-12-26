
import { ResearchTask, TaskStatus } from "../types";

export interface SlackMessage {
  id: string;
  text: string;
  timestamp: Date;
  channel: string;
  type: 'status' | 'alert' | 'completion';
  actions?: { label: string; action: string; style: 'primary' | 'danger' | 'default' }[];
}

export const postToSlack = async (task: ResearchTask, type: SlackMessage['type']): Promise<SlackMessage> => {
  // Simulation of Slack API call
  return new Promise((resolve) => {
    setTimeout(() => {
      let text = "";
      let actions: SlackMessage['actions'] = [];

      switch (type) {
        case 'status':
          text = `🔄 *Task Update:* ${task.topic} is now in phase: \`${task.status}\``;
          break;
        case 'alert':
          text = `⚠️ *Action Required:* Task "${task.topic}" failed after retries.`;
          actions = [{ label: 'Manual Retry', action: 'retry', style: 'danger' }];
          break;
        case 'completion':
          text = `✅ *Build Complete:* Artifacts for "${task.topic}" are ready.`;
          actions = [
            { label: 'Approve & Deploy', action: 'approve', style: 'primary' },
            { label: 'View Details', action: 'view', style: 'default' }
          ];
          break;
      }

      console.log(`[Slack] Posting to #dev-updates: ${text}`);
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        text,
        timestamp: new Date(),
        channel: '#dev-updates',
        type,
        actions
      });
    }, 500);
  });
};

export const triggerZapierAutomation = async (task: ResearchTask): Promise<void> => {
  // Simulation of a Zapier Webhook trigger
  console.log(`[Zapier] Triggering automation for ${task.id}...`);
  await new Promise(r => setTimeout(r, 400));
};
