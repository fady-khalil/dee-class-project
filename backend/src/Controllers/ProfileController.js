import User from "../Modules/User.model.js";
import Course from "../Modules/Course.model.js";
import CourseLike from "../Modules/CourseLike.model.js";
import mongoose from "mongoose";

/**
 * Create a new profile for the user
 */
export const createProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { name, image } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Profile name is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has active subscription
    const hasActiveSubscription =
      user.subscription?.status === "active" &&
      user.subscription?.currentPeriodEnd &&
      new Date(user.subscription.currentPeriodEnd) > new Date();

    if (!hasActiveSubscription) {
      return res.status(403).json({
        success: false,
        message: "Active subscription required to create profiles",
      });
    }

    // Check profile limit
    const allowedProfiles = user.subscription?.profilesAllowed || 0;
    const currentProfiles = user.profiles?.length || 0;

    if (currentProfiles >= allowedProfiles) {
      return res.status(403).json({
        success: false,
        message: `Profile limit reached. Your plan allows ${allowedProfiles} profiles.`,
      });
    }

    // Create new profile
    const newProfile = {
      _id: new mongoose.Types.ObjectId(),
      name: name.trim(),
      avatar: image || null,
      createdAt: new Date(),
    };

    user.profiles.push(newProfile);
    await user.save();

    // Format profiles for response (with id field)
    const formattedProfiles = user.profiles.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      avatar: p.avatar,
      createdAt: p.createdAt,
    }));

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: {
        profiles: formattedProfiles,
      },
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create profile",
      error: error.message,
    });
  }
};

/**
 * Edit an existing profile
 */
export const editProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { id: profileId } = req.params;
    const { name, image } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Profile name is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profileIndex = user.profiles.findIndex(
      (p) => p._id.toString() === profileId
    );

    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Update profile
    user.profiles[profileIndex].name = name.trim();
    if (image !== undefined) {
      user.profiles[profileIndex].avatar = image;
    }

    await user.save();

    // Format profiles for response
    const formattedProfiles = user.profiles.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      avatar: p.avatar,
      createdAt: p.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        profiles: formattedProfiles,
      },
    });
  } catch (error) {
    console.error("Error editing profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/**
 * Delete a profile
 */
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { id: profileId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profileIndex = user.profiles.findIndex(
      (p) => p._id.toString() === profileId
    );

    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Remove profile
    user.profiles.splice(profileIndex, 1);
    await user.save();

    // Format profiles for response
    const formattedProfiles = user.profiles.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      avatar: p.avatar,
      createdAt: p.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data: {
        profiles: formattedProfiles,
      },
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile",
      error: error.message,
    });
  }
};

/**
 * Get all profiles for the user
 */
export const getProfiles = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;

    const user = await User.findById(userId).select("profiles subscription");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check subscription status
    const hasActiveSubscription =
      user.subscription?.status === "active" &&
      user.subscription?.currentPeriodEnd &&
      new Date(user.subscription.currentPeriodEnd) > new Date();

    // Format profiles for response
    const formattedProfiles = user.profiles.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      avatar: p.avatar,
      createdAt: p.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        profiles: formattedProfiles,
        allowedProfiles: hasActiveSubscription ? user.subscription?.profilesAllowed : 0,
        hasActiveSubscription,
      },
    });
  } catch (error) {
    console.error("Error getting profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profiles",
      error: error.message,
    });
  }
};

/**
 * Add a course to profile's saved list (My List)
 */
