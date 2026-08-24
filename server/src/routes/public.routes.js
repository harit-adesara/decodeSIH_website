import { Router } from "express";
import {
  getViralDiseases,
  getViralDiseaseDetails,
  getProactiveAlerts,
  getProactiveAlertById,
  chatWithAiAssistant,
  getHelplineNumbers,
  getLocationsData,
  getPublicOverviewStats,
} from "../controllers/public.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// 3rd-party and Public Open Endpoints
router.get("/viral-diseases", getViralDiseases);
router.get("/viral-diseases/details", getViralDiseaseDetails);
router.get("/proactive-alerts", getProactiveAlerts);
router.get("/proactive-alerts/:id", getProactiveAlertById);
router.get("/overview-stats", getPublicOverviewStats);
router.get("/helplines", getHelplineNumbers);
router.get("/locations", getLocationsData);

// Protected AI Chatbot Endpoint (Authenticated Users Only)
router.post("/chatbot", verifyJWT, chatWithAiAssistant);

export default router;


