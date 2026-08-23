import { Router } from "express";
import {
  getViralDiseases,
  getProactiveAlerts,
  chatWithAiAssistant,
  getHelplineNumbers,
  getLocationsData,
  getPublicOverviewStats,
} from "../controllers/public.controller.js";

const router = Router();

// 3rd-party and Public API Endpoints (Open Access)
router.get("/viral-diseases", getViralDiseases);
router.get("/proactive-alerts", getProactiveAlerts);
router.get("/overview-stats", getPublicOverviewStats);
router.get("/helplines", getHelplineNumbers);
router.get("/locations", getLocationsData);
router.post("/chatbot", chatWithAiAssistant);

export default router;
