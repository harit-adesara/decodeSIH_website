// Path: server\src\services\cron.service.js
import cron from "node-cron";
import { runProactiveOutbreakAnalysis } from "../controllers/proactiveEngine.controller.js";

/**
 * Initializes cron jobs for Bharat Swasthya AI
 * Runs daily at midnight (00:00) to aggregate reports and compute proactive disease outbreak alerts
 */
export const initCronJobs = () => {
  console.log("⏰ Scheduling Bharat Swasthya Proactive Outbreak Cron Job (Runs every midnight at 00:00)...");

  // Every day at midnight: '0 0 * * *'
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 [CRON] Executing scheduled daily proactive disease outbreak analysis...");
    try {
      await runProactiveOutbreakAnalysis();
      console.log("✅ [CRON] Proactive disease outbreak analysis completed successfully.");
    } catch (error) {
      console.error("❌ [CRON] Error during proactive outbreak analysis:", error.message);
    }
  });
};


