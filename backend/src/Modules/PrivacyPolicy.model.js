import mongoose from "mongoose";

const privacyPolicySchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: "privacy_policy",
      unique: true,
    },
    content: {
      type: String,
      default: "",
    },
    content_ar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const PrivacyPolicy = mongoose.model("PrivacyPolicy", privacyPolicySchema);

export default PrivacyPolicy;
