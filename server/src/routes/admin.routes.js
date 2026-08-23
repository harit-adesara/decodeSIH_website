import { Router } from "express";
import {
  createUserByAdmin,
  getAllUsers,
  getAdminSystemStats,
  toggleUserStatus,
} from "../controllers/admin.controller.js";
import { triggerProactiveAnalysis } from "../controllers/proactiveEngine.controller.js";
import { createUserValidator } from "../validators/user.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

// All admin routes require JWT and Admin role
router.use(verifyJWT, authorizeRoles("admin"));

router.post("/create-user", createUserValidator, validate, createUserByAdmin);
router.get("/users", getAllUsers);
router.get("/stats", getAdminSystemStats);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.post("/trigger-proactive-analysis", triggerProactiveAnalysis);

export default router;