export const addToMyList = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id, course_id } = req.body;

    if (!profile_id || !course_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id and course_id are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has active subscription
    const hasActiveSubscription =
      user.subscription?.status === "active" &&
      user.subscription?.currentPeriodEnd &&
      new Date(user.subscription.currentPeriodEnd) > new Date();

    if (!hasActiveSubscription) {
      return res.status(403).json({
        success: false,
        message: "Active subscription required to save courses",
      });
    }

    // Find the profile
    const profile = user.profiles.find(
      (p) => p._id.toString() === profile_id
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
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

    // Check if course is already saved
    const alreadySaved = profile.savedCourses?.some(
      (sc) => sc.courseId.toString() === course_id
    );

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: "Course already in your list",
      });
    }

    // Add course to saved list
    if (!profile.savedCourses) {
      profile.savedCourses = [];
    }
    profile.savedCourses.push({
      courseId: course_id,
      savedAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Course added to your list",
      data: {
        savedCourses: profile.savedCourses,
      },
    });
  } catch (error) {
    console.error("Error adding to my list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add course to list",
      error: error.message,
    });
  }
};

/**
 * Remove a course from profile's saved list
 */
export const removeFromMyList = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id, course_id } = req.body;

    if (!profile_id || !course_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id and course_id are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profile = user.profiles.find(
      (p) => p._id.toString() === profile_id
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Remove course from saved list
    const courseIndex = profile.savedCourses?.findIndex(
      (sc) => sc.courseId.toString() === course_id
    );

    if (courseIndex === -1 || courseIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: "Course not found in your list",
      });
    }

    profile.savedCourses.splice(courseIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Course removed from your list",
      data: {
        savedCourses: profile.savedCourses,
      },
    });
  } catch (error) {
    console.error("Error removing from my list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove course from list",
      error: error.message,
    });
  }
};

/**
 * Get profile's saved courses list with full course data
 */
export const getMyList = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id } = req.query;
    const lang = req.language || "en";

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profile = user.profiles.find(
      (p) => p._id.toString() === profile_id
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Get course IDs from saved list
    const courseIds = profile.savedCourses?.map((sc) => sc.courseId) || [];

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Fetch full course data
    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate("instructor", "name name_ar image slug profileImage")
      .populate("category", "name name_ar slug")
      .lean();

    // Format courses based on language
    const isArabic = lang === "ar";
    const formattedCourses = courses.map((course) => {
      const savedInfo = profile.savedCourses.find(
        (sc) => sc.courseId.toString() === course._id.toString()
      );
      return {
        _id: course._id,
        id: course._id,
        slug: course.slug,
        name: isArabic && course.name_ar ? course.name_ar : course.name,
        description: isArabic && course.description_ar ? course.description_ar : course.description,
        course_type: course.course_type,
        price: course.price,
        image: course.image?.data || null,
        mobileImage: course.mobileImage?.data || null,
        trailer: course.trailer,
        instructor: course.instructor
          ? {
              _id: course.instructor._id,
              name: isArabic && course.instructor.name_ar ? course.instructor.name_ar : course.instructor.name,
              image: course.instructor.image || course.instructor.profileImage,
              slug: course.instructor.slug,
            }
          : null,
        category: course.category
          ? {
              _id: course.category._id,
              name: isArabic && course.category.name_ar ? course.category.name_ar : course.category.name,
              slug: course.category.slug,
            }
          : null,
        savedAt: savedInfo?.savedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedCourses,
    });
  } catch (error) {
    console.error("Error getting my list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get saved courses",
      error: error.message,
    });
  }
};

/**
 * Check if a course is in profile's saved list
 */
export const isInMyList = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id, course_id } = req.query;

    if (!profile_id || !course_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id and course_id are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profile = user.profiles.find(
      (p) => p._id.toString() === profile_id
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check if course is in saved list
    const isInList = profile.savedCourses?.some(
      (sc) => sc.courseId.toString() === course_id
    );

    res.status(200).json({
      success: true,
      data: {
        isInList: !!isInList,
      },
    });
  } catch (error) {
    console.error("Error checking my list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check saved courses",
      error: error.message,
    });
  }
};

/**
 * Get "For You" data for a profile - includes saved courses (my list)
 */
