
import { ResearchTask, ProjectFeedback } from "../types";

export const syncToSheets = async (task: ResearchTask, feedback?: ProjectFeedback): Promise<void> => {
  console.log(`[Google Sheets] Updating master tracker with project: ${task.topic}`);
  if (feedback) {
    console.log(`[Google Sheets] Recording user rating: ${feedback.rating}/5`);
  }
  await new Promise(r => setTimeout(r, 800));
};
