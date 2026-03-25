import express from "express";
import type { Request, Response } from "express";
import User from "../models/Users.js";
import { Project } from "../models/Projects.js";
import { Plan } from "../models/Plans.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { HermesUser } from "../hermes-engine/src/models/HermesUser.js";

const router = express.Router();

// Both routes need authentication and admin rights
router.use(isAuthenticated, isAdmin);

router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("plan", "name planId");

    console.log(`[AdminRoute] Found ${users.length} users in DB`);

    // Get project counts for each user to provide better info
    const projects = await Project.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    console.log(`[AdminRoute] Aggregated projects for ${projects.length} users`);
    const projectMap = new Map(
      projects.map((p) => [p._id.toString(), p.count]),
    );

    // Get sub-user counts (HermesUser) for each user's projects
    const allProjects = await Project.find({ userId: { $in: users.map(u => u._id) } });
    const projectIds = allProjects.map(p => p._id);
    const projectToUserMap = new Map(allProjects.map(p => [p._id.toString(), p.userId.toString()]));

    const hermesUserCounts = await HermesUser.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } }
    ]);

    const subUserCountMap = new Map();
    hermesUserCounts.forEach(c => {
      const uId = projectToUserMap.get(c._id.toString());
      if (uId) {
        subUserCountMap.set(uId, (subUserCountMap.get(uId) || 0) + c.count);
      }
    });

    const usersWithStats = users.map((u) => ({
      ...u.toJSON(),
      projectCount: projectMap.get(u._id.toString()) || 0,
      subUserCount: subUserCountMap.get(u._id.toString()) || 0,
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();

    // Distribution of users by plan
    const planDistributionRaw = await User.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]);

    // Populate plan names
    const plans = await Plan.find();
    const planMap = new Map(plans.map((p) => [p._id.toString(), p.name]));

    const planDistribution = planDistributionRaw.map((d) => ({
      planId: d._id,
      planName: d._id
        ? planMap.get(d._id.toString()) || "Unknown"
        : "No Plan",
      count: d.count,
    }));

    res.json({
      totalUsers,
      totalProjects,
      planDistribution,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

router.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { status, plan } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (plan !== undefined) updateData.plan = plan === "none" ? null : plan;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .select("-password")
      .populate("plan", "name planId");
      
    // @ts-ignore
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
