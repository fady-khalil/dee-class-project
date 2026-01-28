import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Plan title is required"],
      trim: true,
    },
    title_ar: {
      type: String,
      required: [true, "Arabic plan title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    description_ar: {
      type: String,
      default: "",
      trim: true,
    },
    // Monthly pricing
    monthlyPrice: {
      type: Number,
      required: [true, "Monthly price is required"],
      min: 0,
    },
    monthlyStripePriceId: {
      type: String,
      required: [true, "Monthly Stripe Price ID is required"],
      trim: true,
    },
    // Yearly pricing
    yearlyPrice: {
      type: Number,
      required: [true, "Yearly price is required"],
      min: 0,
    },
    yearlyStripePriceId: {
      type: String,
      required: [true, "Yearly Stripe Price ID is required"],
      trim: true,
    },
    currency: {
      type: String,
      default: "SAR",
      enum: ["SAR", "USD", "EUR"],
    },
    // Features list (displayed as bullet points)
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    features_ar: [
      {
        type: String,
        trim: true,
      },
    ],
    // Profile limits (like Netflix)
    profilesAllowed: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 10,
    },
    // Offline download permission
    canDownload: {
      type: Boolean,
      default: false,
    },
    // Plan status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Display order on frontend
    order: {
      type: Number,
      default: 0,
    },
    // Mark popular/recommended plan
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for active plans sorted by order
planSchema.index({ isActive: 1, order: 1 });

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
