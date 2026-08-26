import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ImmediateAlert } from "../models/ImmediateAlert.js";
import { formatImmediateAlert } from "../services/gemini.service.js";

/**
 * @desc    Create an immediate viral alert (HA or Doctor, no approval needed)
 * @route   POST /api/v1/immediate-alerts
 * @access  Private (health_assistant, doctor)
 */
export const createImmediateAlert = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    diseaseName,
    symptoms,
    severity = "moderate",
    patientCount = 1,
    state,
    district,
    city,
  } = req.body;

  if (!title || !description || !diseaseName) {
    throw new ApiError(400, "Title, description, and disease name are required.");
  }

  if (!["health_assistant", "doctor"].includes(req.user.role)) {
    throw new ApiError(403, "Only Health Assistants and Doctors can publish immediate alerts.");
  }

  const symptomsArray = Array.isArray(symptoms)
    ? symptoms
    : typeof symptoms === "string"
      ? symptoms.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const alertState = state || req.user.state || "All";
  const alertDistrict = district || req.user.district || "All";
  const alertCity = city || req.user.city || "All";

  // Try Gemini formatting, fallback to empty
  let formattedAlert = "";
  try {
    formattedAlert = await formatImmediateAlert({
      title,
      diseaseName,
      symptoms: symptomsArray,
      severity,
      patientCount: Number(patientCount) || 1,
      state: alertState,
      district: alertDistrict,
      city: alertCity,
      description,
    });
  } catch {
    // Fallback: use raw description
  }

  const alert = await ImmediateAlert.create({
    title,
    description,
    diseaseName,
    symptoms: symptomsArray,
    severity,
    patientCount: Number(patientCount) || 1,
    state: alertState,
    district: alertDistrict,
    city: alertCity,
    publishedBy: req.user._id,
    publishedByName: req.user.name,
    publishedByRole: req.user.role,
    formattedAlert,
    isViral: true,
    isActive: true,
  });

  return res.status(201).json(
    new ApiResponse(201, { alert }, "Immediate viral alert published successfully.")
  );
});

/**
 * @desc    Get immediate alerts by location
 * @route   GET /api/v1/immediate-alerts
 * @access  Private
 */
export const getImmediateAlerts = asyncHandler(async (req, res) => {
  const { state, district, city } = req.query;

  const query = { isActive: true };
  if (state && state !== "All") query.state = state;
  if (district && district !== "All") query.district = district;
  if (city && city !== "All") query.city = city;

  const alerts = await ImmediateAlert.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .select("-__v");

  return res.status(200).json(
    new ApiResponse(200, { count: alerts.length, alerts }, "Immediate alerts retrieved.")
  );
});

/**
 * @desc    Delete own immediate alert
 * @route   DELETE /api/v1/immediate-alerts/:id
 * @access  Private (owner only)
 */
export const deleteImmediateAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alert = await ImmediateAlert.findOne({
    _id: id,
    publishedBy: req.user._id,
  });

  if (!alert) {
    throw new ApiError(404, "Alert not found or you don't have permission to delete it.");
  }

  await ImmediateAlert.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, "Immediate alert deleted successfully.")
  );
});
