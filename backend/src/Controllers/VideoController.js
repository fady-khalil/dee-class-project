import multer from "multer";
import fs from "fs";
import path from "path";
import apiVideoService from "../Services/VideoService.js";
import Course from "../Modules/Course.model.js";

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads", "temp");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    console.log("Using upload directory:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Export multer instance configured for video uploads
export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("Received file:", file);

    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"), false);
    }
  },
});

// Get video details - public endpoint for trailers
export const getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    // First check if this is a course trailer and we already have the video data
    const course = await Course.findOne({ "trailer.videoId": videoId });

    if (course && course.trailer && course.trailer.videoId === videoId) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Video details retrieved from course",
        data: course.trailer,
      });
    }

    // Otherwise fetch directly from api.video
    const videoDetails = await apiVideoService.getVideoDetails(videoId);

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Video details retrieved successfully",
      data: videoDetails,
    });
  } catch (error) {
    console.error("Error getting video details:", error);

    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to get video details",
      error: error.message,
    });
  }
};

// Get a delegated upload token for a course trailer
export const getCourseTrailerUploadToken = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Course not found",
      });
    }

    const trailerUploadToken =
      await apiVideoService.createDelegatedUploadToken();

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Upload token generated successfully",
      data: {
        courseId: course._id,
        courseName: course.name,
        uploadToken: trailerUploadToken.token,
        ttl: trailerUploadToken.ttl,
      },
    });
  } catch (error) {
    console.error("Error generating upload token:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to generate upload token",
      error: error.message,
    });
  }
};

// Save video information after direct upload to api.video
export const saveCourseTrailerInfo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Video ID is required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Course not found",
      });
    }

    // Get video details from api.video
    const videoDetails = await apiVideoService.getVideoDetails(videoId);

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

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Video information saved successfully",
      data: {
        courseId: course._id,
        trailer: course.trailer,
      },
    });
  } catch (error) {
    console.error("Error saving video information:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to save video information",
      error: error.message,
    });
  }
};
