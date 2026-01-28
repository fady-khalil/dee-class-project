import CourseLike from "../Modules/CourseLike.model.js";
import CourseComment from "../Modules/CourseComment.model.js";
import Course from "../Modules/Course.model.js";
import User from "../Modules/User.model.js";

// Like a course
export const likeCourse = async (req, res) => {
  try {
    const { course_id, profile_id } = req.body;

    if (!course_id || !profile_id) {
      return res.status(400).json({
        success: false,
        message: "course_id and profile_id are required",
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

    // Verify user exists
    const user = await User.findById(profile_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already liked
    const existingLike = await CourseLike.findOne({
      course: course_id,
      user: profile_id,
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this course",
      });
    }

    // Create the like
    await CourseLike.create({
      course: course_id,
      user: profile_id,
    });

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

    if (!course_id || !profile_id) {
      return res.status(400).json({
        success: false,
        message: "course_id and profile_id are required",
      });
    }

    // Remove the like
    const result = await CourseLike.findOneAndDelete({
      course: course_id,
      user: profile_id,
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

    if (!course_id || !profile_id || !comment) {
      return res.status(400).json({
        success: false,
        message: "course_id, profile_id, and comment are required",
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

    // Verify user exists
    const user = await User.findById(profile_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create the comment
    const newComment = await CourseComment.create({
      course: course_id,
      user: profile_id,
      comment: comment.trim(),
    });

    // Get all comments for this course (oldest first as frontend reverses them)
    const comments = await CourseComment.find({ course: course_id })
      .populate("user", "fullName email")
      .sort({ createdAt: 1 });

    // Transform comments to match frontend expected format
    const transformedComments = comments.map((c) => ({
      id: c._id.toString(),
      comment: c.comment,
      profile_id: c.user._id.toString(),
      comment_by: c.user.fullName || c.user.email?.split("@")[0] || "Anonymous",
      my_comment: c.user._id.toString() === profile_id,
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

    // Transform comments to match frontend expected format
    const transformedComments = comments.map((c) => ({
      id: c._id.toString(),
      comment: c.comment,
      profile_id: c.user._id.toString(),
      comment_by: c.user.fullName || c.user.email?.split("@")[0] || "Anonymous",
      my_comment: profile_id ? c.user._id.toString() === profile_id : false,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));

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

    // Check if user has liked
    let isLiked = false;
    if (profile_id) {
      const userLike = await CourseLike.findOne({
        course: course_id,
        user: profile_id,
      });
      isLiked = !!userLike;
    }

    // Get comments
    const comments = await CourseComment.find({ course: course_id })
      .populate("user", "fullName email")
      .sort({ createdAt: 1 });

    // Transform comments
    const transformedComments = comments.map((c) => ({
      id: c._id.toString(),
      comment: c.comment,
      profile_id: c.user._id.toString(),
      comment_by: c.user.fullName || c.user.email?.split("@")[0] || "Anonymous",
      my_comment: profile_id ? c.user._id.toString() === profile_id : false,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));

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
export const getEngagementForCourse = async (courseId, userId = null) => {
  try {
    // Get like count
    const likeCount = await CourseLike.countDocuments({ course: courseId });

    // Check if user has liked
    let isLiked = false;
    if (userId) {
      const userLike = await CourseLike.findOne({
        course: courseId,
        user: userId,
      });
      isLiked = !!userLike;
    }

    // Get comments
    const comments = await CourseComment.find({ course: courseId })
      .populate("user", "fullName email")
      .sort({ createdAt: 1 });

    // Transform comments
    const transformedComments = comments.map((c) => ({
      id: c._id.toString(),
      comment: c.comment,
      profile_id: c.user._id.toString(),
      comment_by: c.user.fullName || c.user.email?.split("@")[0] || "Anonymous",
      my_comment: userId ? c.user._id.toString() === userId : false,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));

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
