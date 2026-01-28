import mongoose from "mongoose";
import generateSlug from "../utils/generateSlug.js";

// Translation schema for multilingual support
const translationSchema = {
  title: {
    type: String,
    required: true,
  },
};

// course category schema
const courseCategorySchema = new mongoose.Schema(
  {
    // Store translations for both languages
    translations: {
      en: translationSchema, // English content
      ar: translationSchema, // Arabic content
    },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

// Updated pre-save hook to generate slug from English title
courseCategorySchema.pre("save", function (next) {
  // If English title is modified, update the slug
  if (this.isModified("translations.en.title")) {
    this.slug = generateSlug(this.translations.en.title);
  }
  next();
});

const CourseCategory = mongoose.model("CourseCategory", courseCategorySchema);

export default CourseCategory;
