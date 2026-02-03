import mongoose from "mongoose";

const courseCommentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Store the profile ID (subdocument _id from user's profiles array)
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Not required for backward compatibility with old comments
    },
    // Also store the user ID for reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Store the profile name for display (denormalized for performance)
    profileName: {
      type: String,
      required: false, // Not required for backward compatibility with old comments
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
