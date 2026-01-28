import mongoose from "mongoose";

const courseCommentSchema = new mongoose.Schema(
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
    comment: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
courseCommentSchema.index({ course: 1, createdAt: -1 });

const CourseComment = mongoose.model("CourseComment", courseCommentSchema);

export default CourseComment;
