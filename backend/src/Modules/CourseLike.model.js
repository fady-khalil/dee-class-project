import mongoose from "mongoose";

const courseLikeSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Store the profile ID (subdocument _id from user's profiles array)
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Not required for backward compatibility
    },
    // Also store the user ID for reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a profile can only like a course once
courseLikeSchema.index({ course: 1, profile: 1 }, { unique: true, sparse: true });

// Keep backward compatibility index but non-unique
courseLikeSchema.index({ course: 1, user: 1 });

const CourseLike = mongoose.model("CourseLike", courseLikeSchema);

// Drop old unique index if it exists and sync indexes
CourseLike.collection.dropIndex("course_1_user_1").catch(() => {
  // Ignore error if index doesn't exist
});

export default CourseLike;
