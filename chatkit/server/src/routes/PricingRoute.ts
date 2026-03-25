import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Plan } from "../models/Plans.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { getCached, setCached, delCached } from "../config/redis.js";

const router = express.Router();

router.get("/plans", async (req: Request, res: Response) => {
  try {
    const cached = await getCached("api:plans");
    if (cached) return res.json(JSON.parse(cached));

    const plans = await Plan.find().sort({ monthlyPrice: 1 });
    const responseData = plans || [];
    
    await setCached("api:plans", JSON.stringify(responseData), 600); // Cache 10 mins
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pricing plans" });
  }
});

router.post("/admin/plans", isAdmin, async (req: Request, res: Response) => {
  const { planId, name, dailyLimit, monthlyPrice, features } = req.body;
  try {
    const plan = await Plan.findOneAndUpdate(
      { planId },
      { name, dailyLimit, monthlyPrice, features },
      { upsert: true, new: true, runValidators: true },
    );
    await delCached("api:plans");
    res.json({ message: "Plan synchronized successfully", plan });
  } catch (err) {
    res.status(500).json({ error: "Failed to update plan" });
  }
});

router.delete(
  "/admin/plans/:id",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      await Plan.findByIdAndDelete(req.params["id"]);
      await delCached("api:plans");
      res.json({ message: "Plan deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Deletion failed" });
    }
  },
);

router.post(
  "/user/upgrade",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { targetPlanId } = req.body;
    const userId = (req.user as any)._id;

    if (!mongoose.Types.ObjectId.isValid(targetPlanId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
      const selectedPlan = await Plan.findById(targetPlanId);
      if (!selectedPlan)
        return res.status(404).json({ error: "Plan not found" });

      const { default: User } = await import("../models/Users.js");
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { plan: selectedPlan._id },
        { new: true },
      ).populate("plan");

      res.json({
        message: `Account upgraded to ${selectedPlan.name}`,
        user: updatedUser,
      });
    } catch (err) {
      res.status(500).json({ error: "Upgrade failed" });
    }
  },
);

export default router;
