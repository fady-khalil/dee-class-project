import express from "express";
import {
  getActivePlans,
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  reorderPlans,
} from "../Controllers/PlanController.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// These are used with language middleware: /api/{lang}/packages

router.get("/", getActivePlans);

// ==================== ADMIN ROUTES ====================
// These are used with admin auth: /api/admin/plans

export const adminPlanRouter = express.Router();

adminPlanRouter.get("/", getAllPlans);
adminPlanRouter.get("/:id", getPlanById);
adminPlanRouter.post("/", createPlan);
adminPlanRouter.put("/:id", updatePlan);
adminPlanRouter.delete("/:id", deletePlan);
adminPlanRouter.patch("/:id/toggle-status", togglePlanStatus);
adminPlanRouter.post("/reorder", reorderPlans);

export default router;
