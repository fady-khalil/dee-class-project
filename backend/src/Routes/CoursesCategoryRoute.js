import express from "express";
import {
  createCourseCategory,
  getCourseCategories,
  getCourseCategoryBySlug,
  updateCourseCategory,
  deleteCourseCategory,
  getCourseCategoryWithTranslations,
} from "../Controllers/CourseCategoryController.js";
import { AdminIdentifier } from "../middlewares/AdminIdentifications.js";

const router = express.Router();

router.post("/", createCourseCategory);
router.get("/", getCourseCategories);
router.get("/admin/:slug", AdminIdentifier, getCourseCategoryWithTranslations);
router.get("/:slug", getCourseCategoryBySlug);
router.put("/:slug", updateCourseCategory);
router.delete("/:slug", deleteCourseCategory);

export default router;
