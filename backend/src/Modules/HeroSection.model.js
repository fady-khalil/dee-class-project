import mongoose from "mongoose";

const heroSectionSchema = new mongoose.Schema(
  {
    // Singleton identifier
    singleton: {
      type: String,
      default: "hero_section",
      unique: true,
    },
    // English content
    title: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    // Arabic content
    title_ar: {
      type: String,
      default: "",
    },
    text_ar: {
      type: String,
      default: "",
    },
    // Selected courses for featured display
    featured_courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

const HeroSection = mongoose.model("HeroSection", heroSectionSchema);

export default HeroSection;
