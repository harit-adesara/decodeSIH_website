import mongoose from "mongoose";

export const WARD_TYPES = [
  "General Ward",
  "Private Ward",
  "Semi-Private Ward",
  "ICU (Intensive Care Unit)",
  "ICCU (Intensive Cardiac Care Unit)",
  "Emergency / Casualty",
  "HDU (High Dependency Unit)",
  "Isolation Ward",
  "Pediatric Ward",
  "Neonatal ICU (NICU)",
  "Pediatric ICU (PICU)",
  "Maternity / Obstetric Ward",
  "Post-Operative / Recovery Ward",
  "Burns Ward",
  "Psychiatric Ward",
  "Other",
];

const hospitalWardSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Hospital reference is required"],
      index: true,
    },
    hospitalName: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    wardType: {
      type: String,
      required: [true, "Ward type is required"],
      enum: WARD_TYPES,
      trim: true,
      index: true,
    },
    customWardName: {
      type: String,
      trim: true,
      default: "",
    },
    totalBeds: {
      type: Number,
      required: [true, "Total number of beds is required"],
      min: [1, "Total beds must be at least 1"],
    },
    vacantBeds: {
      type: Number,
      required: [true, "Number of vacant beds is required"],
      min: [0, "Vacant beds cannot be negative"],
      validate: {
        validator: function (val) {
          return val <= this.totalBeds;
        },
        message: "Vacant beds cannot exceed total beds in the ward",
      },
    },
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price per day cannot be negative"],
      default: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for display ward name
hospitalWardSchema.virtual("displayName").get(function () {
  if (this.wardType === "Other" && this.customWardName) {
    return this.customWardName;
  }
  return this.wardType;
});

// Virtual for occupied beds
hospitalWardSchema.virtual("occupiedBeds").get(function () {
  return Math.max(0, this.totalBeds - this.vacantBeds);
});

// Virtual for occupancy percentage
hospitalWardSchema.virtual("occupancyRate").get(function () {
  if (this.totalBeds === 0) return 0;
  return Math.round(((this.totalBeds - this.vacantBeds) / this.totalBeds) * 100);
});

export const HospitalWard = mongoose.model("HospitalWard", hospitalWardSchema);
