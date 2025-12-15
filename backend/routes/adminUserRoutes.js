import express from "express";
import {
  getAllUsers,
  getUserById,
  toggleBlockUser,
} from "../controllers/adminUserController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", protect, admin, getAllUsers);
router.get("/users/:id", protect, admin, getUserById);
router.put("/users/:id/block", protect, admin, toggleBlockUser);

export default router;
