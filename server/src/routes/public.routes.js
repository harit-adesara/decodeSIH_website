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
  getProactiveAdvisory,
  getPublicHospitalBeds,
  getPublicHospitalDetails,
} from "../controllers/public.controller.js";
import { handleGuideChat, handleGuideSTT } from "../controllers/guide.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { uploadAudio } from "../middleware/upload.middleware.js";

const router = Router();

// 3rd-party and Public Open Endpoints
router.get("/viral-diseases", getViralDiseases);
router.get("/viral-diseases/details", getViralDiseaseDetails);
router.get("/proactive-alerts", getProactiveAlerts);
router.get("/proactive-alerts/:id", getProactiveAlertById);
router.get("/overview-stats", getPublicOverviewStats);
router.get("/helplines", getHelplineNumbers);
router.get("/locations", getLocationsData);
router.get("/hospital-beds", getPublicHospitalBeds);
router.get("/hospitals/:id/wards", getPublicHospitalDetails);

// Protected AI Chatbot Endpoint (Authenticated Users Only)
router.post("/chatbot", verifyJWT, chatWithAiAssistant);

// Proactive Advisory from External LLM
router.post("/proactive-advisory", getProactiveAdvisory);

// Website Guide LLM Chat & Sarvam STT Transcription
router.post("/guide", handleGuideChat);
router.post("/guide/stt", uploadAudio.any(), handleGuideSTT);

export default router;



