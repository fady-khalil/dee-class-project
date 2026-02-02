import mongoose from "mongoose";

const termsOfServiceSchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: "terms_of_service",
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

const TermsOfService = mongoose.model("TermsOfService", termsOfServiceSchema);

export default TermsOfService;
