import express from "express";
import {
  adminLogin,
  adminLogout,
  verifyAdminToken,
} from "../Controllers/Auth/AdminLoginController.js";
import { createNewAdmin } from "../Controllers/Auth/AdminController.js";
import {
  AdminIdentifier,
  checkPermission,
} from "../middlewares/AdminIdentifications.js";
import { addSecurityHeaders } from "../middlewares/securityHeadersMiddleware.js";
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllUsers,
  getUserById,
  markCartComplete,
  getUserTransactions,
  getUserCart,
} from "../Controllers/Auth/AdminUserController.js";

const router = express.Router();

router.use(addSecurityHeaders);

// Admin auth routes
router.post("/login", adminLogin);
router.post("/logout", adminLogout);

// Protected admin routes
router.use(AdminIdentifier); // All routes below require admin authentication

// Admin management (only super_admin)
router.post("/create", createNewAdmin);

// User management routes with permission checks
router.get("/users", getAdmins);
router.get("/users/:id", getAdminById);
router.post("/create", createAdmin);
router.post("/users/:id", updateAdmin);
router.delete("/users/:id", deleteAdmin);

// Regular user management routes for super_admin
router.get("/regular-users", getAllUsers);
router.get("/regular-users/:id", getUserById);
router.post("/regular-users/:userId/complete-purchase", markCartComplete);
router.get("/regular-users/:userId/transactions", getUserTransactions);
router.get("/regular-users/:userId/cart", getUserCart);

router.get("/verify", verifyAdminToken);

export default router;
