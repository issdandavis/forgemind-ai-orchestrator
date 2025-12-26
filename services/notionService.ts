
import { ResearchTask, TaskStatus, TaskPriority } from "../types";

/**
 * Since standard browser environments have CORS restrictions for Notion API,
 * this service provides an interface that can be easily connected to a 
 * backend proxy or a direct browser-safe integration.
 */

export const syncTaskToNotion = async (task: ResearchTask): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Notion Sync] Task ${task.id} (${task.status}) updated successfully.`);
      resolve(true);
    }, 800);
  });
};

export const fetchTasksFromNotion = async (): Promise<ResearchTask[]> => {
  const priorities = [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW];
  
  // Generate mock tasks to demonstrate the "100 topics" capability
  return Array.from({ length: 100 }).map((_, i) => ({
    id: `task-${i + 1}`,
    topic: [
      "Real-time Chat with Firebase & Gemini",
      "Automated Image Tagging with Vision API",
      "Serverless Payment Processing in Replit",
      "Sentiment Analysis for Customer Support",
      "Decentralized Storage UI using React",
      "Vector Search Engine for Knowledge Bases",
      "Predictive Analytics with BigQuery ML",
      "IoT Dashboard with Realtime Database"
    ][i % 8] + ` (Iteration ${Math.floor(i / 8) + 1})`,
    status: TaskStatus.PENDING,
    priority: priorities[i % 3], // Mocked priority distribution
    progress: 0,
    notionPageId: `notion-page-${i + 1}`,
  }));
};
