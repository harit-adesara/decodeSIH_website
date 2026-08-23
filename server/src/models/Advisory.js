import mongoose from "mongoose";

const advisorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Advisory title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Advisory message / guideline text is required"],
    },
    diseaseCategory: {
      type: String,
      default: "General Health",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["info", "warning", "urgent", "critical"],
      default: "warning",
    },
    targetState: {
      type: String,
      required: [true, "Target state is required"],
      trim: true,
    },
    targetDistrict: {
      type: String,
      default: "All",
      trim: true,
    },
    targetCity: {
      type: String,
      default: "All",
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

advisorySchema.index({ targetState: 1, targetDistrict: 1, targetCity: 1 });
advisorySchema.index({ createdAt: -1 });

export const Advisory = mongoose.model("Advisory", advisorySchema);
