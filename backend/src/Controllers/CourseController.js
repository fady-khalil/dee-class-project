import Course from "../Modules/Course.model.js";
import CourseCategory from "../Modules/CourseCategory.model.js";
import VideoService from "../Services/VideoService.js";
import { getEngagementForCourse } from "./CourseEngagementController.js";
import User from "../Modules/User.model.js";

// Helper function to normalize image path
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return null;

  if (typeof imagePath === "string") {
    if (imagePath.includes("uploads/")) {
      return imagePath;
    } else if (imagePath.includes("uploads\\")) {
      return imagePath.substring(imagePath.indexOf("uploads\\")).replace(/\\/g, "/");
    } else if (imagePath.includes("C:")) {
      const parts = imagePath.split("\\");
      const filename = parts[parts.length - 1];
      return `uploads/${filename}`;
    }
  }
  return imagePath;
};

// Transform course based on language
const transformCourseWithLanguage = (doc, lang = "en") => {
  const docObj = doc.toObject ? doc.toObject() : doc;

  // Get language-specific content
  const name = lang === "ar" && docObj.name_ar ? docObj.name_ar : docObj.name;
  const description = lang === "ar" && docObj.description_ar ? docObj.description_ar : docObj.description;

  // Get language-specific images
  let image = null;
  let mobileImage = null;

  if (lang === "ar") {
    image = docObj.image_ar?.data ? normalizeImagePath(docObj.image_ar.data) : normalizeImagePath(docObj.image?.data);
    mobileImage = docObj.mobileImage_ar?.data ? normalizeImagePath(docObj.mobileImage_ar.data) : normalizeImagePath(docObj.mobileImage?.data);
  } else {
    image = normalizeImagePath(docObj.image?.data);
    mobileImage = normalizeImagePath(docObj.mobileImage?.data);
  }

  // Transform category if populated
  let category = docObj.category;
  if (category && category.translations) {
    const catLangData = category.translations[lang] || category.translations.en;
    category = {
      _id: category._id,
      slug: category.slug,
      title: catLangData?.title || category.title,
    };
  }

  // Transform instructor if populated
  let instructor = docObj.instructor;
  if (instructor && instructor._id) {
    instructor = {
      _id: instructor._id,
      slug: instructor.slug,
      name: lang === "ar" && instructor.name_ar ? instructor.name_ar : instructor.name,
      bio: lang === "ar" && instructor.bio_ar ? instructor.bio_ar : instructor.bio,
      description: lang === "ar" && instructor.description_ar ? instructor.description_ar : instructor.description,
      profileImage: normalizeImagePath(instructor.profileImage?.data),
      facebook: instructor.facebook,
      instagram: instructor.instagram,
      linkedin: instructor.linkedin,
    };
  }

  // Include full trailer data if exists
  let trailer = null;
  if (docObj.trailer?.videoId) {
    trailer = docObj.trailer;
  }

  // Include main video for single course type
  let video = null;
  if (docObj.video?.videoId) {
    video = docObj.video;
  }

  // Transform series lessons with language support
  let series = [];
  if (docObj.series && docObj.series.length > 0) {
    series = docObj.series.map((lesson, index) => ({
      _id: lesson._id,
      title: lang === "ar" && lesson.title_ar ? lesson.title_ar : lesson.title,
      description: lang === "ar" && lesson.description_ar ? lesson.description_ar : lesson.description,
      series_video_id: lesson.video || null,
      order: lesson.order || index,
    }));
  }

  // Transform chapters with language support
  let chapters = [];
  if (docObj.chapters && docObj.chapters.length > 0) {
    chapters = docObj.chapters.map((chapter, chapterIndex) => ({
      _id: chapter._id,
      title: lang === "ar" && chapter.title_ar ? chapter.title_ar : chapter.title,
      order: chapter.order || chapterIndex,
      lessons: (chapter.lessons || []).map((lesson, lessonIndex) => ({
        _id: lesson._id,
        title: lang === "ar" && lesson.title_ar ? lesson.title_ar : lesson.title,
        video_id: lesson.video || null,
        order: lesson.order || lessonIndex,
      })),
    }));
  }

  // Build response based on course type
  const baseResponse = {
    _id: docObj._id,
    slug: docObj.slug,
    course_type: docObj.course_type || "single",
    name,
    description,
    image,
    mobileImage,
    instructor,
    category,
    price: docObj.price,
    trailer,
    createdAt: docObj.createdAt,
    updatedAt: docObj.updatedAt,
  };

  // Add type-specific fields
  if (docObj.course_type === "single") {
    baseResponse.api_video_object = video;
    baseResponse.thumbnail = video?.assets?.thumbnail || null;
  } else if (docObj.course_type === "series") {
    baseResponse.series = series;
  } else if (docObj.course_type === "playlist") {
    baseResponse.chapters = chapters;
  }

  return baseResponse;
};

