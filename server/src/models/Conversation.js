import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },
    location: {
      state: { type: String, default: "All", trim: true },
      district: { type: String, default: "All", trim: true },
      city: { type: String, default: "All", trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
