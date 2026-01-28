import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  public: { type: Boolean, default: true },
  assets: {
    hls: { type: String },
    iframe: { type: String },
    player: { type: String },
    thumbnail: { type: String },
    mp4: { type: String },
  },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

const trendingCourseSchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: "trending_course",
      unique: true,
    },
    title: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    title_ar: {
      type: String,
      default: "",
    },
    text_ar: {
      type: String,
      default: "",
    },
    reels: [reelSchema],
  },
  { timestamps: true }
);

const TrendingCourse = mongoose.model("TrendingCourse", trendingCourseSchema);

export default TrendingCourse;
