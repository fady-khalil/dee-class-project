import express from "express";
import {
  createCourse,
  updateCourse,
  getCourses,
  getCourseBySlug,
  deleteCourse,
  getCategoryWithCourses,
  getCoursesByCategory,
  getCourseWithTranslations,
  saveTrailer,
  removeTrailer,
  fetchVideoDetails,
} from "../Controllers/CourseController.js";
import upload from "../upload/upload.js";
import { OptionalIdentifier } from "../middlewares/Identifications.js";
import { AdminIdentifier } from "../middlewares/AdminIdentifications.js";

const router = express.Router();

// Admin endpoints - require admin authentication
router.get(
  "/admin/:slug",
  AdminIdentifier,
  (req, res, next) => {
    req.query.admin = "true"; // Mark as admin request
    next();
  },
  getCourseBySlug
);

// Get all courses
router.get("/", getCourses);

// Get courses by category
router.get("/by-category/:categorySlug", getCoursesByCategory);

// Get category with all courses
router.get("/category/:categorySlug", getCategoryWithCourses);

// Get a specific course with translations
router.get(
  "/admin/translations/:slug",
  AdminIdentifier,
  getCourseWithTranslations
);

// Fetch video details from api.video - requires admin auth (MUST be before /:slug)
router.get("/video/:videoId", AdminIdentifier, fetchVideoDetails);

// Get a specific course by slug
router.get("/:slug", OptionalIdentifier, getCourseBySlug);

// Create course - allow multiple image fields
router.post(
  "/",
  AdminIdentifier,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "image_ar", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
    { name: "mobileImage_ar", maxCount: 1 },
  ]),
  createCourse
);

// Update course - allow multiple image fields
router.put(
  "/:slug",
  AdminIdentifier,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "image_ar", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
    { name: "mobileImage_ar", maxCount: 1 },
  ]),
  updateCourse
);

// Save trailer - requires admin auth
router.post("/:slug/trailer", AdminIdentifier, saveTrailer);

// Remove trailer - requires admin auth
router.delete("/:slug/trailer", AdminIdentifier, removeTrailer);

// Delete course - requires admin auth
router.delete("/:slug", AdminIdentifier, deleteCourse);

export default router;