export const getProfileForYou = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id } = req.body;
    const lang = req.language || "en";

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profile = user.profiles.find(
      (p) => p._id.toString() === profile_id
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Get saved courses (my_list)
    const savedCourseIds = profile.savedCourses?.map((sc) => sc.courseId) || [];
    let myListCourses = [];

    if (savedCourseIds.length > 0) {
      const courses = await Course.find({ _id: { $in: savedCourseIds } })
        .populate("instructor", "name name_ar image slug profileImage")
        .populate("category", "name name_ar slug")
        .lean();

      const isArabic = lang === "ar";
      myListCourses = courses.map((course) => ({
        _id: course._id,
        id: course._id,
        slug: course.slug,
        name: isArabic && course.name_ar ? course.name_ar : course.name,
        course_type: course.course_type,
        image: course.image?.data || null,
        trailer: course.trailer,
        instructor: course.instructor
          ? {
              _id: course.instructor._id,
              name: isArabic && course.instructor.name_ar ? course.instructor.name_ar : course.instructor.name,
              image: course.instructor.image || course.instructor.profileImage,
              slug: course.instructor.slug,
            }
          : null,
      }));
    }

    const isArabic = lang === "ar";
    const formatCourse = (course) => ({
      _id: course._id,
      id: course._id,
      slug: course.slug,
      name: isArabic && course.name_ar ? course.name_ar : course.name,
      course_type: course.course_type,
      image: course.image?.data || null,
      trailer: course.trailer,
      instructor: course.instructor
        ? {
            _id: course.instructor._id,
            name: isArabic && course.instructor.name_ar ? course.instructor.name_ar : course.instructor.name,
            image: course.instructor.image || course.instructor.profileImage,
            slug: course.instructor.slug,
          }
        : null,
    });

    // 1. NEW ADDED - Latest 8 courses sorted by createdAt
    const newAddedCourses = await Course.find({})
      .populate("instructor", "name name_ar image slug profileImage")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // 2. RECOMMENDED COURSES - Algorithm based on saved and liked courses
    let recommendedCourses = [];

    try {
      // Get liked courses for this user from CourseLike collection
      const userLikes = await CourseLike.find({ user: userId }).select("course").lean();
      const likedCourseIds = userLikes.map(like => like.course);

      // Combine saved and liked course IDs (exclude duplicates)
      const savedIds = savedCourseIds.filter(id => id).map(id => id.toString());
      const likedIds = likedCourseIds.filter(id => id).map(id => id.toString());
      const userInteractedIds = [...new Set([...savedIds, ...likedIds])];

      if (userInteractedIds.length > 0) {
        // Get categories from saved and liked courses
        const interactedCourses = await Course.find({
          _id: { $in: userInteractedIds }
        }).select("category").lean();

        const categoryIds = [...new Set(
          interactedCourses
            .filter(c => c.category)
            .map(c => c.category.toString())
        )];

        if (categoryIds.length > 0) {
          // Get courses from same categories (excluding already saved/liked)
          const sameCategoryCourses = await Course.find({
            category: { $in: categoryIds },
            _id: { $nin: userInteractedIds }
          })
            .populate("instructor", "name name_ar image slug profileImage")
            .lean();

          // Shuffle and pick up to 8
          const shuffled = sameCategoryCourses.sort(() => Math.random() - 0.5);
          recommendedCourses = shuffled.slice(0, 8);
        }
      }

      // If not enough recommendations, fill with random courses (excluding saved/liked)
      if (recommendedCourses.length < 8) {
        const excludeIds = [
          ...savedIds,
          ...likedIds,
          ...recommendedCourses.map(c => c._id.toString())
        ];

        const randomCourses = await Course.find(
          excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {}
        )
          .populate("instructor", "name name_ar image slug profileImage")
          .lean();

        // Shuffle and fill remaining slots
        const shuffledRandom = randomCourses.sort(() => Math.random() - 0.5);
        const needed = 8 - recommendedCourses.length;
        recommendedCourses = [...recommendedCourses, ...shuffledRandom.slice(0, needed)];
      }

      // If STILL not enough (all courses are saved/liked), include any courses
      if (recommendedCourses.length < 8) {
        const currentIds = recommendedCourses.map(c => c._id.toString());
        const anyCourses = await Course.find(
          currentIds.length > 0 ? { _id: { $nin: currentIds } } : {}
        )
          .populate("instructor", "name name_ar image slug profileImage")
          .lean();

        const shuffledAny = anyCourses.sort(() => Math.random() - 0.5);
        const needed = 8 - recommendedCourses.length;
        recommendedCourses = [...recommendedCourses, ...shuffledAny.slice(0, needed)];
      }
    } catch (recError) {
      console.error("Error in recommendation algorithm:", recError);
      // Fallback: just get 8 random courses
      const randomCourses = await Course.find({})
        .populate("instructor", "name name_ar image slug profileImage")
        .limit(8)
        .lean();
      recommendedCourses = randomCourses;
    }

    // 3. CONTINUE WATCHING - Get videos in progress for this profile
    const watchingHistory = profile.watchingHistory || [];
    let continueWatching = [];

    if (watchingHistory.length > 0) {
      // Get course details for watching history
      const watchingCourseIds = [...new Set(watchingHistory.map((h) => h.courseId).filter(Boolean))];
      const watchingCourses = await Course.find({ _id: { $in: watchingCourseIds } })
        .populate("instructor", "name name_ar image slug profileImage")
        .lean();

      const watchingCoursesMap = {};
      watchingCourses.forEach((course) => {
        watchingCoursesMap[course._id.toString()] = course;
      });

      continueWatching = watchingHistory
        .sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt))
        .slice(0, 8) // Limit to 8 items
        .map((item) => {
          const course = item.courseId ? watchingCoursesMap[item.courseId.toString()] : null;
          return {
            videoId: item.videoId,
            timeSlap: item.timeSlap,
            timestamp: item.timestamp,
            lastWatchedAt: item.lastWatchedAt,
            courseSlug: item.courseSlug,
            course: course ? formatCourse(course) : null,
          };
        });
    }

    res.status(200).json({
      success: true,
      data: {
        continue_watching: continueWatching,
        recommended_courses: recommendedCourses.map(formatCourse),
        new_added: newAddedCourses.map(formatCourse),
        my_list: myListCourses,
      },
    });
  } catch (error) {
    console.error("Error getting profile for you data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get for you data",
      error: error.message,
    });
  }
};

