import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HospitalWard, WARD_TYPES } from "../models/HospitalWard.js";

/**
 * @desc    Get list of supported Ward Types
 * @route   GET /api/v1/hospital/ward-types
 * @access  Private (Hospital / Authenticated)
 */
export const getWardTypes = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, { wardTypes: WARD_TYPES }, "Ward types retrieved successfully.")
  );
});

/**
 * @desc    Create a new ward in hospital
 * @route   POST /api/v1/hospital/wards
 * @access  Private (Hospital role)
 */
export const createWard = asyncHandler(async (req, res) => {
  const {
    wardType,
    customWardName,
    totalBeds,
    vacantBeds,
    pricePerDay,
    amenities,
    notes,
  } = req.body;

  if (Number(vacantBeds) > Number(totalBeds)) {
    throw new ApiError(400, "Vacant beds cannot exceed total beds in the ward.");
  }

  if (wardType === "Other" && (!customWardName || !customWardName.trim())) {
    throw new ApiError(400, "Please specify custom ward name when 'Other' is selected.");
  }

  const ward = await HospitalWard.create({
    hospital: req.user._id,
    hospitalName: req.user.name || req.user.hospitalOrClinic || "Healthcare Facility",
    state: req.user.state || "Maharashtra",
    district: req.user.district || "Pune",
    city: req.user.city || "All",
    phone: req.user.phone || "",
    address: req.user.hospitalOrClinic || "",
    wardType,
    customWardName: wardType === "Other" ? customWardName?.trim() : "",
    totalBeds: Number(totalBeds),
    vacantBeds: Number(vacantBeds),
    pricePerDay: Number(pricePerDay),
    amenities: Array.isArray(amenities)
      ? amenities
      : typeof amenities === "string" && amenities.trim()
      ? amenities.split(",").map((a) => a.trim())
      : [],
    notes: notes?.trim() || "",
    isActive: true,
  });

  return res.status(201).json(
    new ApiResponse(201, { ward }, "Hospital ward added successfully.")
  );
});

/**
 * @desc    Get all wards for the logged-in hospital
 * @route   GET /api/v1/hospital/wards
 * @access  Private (Hospital role)
 */
export const getMyWards = asyncHandler(async (req, res) => {
  const { wardType, search } = req.query;

  const query = { hospital: req.user._id };
  if (wardType && wardType !== "All") {
    query.wardType = wardType;
  }
  if (search) {
    query.$or = [
      { wardType: { $regex: search, $options: "i" } },
      { customWardName: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }

  const wards = await HospitalWard.find(query).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { count: wards.length, wards }, "Hospital wards retrieved successfully.")
  );
});

/**
 * @desc    Update ward details (beds, price, notes, etc.)
 * @route   PUT /api/v1/hospital/wards/:id
 * @access  Private (Hospital role)
 */
export const updateWard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    wardType,
    customWardName,
    totalBeds,
    vacantBeds,
    pricePerDay,
    amenities,
    notes,
    isActive,
  } = req.body;

  const ward = await HospitalWard.findOne({ _id: id, hospital: req.user._id });
  if (!ward) {
    throw new ApiError(404, "Ward not found or you are not authorized to edit this ward.");
  }

  const newTotalBeds = totalBeds !== undefined ? Number(totalBeds) : ward.totalBeds;
  const newVacantBeds = vacantBeds !== undefined ? Number(vacantBeds) : ward.vacantBeds;

  if (newVacantBeds > newTotalBeds) {
    throw new ApiError(400, "Vacant beds cannot exceed total beds in the ward.");
  }

  if (wardType !== undefined) ward.wardType = wardType;
  if (customWardName !== undefined) {
    ward.customWardName = ward.wardType === "Other" ? customWardName.trim() : "";
  }
  if (totalBeds !== undefined) ward.totalBeds = newTotalBeds;
  if (vacantBeds !== undefined) ward.vacantBeds = newVacantBeds;
  if (pricePerDay !== undefined) ward.pricePerDay = Number(pricePerDay);
  if (notes !== undefined) ward.notes = notes.trim();
  if (isActive !== undefined) ward.isActive = Boolean(isActive);

  if (amenities !== undefined) {
    ward.amenities = Array.isArray(amenities)
      ? amenities
      : typeof amenities === "string"
      ? amenities.split(",").map((a) => a.trim()).filter(Boolean)
      : [];
  }

  // Ensure latest hospital metadata
  ward.hospitalName = req.user.name || req.user.hospitalOrClinic || ward.hospitalName;
  ward.state = req.user.state || ward.state;
  ward.district = req.user.district || ward.district;
  ward.city = req.user.city || ward.city;
  ward.phone = req.user.phone || ward.phone;

  await ward.save();

  return res.status(200).json(
    new ApiResponse(200, { ward }, "Ward details updated successfully.")
  );
});

/**
 * @desc    Delete a ward
 * @route   DELETE /api/v1/hospital/wards/:id
 * @access  Private (Hospital role)
 */
export const deleteWard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ward = await HospitalWard.findOneAndDelete({ _id: id, hospital: req.user._id });
  if (!ward) {
    throw new ApiError(404, "Ward not found or you are not authorized to delete this ward.");
  }

  return res.status(200).json(
    new ApiResponse(200, { deletedId: id }, "Ward deleted successfully.")
  );
});

/**
 * @desc    Get stats for logged-in hospital dashboard
 * @route   GET /api/v1/hospital/stats
 * @access  Private (Hospital role)
 */
export const getHospitalStats = asyncHandler(async (req, res) => {
  const wards = await HospitalWard.find({ hospital: req.user._id, isActive: true });

  const totalWards = wards.length;
  const totalBeds = wards.reduce((sum, w) => sum + (w.totalBeds || 0), 0);
  const vacantBeds = wards.reduce((sum, w) => sum + (w.vacantBeds || 0), 0);
  const occupiedBeds = Math.max(0, totalBeds - vacantBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const avgPrice =
    totalWards > 0
      ? Math.round(wards.reduce((sum, w) => sum + (w.pricePerDay || 0), 0) / totalWards)
      : 0;

  // Breakdown by ward type
  const wardBreakdown = wards.map((w) => ({
    _id: w._id,
    displayName: w.displayName,
    wardType: w.wardType,
    totalBeds: w.totalBeds,
    vacantBeds: w.vacantBeds,
    occupiedBeds: w.occupiedBeds,
    pricePerDay: w.pricePerDay,
    occupancyRate: w.occupancyRate,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalWards,
        totalBeds,
        vacantBeds,
        occupiedBeds,
        occupancyRate,
        avgPrice,
        wardBreakdown,
      },
      "Hospital statistics retrieved successfully."
    )
  );
});
