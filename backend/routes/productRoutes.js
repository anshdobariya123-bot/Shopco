import express from "express";
import {
  listProducts,
  getProduct,
  listNewArrivals,
  listProductsByCategory,
  searchProducts,
} from "../controllers/productController.js";

const router = express.Router();

/* SEARCH MUST BE FIRST */
router.get("/search", searchProducts);
router.get("/new-arrivals", listNewArrivals);
router.get("/category/:category", listProductsByCategory);
router.get("/:id", getProduct);
router.get("/", listProducts);

export default router;
