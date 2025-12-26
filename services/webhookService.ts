
import { ResearchTask } from "../types";

export const sendOutgoingWebhook = async (endpoint: string, payload: any): Promise<void> => {
  console.log(`[Webhook] Sending payload to ${endpoint}`, payload);
  // Simulated fetch
  await new Promise(r => setTimeout(r, 600));
};

export const handleIncomingEvent = (event: string, data: any, callback: (task: Partial<ResearchTask>) => void) => {
  console.log(`[Webhook] Received incoming event: ${event}`, data);
  // Route event
  if (event === 'ZAPIER_RETRY') {
    callback({ id: data.taskId, status: 'Pending' as any });
  }
};
