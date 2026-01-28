import express from "express";
import {
  likeCourse,
  unlikeCourse,
  commentCourse,
  getComments,
  getCourseEngagement,
} from "../Controllers/CourseEngagementController.js";
import { Identifier } from "../middlewares/Identifications.js";

const router = express.Router();

// Like a course - requires authentication
router.post("/like-course", Identifier, likeCourse);

// Unlike a course - requires authentication
router.post("/unlike-course", Identifier, unlikeCourse);

// Add a comment - requires authentication
router.post("/comment-course", Identifier, commentCourse);

// Get comments for a course - public
router.get("/comments/:course_id", getComments);

// Get engagement data for a course - public
router.get("/engagement/:course_id", getCourseEngagement);

export default router;
