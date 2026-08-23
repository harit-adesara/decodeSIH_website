import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Report } from "../models/Report.js";
import { Advisory } from "../models/Advisory.js";

/**
 * @desc    Health Assistant submits field disease report (Text + Optional Image + State/District/City)
 * @route   POST /api/v1/health-assistant/reports
 * @access  Private (Health Assistant, Doctor, Admin)
 */
export const createFieldReport = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    symptoms,
    suspectedDisease,
    isViral,
    severity = "moderate",
    patientCount = 1,
    state,
    district,
    city,
  } = req.body;

  let symptomsArray = [];
  if (Array.isArray(symptoms)) {
    symptomsArray = symptoms;
  } else if (typeof symptoms === "string") {
    try {
      const parsed = JSON.parse(symptoms);
      if (Array.isArray(parsed)) symptomsArray = parsed;
      else symptomsArray = symptoms.split(",").map((s) => s.trim()).filter(Boolean);
    } catch {
      symptomsArray = symptoms.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const imagePath = req.file ? `/uploads/reports/${req.file.filename}` : null;

  const report = await Report.create({
    title,
    description,
    symptoms: symptomsArray,
    suspectedDisease,
    isViral: isViral === "true" || isViral === true,
    severity,
    patientCount: Number(patientCount) || 1,
    image: imagePath,
    state: state || req.user.state,
    district: district || req.user.district,
    city: city || req.user.city,
    reporter: req.user._id,
    reporterRole: "health_assistant",
    status: "pending_review",
  });

  const populatedReport = await Report.findById(report._id).populate("reporter", "name email role");

  return res.status(201).json(
    new ApiResponse(201, { report: populatedReport }, "Grassroots disease report submitted successfully.")
  );
});

/**
 * @desc    Get reports submitted by this Health Assistant
 * @route   GET /api/v1/health-assistant/my-reports
 * @access  Private (Health Assistant)
 */
export const getMyReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const query = { reporter: req.user._id };

  if (status && status !== "All") query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reports, totalCount] = await Promise.all([
    Report.find(query)
      .populate("labeledBy", "name email qualification hospitalOrClinic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Report.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        reports,
      },
      "My reports fetched successfully."
    )
  );
});

/**
 * @desc    Get Doctor advisories applicable to the Health Assistant's location
 * @route   GET /api/v1/health-assistant/advisories
 * @access  Private (Health Assistant)
 */
export const getAdvisoriesForHA = asyncHandler(async (req, res) => {
  const userState = req.user.state || "All";
  const userDistrict = req.user.district || "All";
  const userCity = req.user.city || "All";

  const query = {
    isActive: true,
    $and: [
      { targetState: { $in: [userState, "All"] } },
      { targetDistrict: { $in: [userDistrict, "All"] } },
      { targetCity: { $in: [userCity, "All"] } },
    ],
  };

  const advisories = await Advisory.find(query)
    .populate("doctor", "name email qualification hospitalOrClinic")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { advisories }, "Applicable medical advisories retrieved.")
  );
});

/**
 * @desc    Health Assistant Grassroots Analytics & Trends
 * @route   GET /api/v1/health-assistant/analytics
 * @access  Private (Health Assistant)
 */
export const getHAAnalytics = asyncHandler(async (req, res) => {
  const userState = req.user.state;
  const userDistrict = req.user.district;

  const matchFilter = {};
  if (userState && userState !== "All") matchFilter.state = userState;
  if (userDistrict && userDistrict !== "All") matchFilter.district = userDistrict;

  // 1. Disease breakdown in their jurisdiction
  const diseaseBreakdown = await Report.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: { $ifNull: ["$confirmedDisease", "$suspectedDisease"] },
        totalCases: { $sum: "$patientCount" },
        reportCount: { $sum: 1 },
      },
    },
    { $sort: { totalCases: -1 } },
    { $limit: 8 },
  ]);

  // 2. Personal Submission Stats
  const [totalSubmitted, labeledCount, pendingCount] = await Promise.all([
    Report.countDocuments({ reporter: req.user._id }),
    Report.countDocuments({ reporter: req.user._id, status: "verified_labeled" }),
    Report.countDocuments({ reporter: req.user._id, status: "pending_review" }),
  ]);

  // 3. Weekly Trends
  const recentTrends = await Report.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        cases: { $sum: "$patientCount" },
        reports: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1, "_id.day": 1 } },
    { $limit: 14 },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        personalStats: {
          totalSubmitted,
          labeledCount,
          pendingCount,
        },
        diseaseBreakdown,
        recentTrends,
      },
      "Health Assistant grassroots analytics retrieved."
    )
  );
});
