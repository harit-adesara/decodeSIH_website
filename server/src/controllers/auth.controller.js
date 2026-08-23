import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.js";
import {
  sendEmail,
  registerEmailTemplate,
  forgotPasswordEmailTemplate,
} from "../utils/mail.js";

/**
 * @desc    Register citizen user & dispatch verification email
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, state, district, city, phone } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "An account with this email address already exists.");
  }

  // Public registration is strictly restricted to citizen role
  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "user",
    state: state || "All",
    district: district || "All",
    city: city || "All",
    phone: phone || "",
    isEmailVerified: false,
  });

  // Generate 24-hour email verification token
  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken(24 * 60 * 60 * 1000);
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save();

  // Construct client verification URL
  const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientBaseUrl}/?tab=login&verifyToken=${unHashedToken}`;

  // Dispatch branded verification email
  await sendEmail({
    email: user.email,
    subject: "Verify Your Account - Bharat Swasthya AI",
    html: registerEmailTemplate(user.name, verifyUrl, unHashedToken),
    text: `Namaste ${user.name},\n\nPlease verify your Bharat Swasthya AI account by visiting: ${verifyUrl}\n\nOr enter code: ${unHashedToken}\n\nThank you,\nMinistry of Health & Family Welfare`,
  });

  const createdUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    state: user.state,
    district: user.district,
    city: user.city,
    isEmailVerified: user.isEmailVerified,
  };

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: createdUser, verificationToken: process.env.NODE_ENV === "development" ? unHashedToken : undefined },
      "Registration successful! We have sent a verification email to your inbox. Please verify your account to log in."
    )
  );
});

/**
 * @desc    Verify user email via token (param or body)
 * @route   POST /api/v1/auth/verify-email or GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token || req.body.token || req.query.token;

  if (!token) {
    throw new ApiError(400, "Verification token is required.");
  }

  const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token. Please request a new one.");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpiry = null;
  await user.save({ validateBeforeSave: false });

  // Generate accessToken so the user is directly authenticated
  const authToken = user.generateAccessToken();

  const loggedInUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    state: user.state,
    district: user.district,
    city: user.city,
    phone: user.phone,
    isEmailVerified: true,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: loggedInUser, token: authToken },
      "Email verified successfully! Welcome to Bharat Swasthya AI."
    )
  );
});

/**
 * @desc    Resend email verification link
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email address is required.");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, "No account found with this email address.");
  }

  if (user.isEmailVerified) {
    return res.status(200).json(
      new ApiResponse(200, {}, "Your email address is already verified. You can sign in now.")
    );
  }

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken(24 * 60 * 60 * 1000);
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientBaseUrl}/?tab=login&verifyToken=${unHashedToken}`;

  await sendEmail({
    email: user.email,
    subject: "Verify Your Account - Bharat Swasthya AI",
    html: registerEmailTemplate(user.name, verifyUrl, unHashedToken),
    text: `Namaste ${user.name},\n\nPlease verify your Bharat Swasthya AI account by visiting: ${verifyUrl}\n\nOr enter code: ${unHashedToken}`,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { verificationToken: process.env.NODE_ENV === "development" ? unHashedToken : undefined },
      "A fresh verification email has been sent to your email address."
    )
  );
});

/**
 * @desc    Login user (unified login for all roles)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
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

  // Require email verification for registered users
  if (!user.isEmailVerified && user.role === "user") {
    throw new ApiError(
      403,
      "Please verify your email before logging in. A verification link was sent to your registered address."
    );
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
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: loggedInUser, token },
      `Welcome back ${user.name}!`
    )
  );
});

/**
 * @desc    Initiate forgot password request
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email address is required.");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // For security, do not leak whether email exists
    return res.status(200).json(
      new ApiResponse(200, {}, "If an account with that email exists, a password reset email has been sent.")
    );
  }

  // Generate 1-hour reset token
  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken(60 * 60 * 1000);
  user.forgetPasswordToken = hashedToken;
  user.forgetPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientBaseUrl}/?tab=login&resetToken=${unHashedToken}`;

  await sendEmail({
    email: user.email,
    subject: "Reset Your Password - Bharat Swasthya AI",
    html: forgotPasswordEmailTemplate(user.name, resetUrl, unHashedToken),
    text: `Hello ${user.name},\n\nClick the link below to reset your password:\n${resetUrl}\n\nOr enter code: ${unHashedToken}`,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { resetToken: process.env.NODE_ENV === "development" ? unHashedToken : undefined },
      "Password reset instructions have been dispatched to your email address."
    )
  );
});

/**
 * @desc    Reset password using reset token
 * @route   POST /api/v1/auth/reset-password or POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetForgetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token || req.body.token;
  const { newPassword } = req.body;

  if (!token) {
    throw new ApiError(400, "Password reset token is required.");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long.");
  }

  const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

  const user = await User.findOne({
    forgetPasswordToken: hashedToken,
    forgetPasswordExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token.");
  }

  user.password = newPassword;
  user.forgetPasswordToken = null;
  user.forgetPasswordExpiry = null;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Your password has been successfully reset. You can now log in with your new password.")
  );
});

/**
 * @desc    Change password (authenticated)
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required.");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long.");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User account not found.");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Password updated successfully.")
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

/**
 * @desc    Update current authenticated user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    state,
    district,
    city,
    hospitalOrClinic,
    qualification,
  } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User account not found.");
  }

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (state !== undefined) user.state = state.trim();
  if (district !== undefined) user.district = district.trim();
  if (city !== undefined) user.city = city.trim();

  if (hospitalOrClinic !== undefined) {
    user.hospitalOrClinic = hospitalOrClinic.trim();
  }
  if (qualification !== undefined) {
    user.qualification = qualification.trim();
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select("-password -emailVerificationToken -forgetPasswordToken");

  return res.status(200).json(
    new ApiResponse(200, { user: updatedUser }, "Profile updated successfully.")
  );
});

