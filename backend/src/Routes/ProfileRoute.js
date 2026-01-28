import express from "express";
import {
  createProfile,
  editProfile,
  deleteProfile,
  getProfiles,
  getPurchasedCourses,
  addToMyList,
  removeFromMyList,
  getMyList,
  isInMyList,
  getProfileForYou,
  saveVideoHistory,
  markVideoAsDone,
  getContinueWatching,
  getVideoProgress,
  getMyProgress,
  syncCompletedCourses,
} from "../Controllers/ProfileController.js";
import { Identifier } from "../middlewares/Identifications.js";

const router = express.Router();

// Profile CRUD - each route has Identifier middleware
router.get("/profiles", Identifier, getProfiles);
router.post("/create-profile", Identifier, createProfile);
router.post("/edit-profile/:id", Identifier, editProfile);
router.delete("/delete-profile/:id", Identifier, deleteProfile);

// Purchased courses
router.get("/my-courses", Identifier, getPurchasedCourses);

// My List (saved courses) - profile level
router.post("/my-list/add", Identifier, addToMyList);
router.post("/my-list/remove", Identifier, removeFromMyList);
router.get("/my-list", Identifier, getMyList);
router.get("/my-list/check", Identifier, isInMyList);

// Profile For You (curated content with my list)
router.post("/profile-for-you", Identifier, getProfileForYou);

// Video watching history (continue watching feature)
router.post("/profile-video-history", Identifier, saveVideoHistory);
router.get("/continue-watching", Identifier, getContinueWatching);
router.get("/video-progress", Identifier, getVideoProgress);

// Mark video as done
router.post("/videos-done", Identifier, markVideoAsDone);

// My Progress (continue watching + completed courses)
router.post("/my-progress", Identifier, getMyProgress);

// Sync completed courses (fix courses that should be marked complete)
router.post("/sync-completed-courses", Identifier, syncCompletedCourses);

export default router;
