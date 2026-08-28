import mongoose from "mongoose";

const immediateAlertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Alert title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    diseaseName: {
      type: String,
      required: [true, "Disease name is required"],
      trim: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    severity: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "moderate",
    },
    patientCount: {
      type: Number,
      min: 1,
      default: 1,
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
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publishedByName: {
      type: String,
      default: "",
    },
    publishedByRole: {
      type: String,
      enum: ["health_assistant", "doctor"],
      required: true,
    },
    formattedAlert: {
      type: String,
      default: "",
    },
    isViral: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

immediateAlertSchema.index({ state: 1, district: 1, city: 1 });
immediateAlertSchema.index({ isActive: 1 });
immediateAlertSchema.index({ publishedBy: 1 });

export const ImmediateAlert = mongoose.model("ImmediateAlert", immediateAlertSchema);
