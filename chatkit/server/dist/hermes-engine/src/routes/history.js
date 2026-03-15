import { Router } from "express";
import { hermesAuth } from "../middleware/auth.js";
import { getHistory } from "../services/messageService.js";
const router = Router();
router.get("/history/:roomId", hermesAuth, async (req, res) => {
    try {
        const roomId = req.params["roomId"];
        const { before, limit } = req.query;
        const hermesUserId = req.hermesUser.hermesUserId;
        const result = await getHistory(roomId, hermesUserId, before, limit ? parseInt(limit) : undefined);
        if (result.error) {
            return res.status(403).json({ success: false, error: result.error });
        }
        res.json({ success: true, ...result });
    }
    catch (err) {
        console.error("History Fetch Error:", err);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch history" });
    }
});
export default router;
//# sourceMappingURL=history.js.map