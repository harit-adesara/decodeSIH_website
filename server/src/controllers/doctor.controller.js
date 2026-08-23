import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.js";
import { Report } from "../models/Report.js";
import { Advisory } from "../models/Advisory.js";
import { sendEmail, welcomeStaffEmailTemplate } from "../utils/mail.js";

/**
 * @desc    Doctor searches and filters disease reports (by state, district, city, status, keywords)
 * @route   GET /api/v1/doctor/reports
 * @access  Private (Doctor, Admin)
 */
export const getDoctorReports = asyncHandler(async (req, res) => {
  const {
    state,
    district,
    city,
    status,
    isViral,
    severity,
    search,
    page = 1,
    limit = 50,
  } = req.query;

  const query = {};

  if (state && state !== "All") query.state = state;
  if (district && district !== "All") query.district = district;
  if (city && city !== "All") query.city = new RegExp(city, "i");
  if (status && status !== "All") query.status = status;
  if (severity && severity !== "All") query.severity = severity;
  if (isViral !== undefined && isViral !== "All") {
    query.isViral = isViral === "true" || isViral === true;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { suspectedDisease: { $regex: search, $options: "i" } },
      { confirmedDisease: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { symptoms: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reports, totalCount] = await Promise.all([
    Report.find(query)
      .populate("reporter", "name email role phone qualification hospitalOrClinic")
      .populate("labeledBy", "name email role qualification hospitalOrClinic")
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
      "Reports retrieved successfully."
    )
  );
});

/**
 * @desc    Doctor labels and diagnoses a submitted report
 * @route   PUT /api/v1/doctor/reports/:id/label
 * @access  Private (Doctor only)
 */
export const labelReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    doctorDiagnosis,
    confirmedDisease,
    doctorRemarks,
    prescribedAction,
    severity,
    isViral,
    isPublicAlert,
    status = "verified_labeled",
  } = req.body;

  const report = await Report.findById(id);
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  report.doctorDiagnosis = doctorDiagnosis;
  report.confirmedDisease = confirmedDisease || report.suspectedDisease;
  report.doctorRemarks = doctorRemarks || "";
  report.prescribedAction = prescribedAction || "";
  if (severity) report.severity = severity;
  if (typeof isViral === "boolean") report.isViral = isViral;
  if (typeof isPublicAlert === "boolean") report.isPublicAlert = isPublicAlert;
  report.status = status;
  report.labeledBy = req.user._id;
  report.labeledAt = new Date();

  await report.save();

  const populatedReport = await Report.findById(report._id)
    .populate("reporter", "name email role")
    .populate("labeledBy", "name email role qualification");

  return res.status(200).json(
    new ApiResponse(200, { report: populatedReport }, "Report clinically labeled and verified successfully.")
  );
});

/**
 * @desc    Doctor creates clinical disease report (with optional image)
 * @route   POST /api/v1/doctor/reports
 * @access  Private (Doctor only)
 */
export const createDoctorReport = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    symptoms,
    suspectedDisease,
    confirmedDisease,
    isViral,
    severity,
    patientCount,
    state,
    district,
    city,
    doctorRemarks,
    prescribedAction,
    isPublicAlert,
  } = req.body;

  let symptomsArray = [];
  if (Array.isArray(symptoms)) {
    symptomsArray = symptoms;
  } else if (typeof symptoms === "string") {
    symptomsArray = symptoms.split(",").map((s) => s.trim()).filter(Boolean);
  }

  const imagePath = req.file ? `/uploads/reports/${req.file.filename}` : null;

  const report = await Report.create({
    title,
    description,
    symptoms: symptomsArray,
    suspectedDisease,
    confirmedDisease: confirmedDisease || suspectedDisease,
    isViral: isViral === "true" || isViral === true,
    severity: severity || "moderate",
    patientCount: Number(patientCount) || 1,
    image: imagePath,
    state,
    district,
    city,
    reporter: req.user._id,
    reporterRole: "doctor",
    status: "verified_labeled",
    doctorDiagnosis: confirmedDisease || suspectedDisease,
    doctorRemarks: doctorRemarks || "Reported directly by medical doctor.",
    prescribedAction: prescribedAction || "",
    isPublicAlert: isPublicAlert === "true" || isPublicAlert === true,
    labeledBy: req.user._id,
    labeledAt: new Date(),
  });

  const populatedReport = await Report.findById(report._id).populate("reporter", "name email role");

  return res.status(201).json(
    new ApiResponse(201, { report: populatedReport }, "Doctor report registered successfully.")
  );
});

/**
 * @desc    Doctor creates Health Assistant account
 * @route   POST /api/v1/doctor/create-health-assistant
 * @access  Private (Doctor only)
 */