/**
 * Get user's purchased courses with full course data
 */
export const getPurchasedCourses = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const lang = req.language || "en";

    const user = await User.findById(userId).select("purchasedItems");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get course IDs from purchased items
    const courseIds = user.purchasedItems?.courses?.map((c) => c.courseId) || [];

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Fetch full course data
    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate("instructor", "name name_ar image slug")
      .populate("category", "name name_ar slug")
      .lean();

    // Format courses based on language
    const formattedCourses = courses.map((course) => {
      const isArabic = lang === "ar";
      return {
        _id: course._id,
        id: course._id,
        slug: course.slug,
        name: isArabic && course.name_ar ? course.name_ar : course.name,
        description: isArabic && course.description_ar ? course.description_ar : course.description,
        course_type: course.course_type,
        price: course.price,
        image: course.image?.data || null,
        mobileImage: course.mobileImage?.data || null,
        trailer: course.trailer,
        instructor: course.instructor
          ? {
              _id: course.instructor._id,
              name: isArabic && course.instructor.name_ar ? course.instructor.name_ar : course.instructor.name,
              image: course.instructor.image,
              slug: course.instructor.slug,
            }
          : null,
        category: course.category
          ? {
              _id: course.category._id,
              name: isArabic && course.category.name_ar ? course.category.name_ar : course.category.name,
              slug: course.category.slug,
            }
          : null,
        purchasedAt: user.purchasedItems.courses.find(
          (c) => c.courseId.toString() === course._id.toString()
        )?.purchasedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedCourses,
    });
  } catch (error) {
    console.error("Error getting purchased courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get purchased courses",
      error: error.message,
    });
  }
};

