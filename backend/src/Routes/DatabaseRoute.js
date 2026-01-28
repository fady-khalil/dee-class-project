import express from "express";
import DatabaseResetController from "../Controllers/DatabaseResetController.js";
import {
  AdminIdentifier,
  checkPermission,
} from "../middlewares/AdminIdentifications.js";

const router = express.Router();

/**
 * @route POST /api/database/reset
 * @description Reset specific collections in the database
 * @access Super Admin only
 */
router.post(
  "/reset",
  AdminIdentifier,
  checkPermission("database", "reset"),
  DatabaseResetController.resetCollections
);

export default router;
