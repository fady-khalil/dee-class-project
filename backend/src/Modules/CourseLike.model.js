import mongoose from "mongoose";

const courseLikeSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only like a course once
courseLikeSchema.index({ course: 1, user: 1 }, { unique: true });

const CourseLike = mongoose.model("CourseLike", courseLikeSchema);

export default CourseLike;
