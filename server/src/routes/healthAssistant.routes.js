import { Router } from "express";
import {
  createFieldReport,
  getMyReports,
  getAdvisoriesForHA,
  getHAAnalytics,
} from "../controllers/healthAssistant.controller.js";
import { createReportValidator } from "../validators/report.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { uploadReportImage } from "../middleware/upload.middleware.js";

const router = Router();

// Health Assistant routes require JWT and Health Assistant (or Doctor/Admin) role
router.use(verifyJWT, authorizeRoles("health_assistant", "doctor", "admin"));

router.post("/reports", uploadReportImage.single("image"), createReportValidator, validate, createFieldReport);
router.get("/my-reports", getMyReports);
router.get("/advisories", getAdvisoriesForHA);
router.get("/analytics", getHAAnalytics);

export default router;
