import express from "express";
import {
  purchaseGiftCode,
  validateGiftCode,
  redeemGiftCode,
  getMyGiftCodes,
  verifyGiftPurchase,
} from "../Controllers/GiftController.js";

const router = express.Router();

// Public routes (no auth required)
// Validate gift code - anyone can check if a code is valid
router.post("/validate", validateGiftCode);

// Redeem gift code - called after user logs in or registers
router.post("/redeem", redeemGiftCode);

// Verify gift purchase - called after Stripe checkout completes
router.post("/verify-purchase", verifyGiftPurchase);

// Purchase gift code - creates Stripe checkout session
// Note: This should technically require auth, but we pass user_id in body
// for flexibility with mobile app
router.post("/purchase", purchaseGiftCode);

// Protected routes (require user auth)
export const protectedGiftRouter = express.Router();

// Get user's purchased gift codes
protectedGiftRouter.get("/my-gifts", getMyGiftCodes);

export default router;
