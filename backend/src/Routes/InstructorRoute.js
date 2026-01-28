import express from "express";
import {
  createInstructor,
  getInstructors,
  getInstructorBySlug,
  getInstructorForAdmin,
  updateInstructor,
  deleteInstructor,
} from "../Controllers/InstructorController.js";
import upload from "../upload/upload.js";
import { AdminIdentifier } from "../middlewares/AdminIdentifications.js";

const router = express.Router();

// Public routes
router.get("/", getInstructors);
router.get("/:slug", getInstructorBySlug);

// Admin routes
router.get("/admin/:slug", AdminIdentifier, getInstructorForAdmin);
router.post("/", AdminIdentifier, upload.single("profileImage"), createInstructor);
router.put("/:slug", AdminIdentifier, upload.single("profileImage"), updateInstructor);
router.delete("/:slug", AdminIdentifier, deleteInstructor);

export default router;
