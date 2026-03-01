import express from "express";
import type { Request, Response } from "express";
import { Project } from "../models/Projects.js";
import { Plan } from "../models/Plans.js";
import crypto from "crypto";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

// --- Get All User Projects ---
router.get("/projects", async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    // We populate the plan here too so the dashboard list shows correct limits
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
    const project = await Project.findOne({
      _id: req.params.id,
      userId,
    }).populate("plan");

    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
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
      endpoint: "http://localhost:8080",
      usage: {
        dailyTokens: 0,
        totalTokensAllTime: 0,
        lastResetDate: new Date(),
      },
    });

    await newProject.save();
    // Return the project with the plan details populated for the immediate UI update
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

      // This uses a MongoDB pipeline to check the date and increment OR reset tokens
      // in a single, un-interruptible database operation.
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
                  then: tokens, // Reset: it's a new day
                  else: { $add: ["$usage.dailyTokens", tokens] }, // Increment: same day
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
      ).populate("plan"); // Populate so dashboard gets refreshed limit info too

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      console.log(
        `[Telemetry] ✅ ${project.projectName}: Daily ${project.usage.dailyTokens} | Total ${project.usage.totalTokensAllTime}`,
      );

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
