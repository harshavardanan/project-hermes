import { Router } from "express";
import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { hermesAuth } from "../middleware/auth.js";
import { hermesUploadLimiter } from "../middleware/rateLimit.js";
import { upload, getMimeCategory } from "../middleware/upload.js";
import { logger } from "../utils/logger.js";

const router = Router();
router.post(
  "/upload",
  hermesAuth,
  hermesUploadLimiter,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No file provided" });
      }

      const { originalname, mimetype, size, buffer } = req.file;
      const category = getMimeCategory(mimetype);
      const userId = (req as any).hermesUser.userId;

      // Determine Cloudinary resource type
      const resourceType =
        category === "image" ? "image" : category === "video" ? "video" : "raw";

      // Upload buffer to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: `hermes/${category}`,
            public_id: `${Date.now()}-${originalname.replace(/\s+/g, "_")}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(buffer);
      });

      logger.info(`Upload OK: ${originalname} (${category}) by ${userId}`);

      res.json({
        success: true,
        type: category, // "image" | "video" | "audio" | "document"
        url: uploadResult.secure_url,
        thumbnail: uploadResult.eager?.[0]?.secure_url ?? null,
        fileName: originalname,
        fileSize: size,
        mimeType: mimetype,
      });
    } catch (err) {
      logger.error("Upload failed", err);
      res.status(500).json({ success: false, error: "Upload failed" });
    }
  },
);

export default router;