export const createHealthAssistantByDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, state, district, city, phone, hospitalOrClinic } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, `An account with email '${email}' already exists.`);
  }

  const healthAssistant = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: "health_assistant",
    state: state || req.user.state || "All",
    district: district || req.user.district || "All",
    city: city || "All",
    phone: phone || "",
    hospitalOrClinic: hospitalOrClinic || req.user.hospitalOrClinic || "",
    createdBy: req.user._id,
    isEmailVerified: true,
  });

  // Dispatch welcome email to health assistant
  await sendEmail({
    email: healthAssistant.email,
    subject: "Official Health Assistant Account Created - Bharat Swasthya AI",
    html: welcomeStaffEmailTemplate(healthAssistant.name, healthAssistant.email, "health_assistant", password),
    text: `Namaste ${healthAssistant.name},\n\nYour Health Assistant account has been created by ${req.user.name}.\nLogin Email: ${healthAssistant.email}\nPassword: ${password}`,
  });

  const responseUser = {
    _id: healthAssistant._id,
    name: healthAssistant.name,
    email: healthAssistant.email,
    role: healthAssistant.role,
    state: healthAssistant.state,
    district: healthAssistant.district,
    city: healthAssistant.city,
    createdAt: healthAssistant.createdAt,
  };

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: responseUser },
      "Health Assistant account created successfully by Doctor."
    )
  );
});

/**
 * @desc    Doctor attaches advisory/bulletin text to state, district, or city
 * @route   POST /api/v1/doctor/advisories
 * @access  Private (Doctor only)
 */
export const createAdvisoryByDoctor = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    diseaseCategory,
    priority = "warning",
    targetState,
    targetDistrict = "All",
    targetCity = "All",
  } = req.body;

  const advisory = await Advisory.create({
    title,
    message,
    diseaseCategory: diseaseCategory || "General Health",
    priority,
    targetState,
    targetDistrict: targetDistrict || "All",
    targetCity: targetCity || "All",
    doctor: req.user._id,
  });

  const populatedAdvisory = await Advisory.findById(advisory._id).populate(
    "doctor",
    "name email role qualification hospitalOrClinic"
  );

  return res.status(201).json(
    new ApiResponse(201, { advisory: populatedAdvisory }, "Doctor health advisory broadcasted successfully.")
  );
});

/**
 * @desc    Get advisories created by doctors
 * @route   GET /api/v1/doctor/advisories
 * @access  Private (Doctor, Admin)
 */
export const getDoctorAdvisories = asyncHandler(async (req, res) => {
  const { state, district, city } = req.query;
  const query = { isActive: true };

  if (state && state !== "All") query.targetState = { $in: [state, "All"] };
  if (district && district !== "All") query.targetDistrict = { $in: [district, "All"] };
  if (city && city !== "All") query.targetCity = { $in: [city, "All"] };

  const advisories = await Advisory.find(query)
    .populate("doctor", "name email role qualification hospitalOrClinic")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { advisories }, "Doctor advisories retrieved.")
  );
});

/**
 * @desc    Doctor & Epidemiological Analysis / Past Trends of Disease Reports & Labeled Data
 * @route   GET /api/v1/doctor/analytics
 * @access  Private (Doctor, Admin)
 */
export const getDoctorAnalytics = asyncHandler(async (req, res) => {
  const { state, district } = req.query;
  const matchFilter = {};

  if (state && state !== "All") matchFilter.state = state;
  if (district && district !== "All") matchFilter.district = district;

  // 1. Disease Breakdown (Top 10 Diagnosed / Suspected Diseases)
  const diseaseBreakdown = await Report.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: { $ifNull: ["$confirmedDisease", "$suspectedDisease"] },
        totalCases: { $sum: "$patientCount" },
        reportCount: { $sum: 1 },
        viralCount: { $sum: { $cond: ["$isViral", 1, 0] } },
      },
    },
    { $sort: { totalCases: -1 } },
    { $limit: 10 },
  ]);

  // 2. Status Breakdown (Verified Labeled vs Pending vs Rejected)
  const statusBreakdown = await Report.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        patientSum: { $sum: "$patientCount" },
      },
    },
  ]);

  // 3. Severity Distribution
  const severityBreakdown = await Report.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$severity",
        count: { $sum: 1 },
      },
    },
  ]);

  // 4. Monthly / Timeline Outbreak Trends (Past 6 months)
  const timelineTrends = await Report.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        cases: { $sum: "$patientCount" },
        viralCases: { $sum: { $cond: ["$isViral", "$patientCount", 0] } },
        reports: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    { $limit: 30 },
  ]);

  // 5. District Hotspots
  const districtHotspots = await Report.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$district",
        totalCases: { $sum: "$patientCount" },
        reportCount: { $sum: 1 },
        highSeverityCount: {
          $sum: { $cond: [{ $in: ["$severity", ["high", "critical"]] }, 1, 0] },
        },
      },
    },
    { $sort: { totalCases: -1 } },
    { $limit: 10 },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        diseaseBreakdown,
        statusBreakdown,
        severityBreakdown,
        timelineTrends,
        districtHotspots,
      },
      "Epidemiological analysis and trends computed successfully."
    )
  );
});