// Helper to safely parse JSON from FormData
const safeJSONParse = (str) => {
  if (!str) return null;
  if (typeof str === "object") return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

// Create course
export const createCourse = async (req, res) => {
  try {
    const {
      name, name_ar, description, description_ar,
      category, instructor, price,
      course_type,
      trailer,  // Pre-fetched api.video data
      video,    // Pre-fetched api.video data for single course
      series,   // Array of lessons with pre-fetched video data
      chapters, // Array of chapters with lessons
    } = req.body;

    // Handle file uploads
    const files = req.files || {};

    let image = null;
    let image_ar = null;
    let mobileImage = null;
    let mobileImage_ar = null;

    if (files.image && files.image[0]) {
      const file = files.image[0];
      image = {
        data: `uploads/${file.filename || file.originalname}`,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    }

    if (files.image_ar && files.image_ar[0]) {
      const file = files.image_ar[0];
      image_ar = {
        data: `uploads/${file.filename || file.originalname}`,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    }

    if (files.mobileImage && files.mobileImage[0]) {
      const file = files.mobileImage[0];
      mobileImage = {
        data: `uploads/${file.filename || file.originalname}`,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    }

    if (files.mobileImage_ar && files.mobileImage_ar[0]) {
      const file = files.mobileImage_ar[0];
      mobileImage_ar = {
        data: `uploads/${file.filename || file.originalname}`,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    }

    // Parse JSON data from FormData (comes as strings)
    const parsedTrailer = safeJSONParse(trailer);
    const parsedVideo = safeJSONParse(video);
    const parsedSeries = safeJSONParse(series);
    const parsedChapters = safeJSONParse(chapters);

    // Build course object
    const courseData = {
      name,
      name_ar: name_ar || name,
      description,
      description_ar: description_ar || description,
      image,
      image_ar,
      mobileImage,
      mobileImage_ar,
      instructor: instructor || null,
      category,
      price,
      course_type: course_type || "single",
      trailer: parsedTrailer,
    };

    // Add type-specific data
    if (course_type === "single" && parsedVideo) {
      courseData.video = parsedVideo;
    } else if (course_type === "series" && parsedSeries) {
      courseData.series = parsedSeries.map((lesson, index) => ({
        title: lesson.title,
        title_ar: lesson.title_ar,
        description: lesson.description,
        description_ar: lesson.description_ar,
        video: lesson.video,
        order: index,
      }));
    } else if (course_type === "playlist" && parsedChapters) {
      courseData.chapters = parsedChapters.map((chapter, chapterIndex) => ({
        title: chapter.title,
        title_ar: chapter.title_ar,
        order: chapterIndex,
        lessons: (chapter.lessons || []).map((lesson, lessonIndex) => ({
          title: lesson.title,
          title_ar: lesson.title_ar,
          video: lesson.video,
          order: lessonIndex,
        })),
      }));
    }

    const course = new Course(courseData);
    const savedCourse = await course.save();

    res.status(201).json({
      status: 201,
      success: true,
      message: "Course created successfully",
      data: savedCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while creating the course",
      data: error.message,
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      name, name_ar, description, description_ar,
      category, instructor, price,
      course_type,
      trailer,  // Pre-fetched api.video data
      video,    // Pre-fetched api.video data for single course
      series,   // Array of lessons with pre-fetched video data
      chapters, // Array of chapters with lessons
    } = req.body;

    const course = await Course.findOne({ slug });

    if (!course) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    // Update basic fields
    if (name) course.name = name;
    if (name_ar) course.name_ar = name_ar;
    if (description !== undefined) course.description = description;
    if (description_ar !== undefined) course.description_ar = description_ar;
    if (category) course.category = category;
    if (instructor !== undefined) course.instructor = instructor || null;
    if (price !== undefined) course.price = price;
    if (course_type) course.course_type = course_type;

    // Parse JSON data from FormData
    const parsedTrailer = safeJSONParse(trailer);
    const parsedVideo = safeJSONParse(video);
    const parsedSeries = safeJSONParse(series);
    const parsedChapters = safeJSONParse(chapters);

    // Update trailer (pre-fetched data)
    if (trailer !== undefined) {
      course.trailer = parsedTrailer;
    }

    // Update video for single course type
    if (video !== undefined) {
      course.video = parsedVideo;
    }

    // Update series lessons
    if (series !== undefined && parsedSeries) {
      course.series = parsedSeries.map((lesson, index) => ({
        title: lesson.title,
        title_ar: lesson.title_ar,
        description: lesson.description,
        description_ar: lesson.description_ar,
        video: lesson.video,
        order: index,
      }));
    }

    // Update chapters
    if (chapters !== undefined && parsedChapters) {
      course.chapters = parsedChapters.map((chapter, chapterIndex) => ({
        title: chapter.title,
        title_ar: chapter.title_ar,
        order: chapterIndex,
        lessons: (chapter.lessons || []).map((lesson, lessonIndex) => ({
          title: lesson.title,
          title_ar: lesson.title_ar,
          video: lesson.video,
          order: lessonIndex,
        })),
      }));
    }

    // Handle file uploads
    const files = req.files || {};

    if (files.image && files.image[0]) {
      const file = files.image[0];
      course.image = {
        data: `uploads/${file.filename || file.originalname}`,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    } else if (req.body.removeImage === "true") {
      course.image = { data: null, contentType: null, filename: null };
    }

    if (files.image_ar && files.image_ar[0]) {
      const file = files.image_ar[0];
      course.image_ar = {
        data: `uploads/${file.filename || file.originalname}`,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    } else if (req.body.removeImage_ar === "true") {
      course.image_ar = { data: null, contentType: null, filename: null };
    }

    if (files.mobileImage && files.mobileImage[0]) {
      const file = files.mobileImage[0];
      course.mobileImage = {
        data: `uploads/${file.filename || file.originalname}`,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    } else if (req.body.removeMobileImage === "true") {
      course.mobileImage = { data: null, contentType: null, filename: null };
    }

    if (files.mobileImage_ar && files.mobileImage_ar[0]) {
      const file = files.mobileImage_ar[0];
      course.mobileImage_ar = {
        data: `uploads/${file.filename || file.originalname}`,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    } else if (req.body.removeMobileImage_ar === "true") {
      course.mobileImage_ar = { data: null, contentType: null, filename: null };
    }

    const updatedCourse = await course.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating the course",
      data: error.message,
    });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOneAndDelete({ slug });

    if (!course) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Course deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while deleting the course",
      data: error.message,
    });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const lang = req.language || req.query.lang || "en";
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const totalCount = await Course.countDocuments();

    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("category", "title translations slug")
      .populate("instructor", "name name_ar profileImage slug");

    const transformedCourses = courses.map((course) =>
      transformCourseWithLanguage(course, lang)
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Courses retrieved successfully",
      results: courses.length,
      data: transformedCourses,
      pagination: {
        totalCount,
        pageSize,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error getting courses:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving courses",
      data: error.message,
    });
  }
};

// Get course by slug
export const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const lang = req.language || req.query.lang || "en";
    // Get profile_id from query params (for subscribers with profiles)
    const profileId = req.query.profile_id || null;
    // Get user ID from authenticated user (for course purchasers without profiles)
    const userId = req.user?._id || req.user?.userId || req.user?.id || null;

    const course = await Course.findOne({ slug })
      .populate("category", "title translations slug")
      .populate("instructor", "name name_ar bio bio_ar description description_ar profileImage facebook instagram linkedin slug");

    if (!course) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    const transformedCourse = transformCourseWithLanguage(course, lang);

    // Get user's video progress data (completed videos and watching history)
    let completedVideos = [];
    let videoProgress = {}; // Map of videoId -> { timestamp, timeSlap }
    let isCourseCompleted = false;

    if (profileId || userId) {
      try {
        const user = await User.findById(userId);

        if (user) {
          // Check if user has active subscription and profile
          if (profileId && user.profiles && user.profiles.length > 0) {
            // SUBSCRIBER PATH: Get data from profile
            const profile = user.profiles.find(
              (p) => p._id.toString() === profileId
            );

            if (profile) {
              // Get completed videos for this course
              completedVideos = profile.completedVideos
                .filter((v) => v.courseId?.toString() === course._id.toString())
                .map((v) => v.videoId);

              // Get watching history (video progress) for this course
              profile.watchingHistory
                .filter((h) => h.courseId?.toString() === course._id.toString())
                .forEach((h) => {
                  videoProgress[h.videoId] = {
                    timestamp: h.timestamp || 0,
                    timeSlap: h.timeSlap || "00:00",
                  };
                });

              // Check if course is completed
              isCourseCompleted = profile.completedCourses?.some(
                (c) => c.courseId?.toString() === course._id.toString()
              ) || false;
            }
          } else {
            // COURSE PURCHASER PATH: Get data from user level
            // Get watching history for this course
            user.watchingHistory
              ?.filter((h) => h.courseId?.toString() === course._id.toString())
              .forEach((h) => {
                videoProgress[h.videoId] = {
                  timestamp: h.timestamp || 0,
                  timeSlap: h.timeSlap || "00:00",
                };
              });

            // Note: Course purchasers don't have completedVideos at user level
            // This could be added to the schema if needed
          }
        }
      } catch (userError) {
        console.error("Error fetching user progress:", userError);
        // Continue without progress data - don't fail the whole request
      }
    }

    // Add is_done flag to each lesson/series item based on completed videos
    if (transformedCourse.series && transformedCourse.series.length > 0) {
      transformedCourse.series = transformedCourse.series.map((item) => ({
        ...item,
        is_done: completedVideos.includes(item.series_video_id?.videoId),
        video_progress: videoProgress[item.series_video_id?.videoId] || null,
      }));
    }

    if (transformedCourse.chapters && transformedCourse.chapters.length > 0) {
      transformedCourse.chapters = transformedCourse.chapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) => ({
          ...lesson,
          is_done: completedVideos.includes(lesson.video_id?.videoId),
          video_progress: videoProgress[lesson.video_id?.videoId] || null,
        })),
      }));
    }

    // For single video course
    if (transformedCourse.api_video_object?.videoId) {
      transformedCourse.is_done = completedVideos.includes(transformedCourse.api_video_object.videoId);
      transformedCourse.video_progress = videoProgress[transformedCourse.api_video_object.videoId] || null;
    }

    // Get engagement data (likes, comments)
    const engagementData = await getEngagementForCourse(course._id, profileId || userId);

    // Get newly added courses
    const newlyAddedCourses = await Course.find({ _id: { $ne: course._id } })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("category", "title translations slug")
      .populate("instructor", "name name_ar profileImage slug");

    const transformedNewCourses = newlyAddedCourses.map((c) =>
      transformCourseWithLanguage(c, lang)
    );

    res.status(200).json({
      status: 200,
      success: true,
      message: "Course retrieved successfully",
      data: {
        ...transformedCourse,
        completed_videos: completedVideos,
        video_progress: videoProgress,
        is_course_completed: isCourseCompleted,
        course_engagement: engagementData,
        newlyAddedCourses: transformedNewCourses,
      },
    });
  } catch (error) {
    console.error("Error getting course:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving the course",
      data: error.message,
    });
  }
};

