import { Router } from "express";
import {
  createImmediateAlert,
  getImmediateAlerts,
  deleteImmediateAlert,
} from "../controllers/immAlert.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createImmediateAlert);
router.get("/", getImmediateAlerts);
router.delete("/:id", deleteImmediateAlert);

export default router;
