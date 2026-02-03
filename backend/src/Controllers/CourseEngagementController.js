import CourseLike from "../Modules/CourseLike.model.js";
import CourseComment from "../Modules/CourseComment.model.js";
import Course from "../Modules/Course.model.js";
import User from "../Modules/User.model.js";

// Helper function to validate profile belongs to authenticated user
const validateProfileOwnership = async (userId, profileId) => {
  const user = await User.findById(userId);
  if (!user) {
    return { valid: false, error: "User not found", user: null, profile: null };
  }

  // Find the profile in user's profiles array
  const profile = user.profiles?.find(
    (p) => p._id.toString() === profileId.toString()
  );

  if (!profile) {
    return { valid: false, error: "Profile not found or does not belong to this user", user, profile: null };
  }

  return { valid: true, error: null, user, profile };
};

// Like a course
export const likeCourse = async (req, res) => {
  try {
    const { course_id, profile_id } = req.body;
    const authenticatedUserId = req.user?._id || req.user?.id;

    if (!course_id || !profile_id) {
      return res.status(400).json({
        success: false,
        message: "course_id and profile_id are required",
      });
    }

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify profile belongs to authenticated user
    const { valid, error, user } = await validateProfileOwnership(authenticatedUserId, profile_id);
    if (!valid) {
      return res.status(403).json({
        success: false,
        message: error,
      });
    }

    // Check if already liked by this profile (check both profile and user for backward compatibility)
    const existingLike = await CourseLike.findOne({
      course: course_id,
      $or: [{ profile: profile_id }, { user: authenticatedUserId, profile: { $exists: false } }],
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "This profile has already liked this course",
      });
    }

    // Create the like
    try {
      await CourseLike.create({
        course: course_id,
        profile: profile_id,
        user: authenticatedUserId,
      });
    } catch (err) {
      // Handle duplicate key error (in case of race condition or old index)
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "This profile has already liked this course",
        });
      }
      throw err;
    }

    // Get updated like count
    const likeCount = await CourseLike.countDocuments({ course: course_id });

    res.status(200).json({
      success: true,
      message: "Course liked successfully",
      data: {
        like_count: likeCount,
      },
    });
  } catch (error) {
    console.error("Error liking course:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while liking the course",
    });
  }
};

// Unlike a course
export const unlikeCourse = async (req, res) => {
  try {
    const { course_id, profile_id } = req.body;
    const authenticatedUserId = req.user?._id || req.user?.id;

    if (!course_id || !profile_id) {
      return res.status(400).json({
        success: false,
        message: "course_id and profile_id are required",
      });
    }

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify profile belongs to authenticated user
    const { valid, error } = await validateProfileOwnership(authenticatedUserId, profile_id);
    if (!valid) {
      return res.status(403).json({
        success: false,
        message: error,
      });
    }

    // Remove the like
    const result = await CourseLike.findOneAndDelete({
      course: course_id,
      profile: profile_id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }

    // Get updated like count
    const likeCount = await CourseLike.countDocuments({ course: course_id });

    res.status(200).json({
      success: true,
      message: "Course unliked successfully",
      data: {
        like_count: likeCount,
      },
    });
  } catch (error) {
    console.error("Error unliking course:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while unliking the course",
    });
  }
};

// Add a comment to a course
export const commentCourse = async (req, res) => {
  try {
    const { course_id, profile_id, comment } = req.body;
    const authenticatedUserId = req.user?._id || req.user?.id;

    if (!course_id || !profile_id || !comment) {
      return res.status(400).json({
        success: false,
        message: "course_id, profile_id, and comment are required",
      });
    }

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (comment.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment must be 500 characters or less",
      });
    }

    // Verify course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify profile belongs to authenticated user
    const { valid, error, profile } = await validateProfileOwnership(authenticatedUserId, profile_id);
    if (!valid) {
      return res.status(403).json({
        success: false,
        message: error,
      });
    }

    // Create the comment with profile info
    const newComment = await CourseComment.create({
      course: course_id,
      profile: profile_id,
      user: authenticatedUserId,
      profileName: profile.name,
      comment: comment.trim(),
    });

    // Get all comments for this course (oldest first as frontend reverses them)
    const comments = await CourseComment.find({ course: course_id })
      .sort({ createdAt: 1 });

    // Transform comments to match frontend expected format
    const transformedComments = comments.map((c) => ({
      id: c._id.toString(),
      comment: c.comment,
      profile_id: c.profile.toString(),
      comment_by: c.profileName || "Anonymous",
      my_comment: c.profile.toString() === profile_id,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: {
        comments: transformedComments,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the comment",
    });
  }
};

