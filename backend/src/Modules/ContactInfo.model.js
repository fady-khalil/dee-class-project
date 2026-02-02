import mongoose from "mongoose";

const socialMediaSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok", "whatsapp"],
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

const contactInfoSchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: "contact_info",
      unique: true,
    },
    pageTitle: {
      type: String,
      default: "",
    },
    pageTitle_ar: {
      type: String,
      default: "",
    },
    pageSubtitle: {
      type: String,
      default: "",
    },
    pageSubtitle_ar: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    address_ar: {
      type: String,
      default: "",
    },
    workingHours: {
      type: String,
      default: "",
    },
    workingHours_ar: {
      type: String,
      default: "",
    },
    socialMedia: [socialMediaSchema],
  },
  { timestamps: true }
);

const ContactInfo = mongoose.model("ContactInfo", contactInfoSchema);

export default ContactInfo;
