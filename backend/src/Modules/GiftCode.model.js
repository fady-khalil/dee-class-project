import mongoose from "mongoose";
import crypto from "crypto";

const giftCodeSchema = new mongoose.Schema(
  {
    // Unique gift code (e.g., GIFT-XXXX-XXXX)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // The plan being gifted
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    // Billing cycle for the gift (monthly or yearly)
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    // Duration in days (calculated from billing cycle)
    durationDays: {
      type: Number,
      required: true,
    },
    // User who purchased/gifted this code
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // User who redeemed this code (null until redeemed)
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Status of the gift code
    status: {
      type: String,
      enum: ["pending", "redeemed", "expired"],
      default: "pending",
    },
    // Stripe payment information
    stripeSessionId: {
      type: String,
      default: null,
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    // Amount paid (in smallest currency unit, e.g., halalas for SAR)
    amountPaid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "SAR",
    },
    // When the code expires (1 year from creation)
    expiresAt: {
      type: Date,
      required: true,
    },
    // When the code was redeemed
    redeemedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Generate a unique gift code
giftCodeSchema.statics.generateCode = function () {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars: I, O, 0, 1
  let code = "GIFT-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += "-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate a cryptographically secure code
giftCodeSchema.statics.generateSecureCode = function () {
  const randomBytes = crypto.randomBytes(6);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GIFT-";
  for (let i = 0; i < 4; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  code += "-";
  for (let i = 4; i < 8; i++) {
    code += chars[randomBytes[i % 6] % chars.length];
  }
  return code;
};

// Indexes
giftCodeSchema.index({ code: 1 }, { unique: true });
giftCodeSchema.index({ purchasedBy: 1 });
giftCodeSchema.index({ status: 1, expiresAt: 1 });

const GiftCode = mongoose.model("GiftCode", giftCodeSchema);

export default GiftCode;
