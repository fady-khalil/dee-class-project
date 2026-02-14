import mongoose from "mongoose";

const bottomBannerSchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: "bottom_banner",
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    registered_content: {
      type: String,
      default: "",
    },
    registered_content_ar: {
      type: String,
      default: "",
    },
    guest_content: {
      type: String,
      default: "",
    },
    guest_content_ar: {
      type: String,
      default: "",
    },
    app_store_url: {
      type: String,
      default: "",
    },
    play_store_url: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const BottomBanner = mongoose.model("BottomBanner", bottomBannerSchema);

export default BottomBanner;
