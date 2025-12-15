import express from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);

export default router;
