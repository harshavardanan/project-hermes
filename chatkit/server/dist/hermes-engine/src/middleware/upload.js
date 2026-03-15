import multer from "multer";
import path from "path";
// ── Allowed MIME types per category ──────────────────────────────────────────
const ALLOWED_TYPES = {
    image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    video: ["video/mp4", "video/webm", "video/ogg"],
    audio: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"],
    document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
    ],
};
const ALL_ALLOWED = Object.values(ALLOWED_TYPES).flat();
// ── Multer config: memory storage (passed to Cloudinary) ─────────────────────
const storage = multer.memoryStorage();
const fileFilter = (_req, file, cb) => {
    if (ALL_ALLOWED.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
};
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
});
// ── Detect message type from MIME ─────────────────────────────────────────────
export const getMimeCategory = (mimeType) => {
    for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
        if (types.includes(mimeType))
            return category;
    }
    return "document";
};
//# sourceMappingURL=upload.js.map