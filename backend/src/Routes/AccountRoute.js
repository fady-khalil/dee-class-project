import express from "express";
import {
  getAccountInfo,
  updateProfile,
  getSubscriptionDetails,
} from "../Controllers/AccountController.js";
import { Identifier } from "../middlewares/Identifications.js";

const router = express.Router();

// All routes require authentication
router.use(Identifier);

// GET /api/:language/account/me - Get account info
router.get("/me", getAccountInfo);

// PUT /api/:language/account/me - Update profile
router.put("/me", updateProfile);

// GET /api/:language/account/subscription - Get subscription details
router.get("/subscription", getSubscriptionDetails);

export default router;
