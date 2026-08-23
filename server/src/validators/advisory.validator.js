import { body, query } from "express-validator";

export const createAdvisoryValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Advisory title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Advisory message is required")
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters"),
  body("targetState")
    .trim()
    .notEmpty()
    .withMessage("Target state is required"),
  body("targetDistrict")
    .optional()
    .trim(),
  body("targetCity")
    .optional()
    .trim(),
  body("diseaseCategory")
    .optional()
    .trim(),
  body("priority")
    .optional()
    .isIn(["info", "warning", "urgent", "critical"])
    .withMessage("Invalid priority level"),
];

export const queryAdvisoryValidator = [
  query("state").optional().trim(),
  query("district").optional().trim(),
  query("city").optional().trim(),
];
