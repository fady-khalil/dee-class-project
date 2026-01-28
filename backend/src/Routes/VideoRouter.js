import express from "express";
import { AdminIdentifier } from "../middlewares/AdminIdentifications.js";
import {
  getVideoDetails,
  getCourseTrailerUploadToken,
  saveCourseTrailerInfo,
} from "../Controllers/VideoController.js";

const router = express.Router();

// Admin routes for direct upload to api.video for course trailers
router.get(
  "/courses/:courseId/upload-token",
  AdminIdentifier,
  getCourseTrailerUploadToken
);
router.post(
  "/courses/:courseId/save-video",
  AdminIdentifier,
  saveCourseTrailerInfo
);

// Public route for getting video details
router.get("/:videoId", getVideoDetails);

export default router;
