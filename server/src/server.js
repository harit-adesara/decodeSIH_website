import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";
import { initCronJobs } from "./services/cron.service.js";

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
connectDB()
  .then(() => {
    // Initialize Daily Proactive Outbreak Cron Job
    initCronJobs();

    app.listen(PORT, () => {
      console.log(`
=====================================================
🇮🇳 BHARAT SWASTHYA AI - SERVER RUNNING
=====================================================
📡 Port:        http://localhost:${PORT}
🩺 API Base:    http://localhost:${PORT}/api/v1
🛡️ Health:      http://localhost:${PORT}/health
📁 Uploads:     http://localhost:${PORT}/uploads
⏰ Cron:        Active (Daily 00:00 Outbreak Forecasts)
=====================================================
      `);
    });
  })
  .catch((err) => {
    console.error("❌ Fatal Error: Database connection failed.", err);
    process.exit(1);
  });
