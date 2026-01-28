import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourses,
  getCourseBySlug,
  getCategoryWithCoursesAndSubcategories,
  getCoursesBySubcategory,
} from "../Controllers/CourseController.js";
import { OptionalIdentifier } from "../middlewares/Identifications.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/";

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.fieldname === "image") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for image field!"), false);
    }
  } else if (file.fieldname === "trailerVideo") {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed for video field!"), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

// For create operations, handle multiple file fields
const createUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "trailerVideo", maxCount: 1 },
]);

// For update operations, just handle one file
const updateUpload = upload.single("image");

// Course routes
router.post("/", createUpload, createCourse);
router.get("/", getCourses);
router.get("/:slug", OptionalIdentifier, getCourseBySlug);
router.post("/:slug", updateUpload, updateCourse);
router.delete("/:slug", deleteCourse);

// Additional routes
router.get("/categories/:categorySlug", getCategoryWithCoursesAndSubcategories);
router.get("/subcategories/:subcategorySlug", getCoursesBySubcategory);

export default router;
