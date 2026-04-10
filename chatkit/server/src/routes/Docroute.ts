import express from "express";
import type { Request, Response } from "express";
import { Doc } from "../models/Document.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { getCached, setCached, delCached } from "../config/redis.js";

const router = express.Router();

router.post("/save", [isAuthenticated, isAdmin], async (req: Request, res: Response) => {
  try {
    const { title, slug, content } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        message: "title, slug, and content are required",
      });
    }

    const doc = await Doc.findOneAndUpdate(
      { slug: slug.trim() },
      {
        $set: {
          title,
          content,
          lastUpdated: new Date(),
          ...(req.body.category && { category: req.body.category }),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Invalidate docs list cache
    await delCached("api:docs:list");

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/update/:id", [isAuthenticated, isAdmin], async (req: Request, res: Response) => {
  try {
    const { _id, slug, ...safeBody } = req.body;

    const updatedDoc = await Doc.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...safeBody,
          lastUpdated: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Invalidate docs list cache
    await delCached("api:docs:list");

    res.json({ success: true, data: updatedDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/list", async (req: Request, res: Response) => {
  try {
    const cached = await getCached("api:docs:list");
    if (cached) return res.json(JSON.parse(cached));

    const docs = await Doc.find()
      .select("title slug status lastUpdated order category")
      .sort({ order: 1, lastUpdated: -1 }); // sort by order first, then date

    const responseData = { success: true, data: docs };
    await setCached("api:docs:list", JSON.stringify(responseData), 30); // Cache 30s

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ success: false, error: "Fetch failed" });
  }
});

router.post("/reorder", [isAuthenticated, isAdmin], async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res
        .status(400)
        .json({ success: false, message: "ids must be an array" });
    }

    // Bulk update — assign each doc its index as order value
    const bulkOps = ids.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } }
      }
    }));
    await Doc.bulkWrite(bulkOps);

    // Invalidate docs list cache
    await delCached("api:docs:list");

    res.json({ success: true, message: "Order updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/get/:slug", async (req: Request, res: Response) => {
  try {
    const cached = await getCached(`api:docs:get:${req.params.slug}`);
    if (cached) return res.json(JSON.parse(cached));

    const doc = await Doc.findOne({ slug: req.params.slug });
    if (!doc) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    const responseData = { success: true, data: doc };
    await setCached(`api:docs:get:${req.params.slug}`, JSON.stringify(responseData), 30);

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ success: false, error: "Fetch failed" });
  }
});

router.delete("/delete/:slug", [isAuthenticated, isAdmin], async (req: Request, res: Response) => {
  try {
    const deleted = await Doc.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Doc not found" });
    }
    
    // Invalidate docs caches
    await delCached("api:docs:list", `api:docs:get:${req.params.slug}`);

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;
