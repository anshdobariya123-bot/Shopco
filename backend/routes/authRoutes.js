import express from "express";
import {
  register,
  login,
  ensureAdmin,
  getProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

/* ✅ SESSION RESTORE */
router.get("/profile", protect, getProfile);

/* ⚠️ one-time admin seed */
router.post("/ensure-admin", ensureAdmin);

export default router;