// Get course for admin (with all fields)
export const getCourseWithTranslations = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug })
      .populate("category", "title translations slug")
      .populate("instructor", "name name_ar profileImage slug");

    if (!course) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    // Normalize image paths
    const courseObj = course.toObject();
    if (courseObj.image?.data) courseObj.image.data = normalizeImagePath(courseObj.image.data);
    if (courseObj.image_ar?.data) courseObj.image_ar.data = normalizeImagePath(courseObj.image_ar.data);
    if (courseObj.mobileImage?.data) courseObj.mobileImage.data = normalizeImagePath(courseObj.mobileImage.data);
    if (courseObj.mobileImage_ar?.data) courseObj.mobileImage_ar.data = normalizeImagePath(courseObj.mobileImage_ar.data);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Course retrieved successfully",
      data: courseObj,
    });
  } catch (error) {
    console.error("Error getting course for admin:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving the course",
      data: error.message,
    });
  }
};

// Get courses by category
export const getCoursesByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const lang = req.language || req.query.lang || "en";
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const category = await CourseCategory.findOne({ slug: categorySlug });

    if (!category) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    const totalCount = await Course.countDocuments({ category: category._id });

    const courses = await Course.find({ category: category._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("category", "title translations slug")
      .populate("instructor", "name name_ar profileImage slug");

    const transformedCourses = courses.map((course) =>
      transformCourseWithLanguage(course, lang)
    );

    // Transform category
    const catLangData = category.translations?.[lang] || category.translations?.en;
    const transformedCategory = {
      _id: category._id,
      slug: category.slug,
      title: catLangData?.title || category.title,
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Courses retrieved successfully",
      data: {
        category: transformedCategory,
        courses: transformedCourses,
      },
      pagination: {
        totalCount,
        pageSize,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error getting courses by category:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving courses",
      data: error.message,
    });
  }
};

