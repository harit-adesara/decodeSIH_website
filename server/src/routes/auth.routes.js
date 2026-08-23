import { Router } from "express";
import { loginUser, registerUser, getCurrentUser } from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", loginValidator, validate, loginUser);
router.post("/register", registerValidator, validate, registerUser);
router.get("/me", verifyJWT, getCurrentUser);

export default router;
