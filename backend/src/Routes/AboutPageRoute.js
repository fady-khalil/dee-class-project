import express from "express";
import upload from "../upload/upload.js";
import {
  getAboutPage,
  updateAboutPage,
  updateStoryImage,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "../Controllers/AboutPageController.js";

const router = express.Router();

router.get("/", getAboutPage);
router.put("/", updateAboutPage);
router.put("/story-image", upload.single("image"), updateStoryImage);
router.post("/gallery", upload.single("image"), addGalleryItem);
router.put("/gallery/:itemId", upload.single("image"), updateGalleryItem);
router.delete("/gallery/:itemId", deleteGalleryItem);

export default router;
