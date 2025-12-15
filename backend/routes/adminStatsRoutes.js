import express from "express";
import { getAdminStats } from "../controllers/adminStatsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ✅ /api/admin/stats */
router.get("/stats", protect, admin, getAdminStats);

export default router;
