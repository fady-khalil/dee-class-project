// CartRoutes.js
import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../Controllers/CartController.js";
import {
  updateCartStatus,
  sendCheckoutNotifications,
} from "../Controllers/Cart/CartController.js";
import { Identifier } from "../middlewares/Identifications.js";

const router = express.Router();

// All routes require authentication
router.use(Identifier);

// Get user's cart
router.get("/", getCart);

// Add item to cart
router.post("/add", addToCart);

// Remove item from cart
router.delete("/remove/:type/:slug", removeFromCart);

// Clear cart
router.delete("/clear", clearCart);

// Update cart status
router.post("/status", updateCartStatus);

// Send checkout notifications (admin + user)
router.post("/notify-checkout", sendCheckoutNotifications);

export default router;