// Get comments for a course
export const getComments = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { profile_id } = req.query;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "course_id is required",
      });
    }

    const comments = await CourseComment.find({ course: course_id })
      .populate("user", "fullName email")
      .sort({ createdAt: 1 });

    // Transform comments (handle both old and new format)
    const transformedComments = comments.map((c) => {
      const commentProfileId = c.profile?.toString() || c.user?._id?.toString() || c.user?.toString();
      const commentBy = c.profileName || c.user?.fullName || c.user?.email?.split("@")[0] || "Anonymous";

      return {
        id: c._id.toString(),
        comment: c.comment,
        profile_id: commentProfileId,
        comment_by: commentBy,
        my_comment: profile_id ? commentProfileId === profile_id : false,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        comments: transformedComments,
        count: transformedComments.length,
      },
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while getting comments",
    });
  }
};

// Get engagement data for a course (likes count, comments, is_liked)
export const getCourseEngagement = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { profile_id } = req.query;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "course_id is required",
      });
    }

    // Get like count
    const likeCount = await CourseLike.countDocuments({ course: course_id });

    // Check if profile has liked (check both profile and user for backward compatibility)
    let isLiked = false;
    if (profile_id) {
      const profileLike = await CourseLike.findOne({
        course: course_id,
        $or: [{ profile: profile_id }, { user: profile_id }],
      });
      isLiked = !!profileLike;
    }

    // Get comments and populate user for old comments
    const comments = await CourseComment.find({ course: course_id })
      .populate("user", "fullName email")
      .sort({ createdAt: 1 });

    // Transform comments (handle both old and new format)
    const transformedComments = comments.map((c) => {
      const commentProfileId = c.profile?.toString() || c.user?._id?.toString() || c.user?.toString();
      const commentBy = c.profileName || c.user?.fullName || c.user?.email?.split("@")[0] || "Anonymous";

      return {
        id: c._id.toString(),
        comment: c.comment,
        profile_id: commentProfileId,
        comment_by: commentBy,
        my_comment: profile_id ? commentProfileId === profile_id : false,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        is_like: isLiked,
        like_count: likeCount,
        course_comments: transformedComments,
        course_comments_count: transformedComments.length,
      },
    });
  } catch (error) {
    console.error("Error getting course engagement:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while getting engagement data",
    });
  }
};

// Helper function to get engagement data (for use in CourseController)
// profileId is the profile's _id from the user's profiles array
export const getEngagementForCourse = async (courseId, profileId = null) => {
  try {
    // Get like count
    const likeCount = await CourseLike.countDocuments({ course: courseId });

    // Check if profile has liked (check both profile and user for backward compatibility)
    let isLiked = false;
    if (profileId) {
      const profileLike = await CourseLike.findOne({
        course: courseId,
        $or: [{ profile: profileId }, { user: profileId }],
      });
      isLiked = !!profileLike;
    }

    // Get comments and populate user for old comments without profileName
    const comments = await CourseComment.find({ course: courseId })
      .populate("user", "fullName email")
      .sort({ createdAt: 1 });

    // Transform comments (handle both old and new format)
    const transformedComments = comments.map((c) => {
      // Use profile if available, otherwise fall back to user (backward compatibility)
      const commentProfileId = c.profile?.toString() || c.user?._id?.toString() || c.user?.toString();
      const commentBy = c.profileName || c.user?.fullName || c.user?.email?.split("@")[0] || "Anonymous";

      return {
        id: c._id.toString(),
        comment: c.comment,
        profile_id: commentProfileId,
        comment_by: commentBy,
        my_comment: profileId ? commentProfileId === profileId : false,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      };
    });

    return {
      is_like: isLiked,
      like_count: likeCount,
      course_comments: transformedComments,
      course_comments_count: transformedComments.length,
    };
  } catch (error) {
    console.error("Error getting engagement for course:", error);
    return {
      is_like: false,
      like_count: 0,
      course_comments: [],
      course_comments_count: 0,
    };
  }
};
