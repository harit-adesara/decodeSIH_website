import mongoose from "mongoose";

const proactiveAlertSchema = new mongoose.Schema(
  {
    diseaseName: {
      type: String,
      required: [true, "Disease name is required"],
      trim: true,
    },
    isViral: {
      type: Boolean,
      default: false,
    },
    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high", "severe"],
      default: "moderate",
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    city: {
      type: String,
      default: "All",
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "Alert summary is required"],
    },
    symptomsToWatch: {
      type: [String],
      default: [],
    },
    recommendedPrecautions: {
      type: [String],
      default: [],
    },
    weatherFactors: {
      temperature: { type: String, default: "31°C" },
      humidity: { type: String, default: "78%" },
      rainfallRisk: { type: String, default: "Moderate to Heavy" },
      airQualityIndex: { type: String, default: "Moderate" },
      season: { type: String, default: "Monsoon" },
    },
    aiInsights: {
      type: String,
      default: "",
    },
    sourceDataCount: {
      reportsAnalyzed: { type: Number, default: 0 },
      advisoriesAnalyzed: { type: Number, default: 0 },
    },
    generatedBy: {
      type: String,
      enum: ["gemini_ai", "rule_engine", "doctor_consensus"],
      default: "gemini_ai",
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days ahead
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

proactiveAlertSchema.index({ state: 1, district: 1, city: 1 });
proactiveAlertSchema.index({ isViral: 1 });
proactiveAlertSchema.index({ riskLevel: 1 });

export const ProactiveAlert = mongoose.model("ProactiveAlert", proactiveAlertSchema);
