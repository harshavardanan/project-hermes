import express from "express";
import type { Request, Response } from "express";
import { Project } from "../models/Projects.js";
import { Plan } from "../models/Plans.js";
import { HermesUser } from "./../hermes-engine/src/models/HermesUser.js"; // 🚨 Ensure this path matches your folder structure
import { Room } from "./../hermes-engine/src/models/Room.js"; // 🚨 Ensure this path matches your folder structure
import { Message } from "./../hermes-engine/src/models/Message.js"; // 🚨 Ensure this path matches your folder structure
import crypto from "crypto";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

// --- Get All User Projects ---
router.get("/projects", async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;

    // 🛡️ LAZY RESET: Reset tokens for dashboard list view
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    await Project.updateMany(
      { userId, "usage.lastResetDate": { $lt: todayStart } },
      { $set: { "usage.dailyTokens": 0, "usage.lastResetDate": new Date() } },
    );

    const projects = await Project.find({ userId })
      .populate("plan")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// --- Get Single Project Details ---
router.get("/projects/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;

    // 1. 🛡️ LAZY RESET
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    await Project.updateOne(
      {
        _id: req.params.id,
        userId,
        "usage.lastResetDate": { $lt: todayStart },
      },
      { $set: { "usage.dailyTokens": 0, "usage.lastResetDate": new Date() } },
    );

    // 2. Fetch Project
    const project = await Project.findOne({
      _id: req.params.id,
      userId,
    }).populate("plan");

    if (!project) return res.status(404).json({ error: "Project not found" });

    const projectId = project._id;

    // 3. 🚀 FETCH LIVE STATS for Overview Tab
    const [totalUsersCount, activeUsersCount, totalRoomsCount, rooms] =
      await Promise.all([
        HermesUser.countDocuments({ projectId }),
        HermesUser.countDocuments({ projectId, isOnline: true }),
        Room.countDocuments({ projectId, isDeleted: false }),
        Room.find({ projectId }, { _id: 1 }),
      ]);

    const roomIds = rooms.map((r) => r._id);
    const totalMessagesCount = await Message.countDocuments({
      roomId: { $in: roomIds },
      isDeleted: false,
    });

    // 4. 👥 FETCH USERS LIST for Users Tab
    const usersList = await HermesUser.find({ projectId })
      .select("displayName isOnline lastSeen")
      .sort({ lastSeen: -1 })
      .limit(100);

    // 5. ATTACH EVERYTHING TO RESPONSE
    const projectData = project.toObject();

    // Attach Stats
    projectData.stats = {
      totalUsers: totalUsersCount,
      activeUsers: activeUsersCount,
      totalRooms: totalRoomsCount,
      totalMessages: totalMessagesCount,
      avgLatency: 12, // Hardcoded simulation for UI
      uptime: 99.9, // Hardcoded simulation for UI
    };

    // Attach Users List
    projectData.users = usersList;

    res.json(projectData);
  } catch (err) {
    console.error("❌ Error fetching project details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Create New Project ---
router.post("/projects", async (req: Request, res: Response) => {
  try {
    const { projectName, region } = req.body;
    const userId = (req.user as any)._id;

    const freePlan = await Plan.findOne({ planId: "free" });
    if (!freePlan) {
      return res
        .status(500)
        .json({ error: "Default 'free' plan missing in database" });
    }

    const newProject = new Project({
      projectName,
      userId,
      region: region || "us-east-1",
      plan: freePlan._id,
      projectId: `${projectName.toLowerCase().replace(/\s+/g, "-")}-${crypto.randomBytes(3).toString("hex")}`,
      apiKey: crypto.randomBytes(20).toString("hex").toUpperCase(),
      secret: crypto.randomBytes(22).toString("base64url").slice(0, 30),
      endpoint: process.env.BACKEND_URL || "",
      usage: {
        dailyTokens: 0,
        totalTokensAllTime: 0,
        lastResetDate: new Date(),
      },
    });

    await newProject.save();
    const populated = await newProject.populate("plan");
    res.status(201).json(populated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Delete Project ---
router.delete("/projects/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const deleteProject = await Project.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!deleteProject)
      return res.status(404).json({ error: "Project not found" });

    // Optional: You could also delete associated HermesUsers, Rooms, and Messages here

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Track/Simulate Token Usage (Atomic Update) ---
router.post(
  "/projects/:projectId/track-tokens",
  async (req: Request, res: Response) => {
    try {
      const { tokens } = req.body;
      if (!tokens || typeof tokens !== "number") {
        return res.status(400).json({ error: "Invalid token count" });
      }

      const now = new Date();
      const todayStart = new Date(now.setUTCHours(0, 0, 0, 0));

      let project = await Project.findOneAndUpdate(
        {
          $or: [
            { projectId: req.params.projectId },
            ...(req.params.projectId.length === 24
              ? [{ _id: req.params.projectId }]
              : []),
          ],
        },
        [
          {
            $set: {
              "usage.dailyTokens": {
                $cond: {
                  if: { $lt: ["$usage.lastResetDate", todayStart] },
                  then: tokens,
                  else: { $add: ["$usage.dailyTokens", tokens] },
                },
              },
              "usage.totalTokensAllTime": {
                $add: ["$usage.totalTokensAllTime", tokens],
              },
              "usage.lastResetDate": new Date(),
            },
          },
        ],
        { new: true },
      ).populate("plan");

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.status(200).json({
        success: true,
        usage: project.usage,
      });
    } catch (err: any) {
      console.error("❌ Token Tracking Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

export default router;
