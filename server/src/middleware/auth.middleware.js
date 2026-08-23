import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";

/**
 * Verify JWT token middleware
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request. Authentication token missing.");
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "bharat_swasthya_super_secret_jwt_key_2025"
    );

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid access token or user not found.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User account has been deactivated.");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid or expired token.");
  }
});

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles ('admin', 'doctor', 'health_assistant', 'user')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }
    next();
  };
};
