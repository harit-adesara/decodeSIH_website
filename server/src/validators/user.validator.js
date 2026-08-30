import { body } from "express-validator";

export const createUserValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must provide a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["doctor", "health_assistant", "hospital"])
    .withMessage("Created role must be either 'doctor', 'health_assistant', or 'hospital'"),
  body("state").trim().notEmpty().withMessage("State assignment is required"),
  body("district").trim().notEmpty().withMessage("District assignment is required"),
  body("city").trim().notEmpty().withMessage("City assignment is required"),
  body("phone").optional().trim(),
  body("qualification").optional().trim(),
  body("hospitalOrClinic").optional().trim(),
];

export const createHealthAssistantValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Health Assistant name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must provide a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("district").trim().notEmpty().withMessage("District is required"),
  body("city").trim().notEmpty().withMessage("City / Village is required"),
  body("phone").optional().trim(),
  body("hospitalOrClinic").optional().trim(),
];
