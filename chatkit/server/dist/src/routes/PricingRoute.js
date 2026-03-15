import express from "express";
import mongoose from "mongoose";
import { Plan } from "../models/Plans.js";
import { Project } from "../models/Projects.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
const router = express.Router();
router.get("/plans", async (req, res) => {
    try {
        const plans = await Plan.find().sort({ monthlyPrice: 1 });
        res.json(plans || []);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch pricing plans" });
    }
});
router.post("/admin/plans", isAdmin, async (req, res) => {
    const { planId, name, dailyLimit, monthlyPrice, features } = req.body;
    try {
        const plan = await Plan.findOneAndUpdate({ planId }, { name, dailyLimit, monthlyPrice, features }, { upsert: true, new: true, runValidators: true });
        res.json({ message: "Plan synchronized successfully", plan });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update plan" });
    }
});
router.delete("/admin/plans/:id", isAdmin, async (req, res) => {
    try {
        await Plan.findByIdAndDelete(req.params["id"]);
        res.json({ message: "Plan deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: "Deletion failed" });
    }
});
router.patch("/projects/:projectId/upgrade", isAuthenticated, async (req, res) => {
    const { targetPlanId } = req.body;
    const projectId = req.params["projectId"];
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(targetPlanId) ||
        !mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    try {
        const selectedPlan = await Plan.findById(targetPlanId);
        if (!selectedPlan)
            return res.status(404).json({ error: "Plan not found" });
        const updatedProject = await Project.findOneAndUpdate({ _id: projectId, userId: userId }, { plan: selectedPlan._id }, { new: true }).populate("plan");
        res.json({
            message: `Upgraded to ${selectedPlan.name}`,
            project: updatedProject,
        });
    }
    catch (err) {
        res.status(500).json({ error: "Upgrade failed" });
    }
});
export default router;
//# sourceMappingURL=PricingRoute.js.map