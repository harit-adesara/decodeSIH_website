import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "health_assistant", "user"],
      default: "user",
    },
    state: {
      type: String,
      default: "All",
      trim: true,
    },
    district: {
      type: String,
      default: "All",
      trim: true,
    },
    city: {
      type: String,
      default: "All",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    qualification: {
      type: String,
      default: "",
    },
    hospitalOrClinic: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
      state: this.state,
      district: this.district,
      city: this.city,
    },
    process.env.JWT_SECRET || "bharat_swasthya_super_secret_jwt_key_2025",
    {
      expiresIn: process.env.JWT_EXPIRY || "7d",
    }
  );
};

export const User = mongoose.model("User", userSchema);
