import mongoose from "mongoose";

const expertApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    resume: {
      filename: { type: String },
      originalName: { type: String },
      path: { type: String },
      mimetype: { type: String },
      size: { type: Number },
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ExpertApplication = mongoose.model("ExpertApplication", expertApplicationSchema);

export default ExpertApplication;