// Get category with all courses
export const getCategoryWithCourses = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const lang = req.language || req.query.lang || "en";

    const category = await CourseCategory.findOne({ slug: categorySlug });

    if (!category) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    const courses = await Course.find({ category: category._id })
      .populate("category", "title translations slug")
      .populate("instructor", "name name_ar profileImage slug");

    const transformedCourses = courses.map((course) =>
      transformCourseWithLanguage(course, lang)
    );

    // Transform category
    const catLangData = category.translations?.[lang] || category.translations?.en;
    const transformedCategory = {
      _id: category._id,
      slug: category.slug,
      title: catLangData?.title || category.title,
    };

    res.status(200).json({
      status: 200,
      success: true,
      message: "Category and courses retrieved successfully",
      data: {
        category: transformedCategory,
        courses: transformedCourses,
      },
    });
  } catch (error) {
    console.error("Error getting category with courses:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving category data",
      data: error.message,
    });
  }
};

// Save course trailer from api.video
export const saveTrailer = async (req, res) => {
  try {
    const { slug } = req.params;
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Video ID is required",
        data: null,
      });
    }

    const course = await Course.findOne({ slug });

    if (!course) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    // Get video details from api.video
    const videoDetails = await VideoService.getVideoDetails(videoId);

    if (!videoDetails) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Video not found in api.video",
        data: null,
      });
    }

    // Save trailer data to course
    course.trailer = {
      videoId: videoDetails.videoId,
      title: videoDetails.title,
      description: videoDetails.description,
      duration: videoDetails.duration,
      public: videoDetails.public,
      assets: {
        hls: videoDetails.assets?.hls,
        iframe: videoDetails.assets?.iframe,
        player: videoDetails.assets?.player,
        thumbnail: videoDetails.assets?.thumbnail,
        mp4: videoDetails.assets?.mp4,
      },
      createdAt: videoDetails.createdAt,
      updatedAt: videoDetails.updatedAt,
    };

    await course.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Trailer saved successfully",
      data: course.trailer,
    });
  } catch (error) {
    console.error("Error saving trailer:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: error.message || "An error occurred while saving the trailer",
      data: null,
    });
  }
};

