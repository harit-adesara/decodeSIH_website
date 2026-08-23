import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.js";

/**
 * @desc    Login user (all 4 roles: admin, doctor, health_assistant, user)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password credentials.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password credentials.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Please contact an administrator.");
  }

  const token = user.generateAccessToken();

  const loggedInUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    state: user.state,
    district: user.district,
    city: user.city,
    phone: user.phone,
    qualification: user.qualification,
    hospitalOrClinic: user.hospitalOrClinic,
    createdAt: user.createdAt,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: loggedInUser, token },
      `Welcome back ${user.name}! Logged in as ${user.role}.`
    )
  );
});

/**
 * @desc    Register citizen user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "user", state, district, city, phone } = req.body;

  // Protect privileged role creation from public register
  const assignedRole = role === "user" ? "user" : "user";

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists.");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: assignedRole,
    state: state || "All",
    district: district || "All",
    city: city || "All",
    phone: phone || "",
  });

  const token = user.generateAccessToken();

  const createdUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    state: user.state,
    district: user.district,
    city: user.city,
  };

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: createdUser, token },
      "User account registered successfully."
    )
  );
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, { user: req.user }, "Current user profile fetched.")
  );
});
