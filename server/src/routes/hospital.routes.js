import { Router } from "express";
import {
  getWardTypes,
  createWard,
  getMyWards,
  updateWard,
  deleteWard,
  getHospitalStats,
} from "../controllers/hospital.controller.js";
import {
  createWardValidator,
  updateWardValidator,
} from "../validators/hospital.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Ward types can be read by authenticated users
router.get("/ward-types", verifyJWT, getWardTypes);

// Hospital-specific management routes (Hospital role only)
router.use(verifyJWT, authorizeRoles("hospital"));

router.get("/wards", getMyWards);
router.post("/wards", createWardValidator, validate, createWard);
router.put("/wards/:id", updateWardValidator, validate, updateWard);
router.delete("/wards/:id", deleteWard);
router.get("/stats", getHospitalStats);

export default router;
