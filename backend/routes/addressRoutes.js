import express from "express";
import {
  addAddress,
  getAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getAddresses)
  .post(protect, addAddress);

router
  .route("/:id")
  .get(protect, getSingleAddress)
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

export default router;