/**
 * Save video watching history (continue watching feature)
 * Called when user exits video after reaching 20% threshold
 *
 * For subscribers (with active plan): uses profile_id → saves to profile.watchingHistory
 * For course purchasers (no plan): uses user_id → saves to user.watchingHistory
 */
export const saveVideoHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id, user_id, course_slug, video_id, time_slap, timestamp: bodyTimestamp } = req.body;

    if (!video_id) {
      return res.status(400).json({
        success: false,
        message: "video_id is required",
      });
    }

    // Need either profile_id (subscriber) or user_id (course purchaser)
    if (!profile_id && !user_id) {
      return res.status(400).json({
        success: false,
        message: "Either profile_id or user_id is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get course ID from slug
    let courseId = null;
    if (course_slug) {
      const course = await Course.findOne({ slug: course_slug }).select("_id");
      if (course) {
        courseId = course._id;
      }
    }

    // Parse time_slap to seconds (format: "MM:SS") or use timestamp from body
    let timestamp = bodyTimestamp || 0;
    if (!timestamp && time_slap) {
      const parts = time_slap.split(":");
      if (parts.length === 2) {
        timestamp = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    }

    const historyEntry = {
      courseId,
      courseSlug: course_slug,
      videoId: video_id,
      timeSlap: time_slap || "00:00",
      timestamp,
      lastWatchedAt: new Date(),
    };

    // SUBSCRIBER PATH: Save to profile's watchingHistory
    if (profile_id) {
      const profileIndex = user.profiles.findIndex(
        (p) => p._id.toString() === profile_id
      );

      if (profileIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      // Initialize watchingHistory if it doesn't exist
      if (!user.profiles[profileIndex].watchingHistory) {
        user.profiles[profileIndex].watchingHistory = [];
      }

      // Check if video already exists in watching history
      const historyIndex = user.profiles[profileIndex].watchingHistory.findIndex(
        (h) => h.videoId === video_id
      );

      if (historyIndex !== -1) {
        // Update existing entry
        Object.assign(user.profiles[profileIndex].watchingHistory[historyIndex], historyEntry);
      } else {
        // Add new entry
        user.profiles[profileIndex].watchingHistory.push(historyEntry);
      }
    }
    // COURSE PURCHASER PATH: Save to user's root-level watchingHistory
    else if (user_id) {
      // Initialize watchingHistory at user level if it doesn't exist
      if (!user.watchingHistory) {
        user.watchingHistory = [];
      }

      // Check if video already exists in watching history
      const historyIndex = user.watchingHistory.findIndex(
        (h) => h.videoId === video_id
      );

      if (historyIndex !== -1) {
        // Update existing entry
        Object.assign(user.watchingHistory[historyIndex], historyEntry);
      } else {
        // Add new entry
        user.watchingHistory.push(historyEntry);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Video history saved",
      data: {
        videoId: video_id,
        timeSlap: time_slap,
        timestamp,
      },
    });
  } catch (error) {
    console.error("Error saving video history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save video history",
      error: error.message,
    });
  }
};

/**
 * Mark a video as done/completed
 * Called when user reaches 75% of video
 */
export const markVideoAsDone = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id, course_id, video_id } = req.body;

    if (!profile_id || !video_id || !course_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id, course_id, and video_id are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profileIndex = user.profiles.findIndex(
      (p) => p._id.toString() === profile_id
    );

    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Initialize completedVideos if it doesn't exist
    if (!user.profiles[profileIndex].completedVideos) {
      user.profiles[profileIndex].completedVideos = [];
    }

    // Check if video is already marked as done
    const alreadyDone = user.profiles[profileIndex].completedVideos.some(
      (v) => v.videoId === video_id && v.courseId?.toString() === course_id
    );

    if (alreadyDone) {
      return res.status(200).json({
        success: true,
        message: "Video already marked as done",
        data: { videoId: video_id, courseId: course_id, alreadyDone: true },
      });
    }

    // Add video to completed list
    user.profiles[profileIndex].completedVideos.push({
      courseId: course_id,
      videoId: video_id,
      completedAt: new Date(),
    });

    // Remove from watching history since it's done
    if (user.profiles[profileIndex].watchingHistory) {
      user.profiles[profileIndex].watchingHistory =
        user.profiles[profileIndex].watchingHistory.filter(
          (h) => h.videoId !== video_id
        );
    }

    // Check if all videos in the course are done
    const course = await Course.findById(course_id).select("course_type video series chapters").lean();
    let courseCompleted = false;

    if (course) {
      // Get all video IDs based on course type
      let allCourseVideoIds = [];

      if (course.course_type === "single" && course.video?.videoId) {
        // Single course - has one video
        allCourseVideoIds = [course.video.videoId];
      } else if (course.course_type === "series" && course.series) {
        // Series course - has series array with video in each item
        allCourseVideoIds = course.series
          .map((item) => item.video?.videoId)
          .filter(Boolean);
      } else if (course.course_type === "playlist" && course.chapters) {
        // Playlist course - has chapters with lessons inside
        allCourseVideoIds = course.chapters
          .flatMap((chapter) => chapter.lessons || [])
          .map((lesson) => lesson.video?.videoId)
          .filter(Boolean);
      }

      if (allCourseVideoIds.length > 0) {
        // Get completed video IDs for this course
        const completedVideoIds = user.profiles[profileIndex].completedVideos
          .filter((v) => v.courseId?.toString() === course_id)
          .map((v) => v.videoId);

        // Check if all course videos are completed
        courseCompleted = allCourseVideoIds.every((vid) =>
          completedVideoIds.includes(vid)
        );

        if (courseCompleted) {
          // Initialize completedCourses if it doesn't exist
          if (!user.profiles[profileIndex].completedCourses) {
            user.profiles[profileIndex].completedCourses = [];
          }

          // Check if course is already in completed list
          const courseAlreadyDone = user.profiles[profileIndex].completedCourses.some(
            (c) => c.courseId?.toString() === course_id
          );

          if (!courseAlreadyDone) {
            user.profiles[profileIndex].completedCourses.push({
              courseId: course_id,
              completedAt: new Date(),
            });
          }
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: courseCompleted ? "Video and course marked as done" : "Video marked as done",
      data: {
        videoId: video_id,
        courseId: course_id,
        courseCompleted,
      },
    });
  } catch (error) {
    console.error("Error marking video as done:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark video as done",
      error: error.message,
    });
  }
};

