import express from "express";
import {
  submitApplication,
  getAllApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication,
  upload,
} from "../Controllers/ExpertApplicationController.js";

const router = express.Router();

// Public route - submit application
router.post("/submit", upload.single("resume"), submitApplication);

// Admin routes
router.get("/", getAllApplications);
router.get("/:id", getApplication);
router.put("/:id", updateApplicationStatus);
router.delete("/:id", deleteApplication);

export default router;
