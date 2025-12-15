import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} from "../controllers/productAdminController.js";


import { protect, admin } from "../middleware/authMiddleware.js";


const router = express.Router();

// Upload folder
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Routes
router.get("/products", protect, admin, getAllProducts);
router.get("/products/:id", protect, admin, getProductById);
router.post("/products", protect, admin, upload.array("images", 6), createProduct);
router.put("/products/:id", protect, admin, upload.array("images", 6), updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);


export default router;
