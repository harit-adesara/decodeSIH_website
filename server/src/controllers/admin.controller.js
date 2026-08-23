import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.js";
import { Report } from "../models/Report.js";
import { Advisory } from "../models/Advisory.js";
import { ProactiveAlert } from "../models/ProactiveAlert.js";
import { sendEmail, welcomeStaffEmailTemplate } from "../utils/mail.js";

/**
 * @desc    Admin creates Doctor or Health Assistant account
 * @route   POST /api/v1/admin/create-user
 * @access  Private (Admin only)
 */
export const createUserByAdmin = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    state,
    district,
    city,
    phone,
    qualification,
    hospitalOrClinic,
  } = req.body;

  if (!["doctor", "health_assistant"].includes(role)) {
    throw new ApiError(400, "Admin can only create accounts with role 'doctor' or 'health_assistant'.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, `An account with email '${email}' already exists.`);
  }

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
    state: state || "All",
    district: district || "All",
    city: city || "All",
    phone: phone || "",
    qualification: qualification || "",
    hospitalOrClinic: hospitalOrClinic || "",
    createdBy: req.user._id,
    isEmailVerified: true,
  });

  // Dispatch welcome email with login credentials
  await sendEmail({
    email: newUser.email,
    subject: `Official ${role === "doctor" ? "Doctor" : "Health Assistant"} Account Created - Bharat Swasthya AI`,
    html: welcomeStaffEmailTemplate(newUser.name, newUser.email, newUser.role, password),
    text: `Namaste ${newUser.name},\n\nYour ${role} account has been created on Bharat Swasthya AI.\nLogin Email: ${newUser.email}\nPassword: ${password}`,
  });

  const responseUser = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    state: newUser.state,
    district: newUser.district,
    city: newUser.city,
    phone: newUser.phone,
    qualification: newUser.qualification,
    hospitalOrClinic: newUser.hospitalOrClinic,
    createdAt: newUser.createdAt,
  };

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: responseUser },
      `${role === "doctor" ? "Doctor" : "Health Assistant"} account created successfully.`
    )
  );
});

/**
 * @desc    Get all users list with role/location filter
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, state, district, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (state && state !== "All") query.state = state;
  if (district && district !== "All") query.district = district;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("-password")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { count: users.length, users }, "Users retrieved successfully.")
  );
});

/**
 * @desc    Get System & Outbreak Statistics for Admin Dashboard
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin only)
 */
export const getAdminSystemStats = asyncHandler(async (req, res) => {
  const [
    totalDoctors,
    totalHealthAssistants,
    totalUsers,
    totalReports,
    labeledReports,
    pendingReports,
    viralReports,
    activeAdvisories,
    activeAlerts,
  ] = await Promise.all([
    User.countDocuments({ role: "doctor" }),
    User.countDocuments({ role: "health_assistant" }),
    User.countDocuments({ role: "user" }),
    Report.countDocuments(),
    Report.countDocuments({ status: "verified_labeled" }),
    Report.countDocuments({ status: "pending_review" }),
    Report.countDocuments({ isViral: true }),
    Advisory.countDocuments({ isActive: true }),
    ProactiveAlert.countDocuments({ isActive: true }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: {
          doctors: totalDoctors,
          healthAssistants: totalHealthAssistants,
          citizens: totalUsers,
          total: totalDoctors + totalHealthAssistants + totalUsers + 1,
        },
        reports: {
          total: totalReports,
          labeled: labeledReports,
          pending: pendingReports,
          viral: viralReports,
        },
        system: {
          activeAdvisories,
          activeAlerts,
        },
      },
      "Admin platform statistics retrieved."
    )
  );
});

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/v1/admin/users/:id/toggle-status
 * @access  Private (Admin only)
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.role === "admin") {
    throw new ApiError(400, "Cannot change status of an admin account.");
  }

  user.isActive = !user.isActive;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { _id: user._id, isActive: user.isActive },
      `User account ${user.isActive ? "activated" : "deactivated"} successfully.`
    )
  );
});
