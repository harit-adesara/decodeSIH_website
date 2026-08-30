import { body } from "express-validator";
import { WARD_TYPES } from "../models/HospitalWard.js";

export const createWardValidator = [
  body("wardType")
    .trim()
    .notEmpty()
    .withMessage("Ward type is required")
    .isIn(WARD_TYPES)
    .withMessage("Invalid ward type selected"),
  body("customWardName")
    .optional()
    .trim()
    .custom((val, { req }) => {
      if (req.body.wardType === "Other" && (!val || val.trim().length === 0)) {
        throw new Error("Custom ward name is required when 'Other' is selected");
      }
      return true;
    }),
  body("totalBeds")
    .notEmpty()
    .withMessage("Total beds is required")
    .isInt({ min: 1 })
    .withMessage("Total beds must be a positive integer"),
  body("vacantBeds")
    .notEmpty()
    .withMessage("Vacant beds is required")
    .isInt({ min: 0 })
    .withMessage("Vacant beds must be 0 or a positive integer")
    .custom((val, { req }) => {
      if (Number(val) > Number(req.body.totalBeds)) {
        throw new Error("Vacant beds cannot exceed total beds");
      }
      return true;
    }),
  body("pricePerDay")
    .notEmpty()
    .withMessage("Price per day is required")
    .isFloat({ min: 0 })
    .withMessage("Price per day must be a non-negative number"),
  body("notes").optional().trim(),
  body("amenities").optional(),
];

export const updateWardValidator = [
  body("wardType")
    .optional()
    .trim()
    .isIn(WARD_TYPES)
    .withMessage("Invalid ward type selected"),
  body("customWardName").optional().trim(),
  body("totalBeds")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total beds must be a positive integer"),
  body("vacantBeds")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Vacant beds must be 0 or a positive integer"),
  body("pricePerDay")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price per day must be a non-negative number"),
  body("notes").optional().trim(),
  body("amenities").optional(),
  body("isActive").optional().isBoolean(),
];
