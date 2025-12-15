import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

/* ROUTES */
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

/* ADMIN ROUTES */
import adminRoutes from "./routes/adminRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";

/* MIDDLEWARE */
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

/* ===============================
   INIT APP
================================ */
const app = express();

/* ===============================
   DATABASE
================================ */
connectDB();

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json({ limit: "10kb" })); // 🔒 payload protection
app.use(express.urlencoded({ extended: true }));

/* CORS – controlled */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

/* LOGGING (DEV ONLY) */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ===============================
   STATIC FILES
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads"))
);

/* ===============================
   ROUTES
================================ */
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

/* AUTH & USER */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);

/* PRODUCTS & ORDERS */
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

/* ADMIN */
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/admin", adminStatsRoutes);

/* ROOT */
app.get("/", (req, res) => {
  res.send("🚀 E-commerce API running");
});

/* ===============================
   ERROR HANDLING
================================ */
app.use(notFound);
app.use(errorHandler);

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`🔥 Server running on port ${PORT}`)
);

/* ===============================
   GRACEFUL SHUTDOWN
================================ */
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down...");
  server.close(() => process.exit(0));
});
  