import { body } from "express-validator";

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must provide a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
];

export const registerValidator = [
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
    .optional()
    .isIn(["user", "health_assistant", "doctor", "admin"])
    .withMessage("Invalid user role specified"),
  body("state").optional().trim(),
  body("district").optional().trim(),
  body("city").optional().trim(),
  body("phone").optional().trim(),
];
