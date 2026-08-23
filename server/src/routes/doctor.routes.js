import { Router } from "express";
import {
  getDoctorReports,
  labelReport,
  createDoctorReport,
  createHealthAssistantByDoctor,
  createAdvisoryByDoctor,
  getDoctorAdvisories,
  getDoctorAnalytics,
} from "../controllers/doctor.controller.js";
import {
  createReportValidator,
  labelReportValidator,
  filterReportValidator,
} from "../validators/report.validator.js";
import { createHealthAssistantValidator } from "../validators/user.validator.js";
import { createAdvisoryValidator, queryAdvisoryValidator } from "../validators/advisory.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { uploadReportImage } from "../middleware/upload.middleware.js";

const router = Router();

// Doctor routes require JWT and Doctor (or Admin) role
router.use(verifyJWT, authorizeRoles("doctor", "admin"));

// Reports & Diagnostic Review
router.get("/reports", filterReportValidator, validate, getDoctorReports);
router.put("/reports/:id/label", labelReportValidator, validate, labelReport);
router.post("/reports", uploadReportImage.single("image"), createReportValidator, validate, createDoctorReport);

// Staff Management by Doctor
router.post(
  "/create-health-assistant",
  createHealthAssistantValidator,
  validate,
  createHealthAssistantByDoctor
);

// Doctor Advisories & Bulletins
router.post("/advisories", createAdvisoryValidator, validate, createAdvisoryByDoctor);
router.get("/advisories", queryAdvisoryValidator, validate, getDoctorAdvisories);

// Disease Analytics & Past Trends
router.get("/analytics", getDoctorAnalytics);

export default router;
