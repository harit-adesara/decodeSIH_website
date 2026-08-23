import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Report title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Report clinical notes / description is required"],
    },
    symptoms: {
      type: [String],
      default: [],
    },
    suspectedDisease: {
      type: String,
      required: [true, "Suspected disease name is required"],
      trim: true,
    },
    confirmedDisease: {
      type: String,
      default: "",
      trim: true,
    },
    isViral: {
      type: Boolean,
      default: false,
    },
    severity: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "moderate",
    },
    patientCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    image: {
      type: String,
      default: null, // Image URL or path (optional)
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
      required: [true, "City / Village / Taluk is required"],
      trim: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporterRole: {
      type: String,
      enum: ["health_assistant", "doctor", "admin"],
      default: "health_assistant",
    },
    status: {
      type: String,
      enum: ["pending_review", "verified_labeled", "rejected"],
      default: "pending_review",
    },
    doctorDiagnosis: {
      type: String,
      default: "",
    },
    doctorRemarks: {
      type: String,
      default: "",
    },
    prescribedAction: {
      type: String,
      default: "",
    },
    isPublicAlert: {
      type: Boolean,
      default: false,
    },
    labeledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    labeledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for fast location and status queries
reportSchema.index({ state: 1, district: 1, city: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ isViral: 1 });
reportSchema.index({ createdAt: -1 });

export const Report = mongoose.model("Report", reportSchema);