// Remove course trailer
export const removeTrailer = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug });

    if (!course) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    course.trailer = null;
    await course.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Trailer removed successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error removing trailer:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while removing the trailer",
      data: error.message,
    });
  }
};

// Fetch video details from api.video (for dashboard form)
export const fetchVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Video ID is required",
        data: null,
      });
    }

    // Get video details from api.video
    const videoDetails = await VideoService.getVideoDetails(videoId);

    if (!videoDetails) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Video not found in api.video",
        data: null,
      });
    }

    // Return the full video details
    res.status(200).json({
      status: 200,
      success: true,
      message: "Video details fetched successfully",
      data: {
        videoId: videoDetails.videoId,
        title: videoDetails.title,
        description: videoDetails.description,
        duration: videoDetails.duration,
        public: videoDetails.public,
        assets: {
          hls: videoDetails.assets?.hls,
          iframe: videoDetails.assets?.iframe,
          player: videoDetails.assets?.player,
          thumbnail: videoDetails.assets?.thumbnail,
          mp4: videoDetails.assets?.mp4,
        },
        createdAt: videoDetails.createdAt,
        updatedAt: videoDetails.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching video details:", error);

    // Check if it's an api.video error with a specific code
    const statusCode = error.code || 500;
    let message = "An error occurred while fetching video details";

    if (statusCode === 404) {
      message = "Video not found in api.video. Please check the Video ID is correct.";
    } else if (error.problemDetails?.title) {
      message = error.problemDetails.title;
    } else if (error.message) {
      message = error.message;
    }

    res.status(statusCode).json({
      status: statusCode,
      success: false,
      message,
      data: null,
    });
  }
};
