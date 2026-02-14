import express from "express";
import {
  getHomeData,
  getContactInfoPublic,
  getPrivacyPolicyPublic,
  getTermsOfServicePublic,
  getFAQPublic,
  submitContactForm,
  getBottomBannerPublic,
} from "../Controllers/HomeController.js";
import { getAboutPagePublic } from "../Controllers/AboutPageController.js";

const router = express.Router();

// Get home page data
router.get("/", getHomeData);

// Public content pages
router.get("/contact-info", getContactInfoPublic);
router.get("/privacy-policy", getPrivacyPolicyPublic);
router.get("/terms-of-service", getTermsOfServicePublic);
router.get("/faq", getFAQPublic);
router.get("/about", getAboutPagePublic);
router.get("/bottom-banner", getBottomBannerPublic);

// Contact form submission
router.post("/contact", submitContactForm);

// Test route to check if basic routing is working
router.get("/test", (req, res) => {
  res.status(200).json({
    status: 200,
    success: true,
    message: "Home test route is working",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
