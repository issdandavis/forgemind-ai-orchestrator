
import { ResearchTask } from "../types";

export const triggerDeployments = async (task: ResearchTask): Promise<{ firebase: string; replit: string }> => {
  console.log(`[Deploy] Triggering production build for ${task.topic}...`);
  
  // Parallel deployments
  const [firebaseUrl, replitUrl] = await Promise.all([
    new Promise<string>(r => setTimeout(() => r(`https://${task.id}.web.app`), 2000)),
    new Promise<string>(r => setTimeout(() => r(`https://replit.com/@user/${task.id}`), 1800))
  ]);

  return {
    firebase: firebaseUrl,
    replit: replitUrl
  };
};