/**
 * Get continue watching list for a profile
 */
export const getContinueWatching = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id } = req.query;
    const lang = req.language || "en";

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profile = user.profiles.find(
      (p) => p._id.toString() === profile_id
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const watchingHistory = profile.watchingHistory || [];

    if (watchingHistory.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Get course details for each watching history item
    const courseIds = [...new Set(watchingHistory.map((h) => h.courseId).filter(Boolean))];
    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate("instructor", "name name_ar image slug")
      .lean();

    const coursesMap = {};
    courses.forEach((course) => {
      coursesMap[course._id.toString()] = course;
    });

    const isArabic = lang === "ar";

    // Format watching history with course details
    const continueWatching = watchingHistory
      .sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt))
      .map((item) => {
        const course = item.courseId ? coursesMap[item.courseId.toString()] : null;
        return {
          videoId: item.videoId,
          timeSlap: item.timeSlap,
          timestamp: item.timestamp,
          lastWatchedAt: item.lastWatchedAt,
          courseSlug: item.courseSlug,
          course: course
            ? {
                _id: course._id,
                name: isArabic && course.name_ar ? course.name_ar : course.name,
                slug: course.slug,
                image: course.image?.data || null,
                trailer: course.trailer,
                instructor: course.instructor
                  ? {
                      name: isArabic && course.instructor.name_ar
                        ? course.instructor.name_ar
                        : course.instructor.name,
                      image: course.instructor.image,
                      slug: course.instructor.slug,
                    }
                  : null,
              }
            : null,
        };
      });

    res.status(200).json({
      success: true,
      data: continueWatching,
    });
  } catch (error) {
    console.error("Error getting continue watching:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get continue watching",
      error: error.message,
    });
  }
};

