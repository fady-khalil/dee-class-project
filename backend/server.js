import express from "express";
import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import mongoose from "mongoose";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import https from "https";

// Import language middleware
import {
  languageMiddleware,
  adminLanguageMiddleware,
  responseTranslationMiddleware,
} from "./src/middlewares/languageMiddleware.js";

// Routes
import courseCategoryRoute from "./src/Routes/CoursesCategoryRoute.js";
import courseRoute from "./src/Routes/CourseRoute.js";
import courseEngagementRoute from "./src/Routes/CourseEngagementRoute.js";
import homeRoute from "./src/Routes/HomeRoute.js";
import authRouter from "./src/Routes/AuthRouter.js";
import adminRouter from "./src/Routes/AdminRouter.js";
import databaseRoute from "./src/Routes/DatabaseRoute.js";
import instructorRoute from "./src/Routes/InstructorRoute.js";
import contentRoute from "./src/Routes/ContentRoute.js";
import expertApplicationRoute from "./src/Routes/ExpertApplicationRoute.js";
import planRoute, { adminPlanRouter } from "./src/Routes/PlanRoute.js";
import stripeRoute, { protectedStripeRouter } from "./src/Routes/StripeRoute.js";
import profileRoute from "./src/Routes/ProfileRoute.js";
import { handleWebhook } from "./src/Controllers/StripeController.js";

const port = process.env.PORT || 5001;
const app = express();

// Enable CORS for all routes
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://declass.yamminelawfirm.com", "https://dashboarddeclass.yamminelawfirm.com"]
    : ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  })
);

// Stripe webhook needs raw body - must be before express.json()
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

// Helmet for security
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  (req, res, next) => {
    const maxAge = process.env.NODE_ENV === "production" ? 86400 : 3600;
    res.setHeader("Cache-Control", "public, max-age=" + maxAge);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Apply response translation middleware to all routes
app.use(responseTranslationMiddleware);

// Home route
app.get("/", (req, res) => {
  res.send("de class API is running");
});

// Apply language middleware to all routes under /api
// Pattern: /api/:language/:route
// Example: /api/en/auth/login or /api/ar/courses

// Admin routes (no language parameter, returns both languages)
app.use("/api/admin", adminLanguageMiddleware, adminRouter);
app.use("/api/admin/content", adminLanguageMiddleware, contentRoute);
app.use("/api/admin/expert-applications", adminLanguageMiddleware, expertApplicationRoute);
app.use("/api/admin/plans", adminLanguageMiddleware, adminPlanRouter);
app.use("/api/database", adminLanguageMiddleware, databaseRoute);

// Public route for expert application submission
app.use("/api/expert-application", expertApplicationRoute);

// Stripe routes (no language parameter)
app.use("/api", stripeRoute); // create-checkout-session, webhook/refresh-data
app.use("/api/subscription", protectedStripeRouter); // subscription-status, cancel-subscription, portal-session

// Profile routes (no language parameter)
app.use("/api", profileRoute); // create-profile, edit-profile, delete-profile, profiles

// Language-aware client routes
// Each route will now be accessible via /api/en/... or /api/ar/...
app.use("/api/:language/auth", languageMiddleware, authRouter);
app.use("/api/:language/home", languageMiddleware, homeRoute);
app.use(
  "/api/:language/course-categories",
  languageMiddleware,
  courseCategoryRoute
);
app.use("/api/:language/courses", languageMiddleware, courseRoute);
app.use("/api/:language/instructors", languageMiddleware, instructorRoute);
app.use("/api/:language/packages", languageMiddleware, planRoute);
// Course engagement routes (like, comment)
app.use("/api/:language", languageMiddleware, courseEngagementRoute);
// Profile routes with language (for profile-for-you endpoint)
app.use("/api/:language", languageMiddleware, profileRoute);

// Regular API routes (without language in URL)
// Fallback routes for backward compatibility - these should use language middleware too
app.use("/api/auth", languageMiddleware, authRouter);
app.use("/api/home", languageMiddleware, homeRoute);
app.use("/api/course-categories", languageMiddleware, courseCategoryRoute);
app.use("/api/courses", languageMiddleware, courseRoute);
app.use("/api/instructors", languageMiddleware, instructorRoute);
app.use("/api/packages", languageMiddleware, planRoute);
// Course engagement routes (like, comment) - fallback
app.use("/api", languageMiddleware, courseEngagementRoute);

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

app.listen(port, () => {
  console.log(`🚀 Development server running on http://localhost:${port}`);
});

export default app;
