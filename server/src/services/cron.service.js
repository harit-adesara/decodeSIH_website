// Path: server\src\services\cron.service.js
import cron from "node-cron";
import { runProactiveOutbreakAnalysis } from "../controllers/proactiveEngine.controller.js";

/**
 * Initializes cron jobs for Bharat Swasthya AI
 * Runs daily at midnight (00:00) to aggregate reports and compute proactive disease outbreak alerts
 */
export const initCronJobs = () => {
  // Every day at midnight: '0 0 * * *'
  cron.schedule("0 0 * * *", async () => {
    try {
      await runProactiveOutbreakAnalysis();
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Cron outbreak analysis error:", error.message);
      }
    }
  });
};


