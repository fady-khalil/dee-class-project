import mongoose from "mongoose";
import generateSlug from "../utils/generateSlug.js";

const instructorSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
    },
    // English fields
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Arabic fields
    name_ar: {
      type: String,
      trim: true,
    },
    bio_ar: {
      type: String,
      trim: true,
    },
    description_ar: {
      type: String,
      trim: true,
    },
    // Profile image
    profileImage: {
      data: {
        type: String,
      },
      contentType: {
        type: String,
      },
      filename: {
        type: String,
      },
    },
    // Social links
    facebook: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Generate slug from the English name
instructorSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = generateSlug(this.name);
  }
  next();
});

const Instructor = mongoose.model("Instructor", instructorSchema);

export default Instructor;
