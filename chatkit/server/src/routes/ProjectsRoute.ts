import express from "express";
import type { Request, Response } from "express";
import { Project } from "../models/Projects.js";
import { Plan } from "../models/Plans.js";
import crypto from "crypto";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/projects", async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/projects/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const project = await Project.findOne({ _id: req.params.id, userId });
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/projects", async (req: Request, res: Response) => {
  try {
    const { projectName, region } = req.body;
    const userId = (req.user as any)._id;

    const freePlan = await Plan.findOne({ planId: "free" });
    if (!freePlan) {
      return res.status(500).json({ error: "Default plan missing" });
    }

    const newProject = new Project({
      projectName,
      userId,
      region: region || "us-east-1",
      plan: freePlan._id,
      projectId: `${projectName.toLowerCase().replace(/\s+/g, "-")}-${crypto.randomBytes(3).toString("hex")}`,

      // Exact 40 character API Key (Hex)
      apiKey: crypto.randomBytes(20).toString("hex").toUpperCase(),

      // Exact 30 character Secret (Base64URL safe)
      secret: crypto.randomBytes(22).toString("base64url").slice(0, 30),

      endpoint: "http://localhost:8080",
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/projects/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const deleteProject = await Project.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!deleteProject)
      return res.status(404).json({ error: "Project not found" });

    res.status(200).json("Project deleted successfully");
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