/**
 * Get video progress for a specific video (check if user should resume)
 */
export const getVideoProgress = async (req, res) => {
  console.log("=== getVideoProgress called ===");
  console.log("Query params:", req.query);
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id, video_id } = req.query;

    if (!profile_id || !video_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id and video_id are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profile = user.profiles.find(
      (p) => p._id.toString() === profile_id
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check if video is in watching history
    const watchingItem = profile.watchingHistory?.find(
      (h) => h.videoId === video_id
    );

    // Check if video is completed
    const isCompleted = profile.completedVideos?.some(
      (v) => v.videoId === video_id
    );

    res.status(200).json({
      success: true,
      data: {
        videoId: video_id,
        hasProgress: !!watchingItem,
        timeSlap: watchingItem?.timeSlap || "00:00",
        timestamp: watchingItem?.timestamp || 0,
        isCompleted,
      },
    });
  } catch (error) {
    console.error("Error getting video progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video progress",
      error: error.message,
    });
  }
};

/**
 * Sync completed courses - check all completed videos and mark courses as done if all videos are complete
 */
export const syncCompletedCourses = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id } = req.body;

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profileIndex = user.profiles.findIndex(
      (p) => p._id.toString() === profile_id
    );

    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const completedVideos = user.profiles[profileIndex].completedVideos || [];

    if (completedVideos.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No completed videos to sync",
        data: { syncedCourses: [] },
      });
    }

    // Get unique course IDs from completed videos
    const courseIds = [...new Set(completedVideos.map((v) => v.courseId?.toString()).filter(Boolean))];

    // Fetch all courses
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select("course_type video series chapters")
      .lean();

    // Initialize completedCourses if needed
    if (!user.profiles[profileIndex].completedCourses) {
      user.profiles[profileIndex].completedCourses = [];
    }

    const syncedCourses = [];

    for (const course of courses) {
      // Get all video IDs based on course type
      let allCourseVideoIds = [];

      if (course.course_type === "single" && course.video?.videoId) {
        allCourseVideoIds = [course.video.videoId];
      } else if (course.course_type === "series" && course.series) {
        allCourseVideoIds = course.series
          .map((item) => item.video?.videoId)
          .filter(Boolean);
      } else if (course.course_type === "playlist" && course.chapters) {
        allCourseVideoIds = course.chapters
          .flatMap((chapter) => chapter.lessons || [])
          .map((lesson) => lesson.video?.videoId)
          .filter(Boolean);
      }

      if (allCourseVideoIds.length === 0) continue;

      // Get completed video IDs for this course
      const completedVideoIds = completedVideos
        .filter((v) => v.courseId?.toString() === course._id.toString())
        .map((v) => v.videoId);

      // Check if all course videos are completed
      const allCompleted = allCourseVideoIds.every((vid) =>
        completedVideoIds.includes(vid)
      );

      if (allCompleted) {
        // Check if course is already in completed list
        const alreadyDone = user.profiles[profileIndex].completedCourses.some(
          (c) => c.courseId?.toString() === course._id.toString()
        );

        if (!alreadyDone) {
          user.profiles[profileIndex].completedCourses.push({
            courseId: course._id,
            completedAt: new Date(),
          });
          syncedCourses.push(course._id);
        }
      }
    }

    if (syncedCourses.length > 0) {
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: `Synced ${syncedCourses.length} course(s)`,
      data: { syncedCourses },
    });
  } catch (error) {
    console.error("Error syncing completed courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync completed courses",
      error: error.message,
    });
  }
};

