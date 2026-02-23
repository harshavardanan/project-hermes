import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Plan } from "../models/Plans.js";
import { Project } from "../models/Projects.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js"; //

const router = express.Router();

/**
 * GET /api/plans - Publicly viewable
 */
router.get("/plans", async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find().sort({ monthlyPrice: 1 });
    res.json(plans || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pricing plans" });
  }
});

/**
 * POST /api/admin/plans - Securely managed by isAdmin session
 */
router.post("/admin/plans", isAdmin, async (req: Request, res: Response) => {
  const { planId, name, dailyLimit, monthlyPrice, features } = req.body;

  try {
    const plan = await Plan.findOneAndUpdate(
      { planId },
      { name, dailyLimit, monthlyPrice, features },
      { upsert: true, new: true, runValidators: true },
    );
    res.json({ message: "Plan synchronized successfully", plan });
  } catch (err) {
    res.status(500).json({ error: "Failed to update plan" });
  }
});

/**
 * DELETE /api/admin/plans/:id - Allows removing tiers
 */
router.delete(
  "/admin/plans/:id",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      await Plan.findByIdAndDelete(req.params.id);
      res.json({ message: "Plan deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Deletion failed" });
    }
  },
);

/**
 * PATCH /api/projects/:projectId/upgrade - Standard user upgrade
 */
router.patch(
  "/projects/:projectId/upgrade",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { targetPlanId } = req.body;
    const { projectId } = req.params;
    const userId = (req.user as any)._id;

    if (
      !mongoose.Types.ObjectId.isValid(targetPlanId) ||
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
      const selectedPlan = await Plan.findById(targetPlanId);
      if (!selectedPlan)
        return res.status(404).json({ error: "Plan not found" });

      const updatedProject = await Project.findOneAndUpdate(
        { _id: projectId, userId: userId },
        { plan: selectedPlan._id },
        { new: true },
      ).populate("plan");

      res.json({
        message: `Upgraded to ${selectedPlan.name}`,
        project: updatedProject,
      });
    } catch (err) {
      res.status(500).json({ error: "Upgrade failed" });
    }
  },
);

export default router;
