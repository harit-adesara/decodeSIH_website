import { Router } from "express";
import { getHealthStatus } from "../controllers/health.controller.js";

const router = Router();

// Health Check Endpoint
router.get("/", getHealthStatus);

export default router;