/**
 * Get my progress - continue watching and completed courses
 */
export const getMyProgress = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { profile_id } = req.body;
    const lang = req.language || "en";

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the profile
    const profile = user.profiles.find(
      (p) => p._id.toString() === profile_id
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const isArabic = lang === "ar";

    // === CONTINUE WATCHING ===
    const watchingHistory = profile.watchingHistory || [];
    let continueWatching = [];

    if (watchingHistory.length > 0) {
      const courseIds = [...new Set(watchingHistory.map((h) => h.courseId).filter(Boolean))];
      const courses = await Course.find({ _id: { $in: courseIds } })
        .populate("instructor", "name name_ar image slug profileImage")
        .lean();

      const coursesMap = {};
      courses.forEach((course) => {
        coursesMap[course._id.toString()] = course;
      });

      continueWatching = watchingHistory
        .sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt))
        .map((item) => {
          const course = item.courseId ? coursesMap[item.courseId.toString()] : null;
          return {
            videoId: item.videoId,
            timeSlap: item.timeSlap,
            timestamp: item.timestamp,
            lastWatchedAt: item.lastWatchedAt,
            courseSlug: item.courseSlug,
            course: course
              ? {
                  _id: course._id,
                  name: isArabic && course.name_ar ? course.name_ar : course.name,
                  slug: course.slug,
                  course_type: course.course_type,
                  image: course.image?.data || null,
                  trailer: course.trailer,
                  instructor: course.instructor
                    ? {
                        name: isArabic && course.instructor.name_ar
                          ? course.instructor.name_ar
                          : course.instructor.name,
                        image: course.instructor.image || course.instructor.profileImage,
                        slug: course.instructor.slug,
                      }
                    : null,
                }
              : null,
          };
        })
        .filter((item) => item.course); // Filter out items without course data
    }

    // === COMPLETED COURSES ===
    const completedCoursesList = profile.completedCourses || [];
    let completedCourses = [];

    if (completedCoursesList.length > 0) {
      const completedCourseIds = completedCoursesList.map((c) => c.courseId).filter(Boolean);
      const courses = await Course.find({ _id: { $in: completedCourseIds } })
        .populate("instructor", "name name_ar image slug profileImage")
        .populate("category", "title translations slug")
        .lean();

      completedCourses = courses.map((course) => {
        const completionInfo = completedCoursesList.find(
          (c) => c.courseId?.toString() === course._id.toString()
        );
        return {
          _id: course._id,
          slug: course.slug,
          name: isArabic && course.name_ar ? course.name_ar : course.name,
          course_type: course.course_type,
          image: course.image?.data || null,
          trailer: course.trailer,
          completedAt: completionInfo?.completedAt,
          instructor: course.instructor
            ? {
                _id: course.instructor._id,
                name: isArabic && course.instructor.name_ar
                  ? course.instructor.name_ar
                  : course.instructor.name,
                image: course.instructor.image || course.instructor.profileImage,
                slug: course.instructor.slug,
              }
            : null,
          category: course.category
            ? {
                _id: course.category._id,
                slug: course.category.slug,
                title: isArabic && course.category.translations?.ar?.title
                  ? course.category.translations.ar.title
                  : course.category.title || course.category.translations?.en?.title,
              }
            : null,
        };
      });

      // Sort by completion date (most recent first)
      completedCourses.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    }

    res.status(200).json({
      status: 200,
      success: true,
      data: {
        continue_watching: continueWatching,
        completed_courses: completedCourses,
      },
    });
  } catch (error) {
    console.error("Error getting my progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get my progress",
      error: error.message,
    });
  }
};
