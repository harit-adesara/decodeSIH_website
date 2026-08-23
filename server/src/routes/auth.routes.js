import { Router } from "express";
import {
  loginUser,
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPasswordRequest,
  resetForgetPassword,
  changePassword,
  getCurrentUser,
  updateUserProfile,
} from "../controllers/auth.controller.js";
import {
  loginValidator,
  registerValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public Authentication & Email Verification Routes
router.post("/login", loginValidator, validate, loginUser);
router.post("/register", registerValidator, validate, registerUser);
router.post("/verify-email", verifyEmail);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPasswordValidator, validate, forgotPasswordRequest);
router.post("/reset-password", resetPasswordValidator, validate, resetForgetPassword);
router.post("/reset-password/:token", resetPasswordValidator, validate, resetForgetPassword);

// Protected Auth Routes
router.get("/me", verifyJWT, getCurrentUser);
router.put("/profile", verifyJWT, updateUserProfile);
router.patch("/profile", verifyJWT, updateUserProfile);
router.post("/change-password", verifyJWT, changePassword);

export default router;

