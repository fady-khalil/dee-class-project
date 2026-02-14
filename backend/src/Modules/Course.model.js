import mongoose from "mongoose";
import generateSlug from "../utils/generateSlug.js";

// Reusable schema for api.video response
const videoSchema = new mongoose.Schema(
  {
    videoId: { type: String },
    title: { type: String },
    description: { type: String },
    duration: { type: Number },
    public: { type: Boolean, default: true },
    assets: {
      hls: String,
      iframe: String,
      player: String,
      thumbnail: String,
      mp4: String,
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { _id: false }
);

// Schema for series lessons
const seriesLessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    title_ar: { type: String },
    description: { type: String },
    description_ar: { type: String },
    video: videoSchema,
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

// Schema for chapter lessons (simpler - no description)
const chapterLessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    title_ar: { type: String },
    video: videoSchema,
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

// Schema for chapters
const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    title_ar: { type: String },
    lessons: [chapterLessonSchema],
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
    },
    // Course type: single, series, or playlist (chapter)
    course_type: {
      type: String,
      enum: ["single", "series", "playlist"],
      default: "single",
    },
    // English fields
    name: {
      type: String,
      required: true,
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
    description_ar: {
      type: String,
      trim: true,
    },
    // Images - English
    image: {
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
    // Images - Arabic
    image_ar: {
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
    // Mobile Images - English
    mobileImage: {
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
    // Mobile Images - Arabic
    mobileImage_ar: {
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
    // Reference to instructor
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
    },
    // Reference to category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseCategory",
      required: true,
    },
    // Price
    price: {
      type: Number,
      required: true,
    },
    // Display order within category (for admin sorting)
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Trailer video from api.video
    trailer: videoSchema,

    // Main video for single course type
    video: videoSchema,

    // Series lessons for series course type
    series: [seriesLessonSchema],

    // Chapters for playlist course type
    chapters: [chapterSchema],
  },
  { timestamps: true }
);

// Generate slug from the English name
courseSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = generateSlug(this.name);
  }
  next();
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
