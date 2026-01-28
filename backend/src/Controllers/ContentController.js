import HeroSection from "../Modules/HeroSection.model.js";
import JoinUs from "../Modules/JoinUs.model.js";
import TrendingCourse from "../Modules/TrendingCourse.model.js";
import Course from "../Modules/Course.model.js";

// API.video API key
const API_VIDEO_KEY = process.env.API_VIDEO_KEY || "NuUpsgLaoFKP0njYMJ3ekBN78nb0HmgTYdzf6LW0mYw";

// =====================
// HERO SECTION
// =====================

// Get hero section (admin - returns all fields)
export const getHeroSection = async (req, res) => {
  try {
    let heroSection = await HeroSection.findOne({ singleton: "hero_section" });

    // Create default if not exists
    if (!heroSection) {
      heroSection = await HeroSection.create({ singleton: "hero_section" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Hero section retrieved successfully",
      data: heroSection,
    });
  } catch (error) {
    console.error("Error getting hero section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving hero section",
      data: error.message,
    });
  }
};

// Update hero section
export const updateHeroSection = async (req, res) => {
  try {
    const { title, title_ar, text, text_ar, featured_courses } = req.body;

    let heroSection = await HeroSection.findOne({ singleton: "hero_section" });

    if (!heroSection) {
      heroSection = new HeroSection({ singleton: "hero_section" });
    }

    // Update fields
    if (title !== undefined) heroSection.title = title;
    if (title_ar !== undefined) heroSection.title_ar = title_ar;
    if (text !== undefined) heroSection.text = text;
    if (text_ar !== undefined) heroSection.text_ar = text_ar;
    if (featured_courses !== undefined) heroSection.featured_courses = featured_courses;

    await heroSection.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Hero section updated successfully",
      data: heroSection,
    });
  } catch (error) {
    console.error("Error updating hero section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating hero section",
      data: error.message,
    });
  }
};

// Get all courses for selection (admin)
export const getCoursesForSelection = async (req, res) => {
  try {
    const courses = await Course.find()
      .select("_id name name_ar slug")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error getting courses for selection:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving courses",
      data: error.message,
    });
  }
};

// =====================
// JOIN US SECTION
// =====================

// Get join us section (admin - returns all fields)
export const getJoinUs = async (req, res) => {
  try {
    let joinUs = await JoinUs.findOne({ singleton: "join_us" });

    // Create default if not exists
    if (!joinUs) {
      joinUs = await JoinUs.create({ singleton: "join_us" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Join Us section retrieved successfully",
      data: joinUs,
    });
  } catch (error) {
    console.error("Error getting join us section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving join us section",
      data: error.message,
    });
  }
};

// Update join us section
export const updateJoinUs = async (req, res) => {
  try {
    const { title, title_ar, text, text_ar } = req.body;

    let joinUs = await JoinUs.findOne({ singleton: "join_us" });

    if (!joinUs) {
      joinUs = new JoinUs({ singleton: "join_us" });
    }

    // Update fields
    if (title !== undefined) joinUs.title = title;
    if (title_ar !== undefined) joinUs.title_ar = title_ar;
    if (text !== undefined) joinUs.text = text;
    if (text_ar !== undefined) joinUs.text_ar = text_ar;

    await joinUs.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Join Us section updated successfully",
      data: joinUs,
    });
  } catch (error) {
    console.error("Error updating join us section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating join us section",
      data: error.message,
    });
  }
};

// =====================
// TRENDING COURSE / REELS
// =====================

// Get trending course section (admin - returns all fields)
export const getTrendingCourse = async (req, res) => {
  try {
    let trendingCourse = await TrendingCourse.findOne({ singleton: "trending_course" });

    // Create default if not exists
    if (!trendingCourse) {
      trendingCourse = await TrendingCourse.create({ singleton: "trending_course" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Trending Course section retrieved successfully",
      data: trendingCourse,
    });
  } catch (error) {
    console.error("Error getting trending course section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving trending course section",
      data: error.message,
    });
  }
};

// Update trending course section (title, text only)
export const updateTrendingCourse = async (req, res) => {
  try {
    const { title, title_ar, text, text_ar } = req.body;

    let trendingCourse = await TrendingCourse.findOne({ singleton: "trending_course" });

    if (!trendingCourse) {
      trendingCourse = new TrendingCourse({ singleton: "trending_course" });
    }

    // Update fields
    if (title !== undefined) trendingCourse.title = title;
    if (title_ar !== undefined) trendingCourse.title_ar = title_ar;
    if (text !== undefined) trendingCourse.text = text;
    if (text_ar !== undefined) trendingCourse.text_ar = text_ar;

    await trendingCourse.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Trending Course section updated successfully",
      data: trendingCourse,
    });
  } catch (error) {
    console.error("Error updating trending course section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating trending course section",
      data: error.message,
    });
  }
};

// Fetch video data from api.video by videoId
export const fetchVideoData = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Video ID is required",
      });
    }

    const response = await fetch(`https://ws.api.video/videos/${videoId}`, {
      headers: {
        Authorization: `Bearer ${API_VIDEO_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        status: response.status,
        success: false,
        message: `Failed to fetch video: ${response.statusText}`,
      });
    }

    const videoData = await response.json();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Video data fetched successfully",
      data: {
        videoId: videoData.videoId,
        title: videoData.title,
        description: videoData.description || "",
        public: videoData.public,
        assets: {
          hls: videoData.assets?.hls,
          iframe: videoData.assets?.iframe,
          player: videoData.assets?.player,
          thumbnail: videoData.assets?.thumbnail,
          mp4: videoData.assets?.mp4,
        },
        createdAt: videoData.createdAt,
        updatedAt: videoData.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching video data:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while fetching video data",
      data: error.message,
    });
  }
};

// Add a reel to trending course
export const addReel = async (req, res) => {
  try {
    const { videoId, title, description, assets } = req.body;

    if (!videoId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Video ID is required",
      });
    }

    let trendingCourse = await TrendingCourse.findOne({ singleton: "trending_course" });

    if (!trendingCourse) {
      trendingCourse = new TrendingCourse({ singleton: "trending_course" });
    }

    // Check if reel already exists
    const existingReel = trendingCourse.reels.find((r) => r.videoId === videoId);
    if (existingReel) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "This video is already added as a reel",
      });
    }

    // Add new reel
    trendingCourse.reels.push({
      videoId,
      title: title || "",
      description: description || "",
      public: true,
      assets: assets || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await trendingCourse.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Reel added successfully",
      data: trendingCourse,
    });
  } catch (error) {
    console.error("Error adding reel:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while adding reel",
      data: error.message,
    });
  }
};

// Remove a reel from trending course
export const removeReel = async (req, res) => {
  try {
    const { videoId } = req.params;

    let trendingCourse = await TrendingCourse.findOne({ singleton: "trending_course" });

    if (!trendingCourse) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Trending course section not found",
      });
    }

    // Remove reel by videoId
    trendingCourse.reels = trendingCourse.reels.filter((r) => r.videoId !== videoId);

    await trendingCourse.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Reel removed successfully",
      data: trendingCourse,
    });
  } catch (error) {
    console.error("Error removing reel:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while removing reel",
      data: error.message,
    });
  }
};
