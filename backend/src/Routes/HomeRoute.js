import express from "express";
import { getHomeData } from "../Controllers/HomeController.js";

const router = express.Router();

// Get home page data
router.get("/", getHomeData);

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
