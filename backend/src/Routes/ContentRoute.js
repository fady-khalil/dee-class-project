import express from "express";
import {
  getHeroSection,
  updateHeroSection,
  getCoursesForSelection,
  getJoinUs,
  updateJoinUs,
  getTrendingCourse,
  updateTrendingCourse,
  fetchVideoData,
  addReel,
  removeReel,
  getContactInfo,
  updateContactInfo,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  getTermsOfService,
  updateTermsOfService,
  getFAQ,
  updateFAQ,
  addFAQItem,
  updateFAQItem,
  deleteFAQItem,
} from "../Controllers/ContentController.js";

const router = express.Router();

// Hero Section routes
router.get("/hero", getHeroSection);
router.put("/hero", updateHeroSection);
router.post("/hero", updateHeroSection);

// Get courses for selection in hero section
router.get("/courses-list", getCoursesForSelection);

// Join Us routes
router.get("/join-us", getJoinUs);
router.put("/join-us", updateJoinUs);
router.post("/join-us", updateJoinUs);

// Trending Course / Reels routes
router.get("/trending", getTrendingCourse);
router.put("/trending", updateTrendingCourse);
router.post("/trending", updateTrendingCourse);

// Fetch video data from api.video
router.get("/video/:videoId", fetchVideoData);

// Reels management
router.post("/trending/reels", addReel);
router.delete("/trending/reels/:videoId", removeReel);

// Contact Info routes
router.get("/contact-info", getContactInfo);
router.put("/contact-info", updateContactInfo);
router.post("/contact-info", updateContactInfo);

// Privacy Policy routes
router.get("/privacy-policy", getPrivacyPolicy);
router.put("/privacy-policy", updatePrivacyPolicy);
router.post("/privacy-policy", updatePrivacyPolicy);

// Terms of Service routes
router.get("/terms-of-service", getTermsOfService);
router.put("/terms-of-service", updateTermsOfService);
router.post("/terms-of-service", updateTermsOfService);

// FAQ routes
router.get("/faq", getFAQ);
router.put("/faq", updateFAQ);
router.post("/faq", updateFAQ);
router.post("/faq/items", addFAQItem);
router.put("/faq/items/:itemId", updateFAQItem);
router.delete("/faq/items/:itemId", deleteFAQItem);

export default router;
