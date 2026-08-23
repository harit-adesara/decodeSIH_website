import { body, query } from "express-validator";

export const createReportValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Report title is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Detailed description / clinical observations required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("suspectedDisease")
    .trim()
    .notEmpty()
    .withMessage("Suspected disease is required"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("district").trim().notEmpty().withMessage("District is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("severity")
    .optional()
    .isIn(["low", "moderate", "high", "critical"])
    .withMessage("Invalid severity value"),
  body("patientCount")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Patient count must be a positive integer"),
  body("isViral")
    .optional()
    .isBoolean()
    .withMessage("isViral must be a boolean"),
];

export const labelReportValidator = [
  body("doctorDiagnosis")
    .trim()
    .notEmpty()
    .withMessage("Doctor diagnosis is required"),
  body("confirmedDisease")
    .trim()
    .notEmpty()
    .withMessage("Confirmed disease name is required"),
  body("status")
    .trim()
    .isIn(["verified_labeled", "rejected", "pending_review"])
    .withMessage("Status must be verified_labeled, rejected, or pending_review"),
  body("doctorRemarks")
    .optional()
    .trim(),
  body("prescribedAction")
    .optional()
    .trim(),
  body("severity")
    .optional()
    .isIn(["low", "moderate", "high", "critical"])
    .withMessage("Invalid severity level"),
  body("isViral")
    .optional()
    .isBoolean()
    .withMessage("isViral must be a boolean"),
  body("isPublicAlert")
    .optional()
    .isBoolean()
    .withMessage("isPublicAlert must be a boolean"),
];

export const filterReportValidator = [
  query("state").optional().trim(),
  query("district").optional().trim(),
  query("city").optional().trim(),
  query("status").optional().trim(),
  query("isViral").optional().isBoolean(),
  query("search").optional().trim(),
];
