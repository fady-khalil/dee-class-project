import express from "express";
import {
  createCheckoutSession,
  handleWebhook,
  refreshUserData,
  verifyCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
  createPortalSession,
} from "../Controllers/StripeController.js";

const router = express.Router();

// Public routes (no auth required)
router.post("/create-checkout-session", createCheckoutSession);
router.post("/webhook/refresh-data", refreshUserData);
router.post("/verify-checkout", verifyCheckoutSession);

// Webhook route - uses raw body (configured in server.js)
router.post("/webhook", handleWebhook);

// Protected routes (require user auth)
export const protectedStripeRouter = express.Router();
protectedStripeRouter.get("/subscription-status", getSubscriptionStatus);
protectedStripeRouter.post("/cancel-subscription", cancelSubscription);
protectedStripeRouter.post("/portal-session", createPortalSession);

export default router;
