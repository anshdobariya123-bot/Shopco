import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/* ===============================
   REGISTER
=============================== */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id), // ✅ AUTO LOGIN
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Registration failed" });
  }
};

/* ===============================
   LOGIN
=============================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* ===============================
   GET PROFILE
=============================== */
export const getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
  });
};

/* ===============================
   SEED ADMIN (USE ONCE ONLY)
=============================== */
export const ensureAdmin = async (req, res) => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(400).json({ message: "Admin env not set" });
  }

  const exists = await User.findOne({
    email: ADMIN_EMAIL.toLowerCase(),
  });

  if (exists) {
    return res.json({ message: "Admin already exists" });
  }

  const admin = await User.create({
    name: "Admin",
    email: ADMIN_EMAIL.toLowerCase(),
    password: ADMIN_PASSWORD,
    isAdmin: true,
  });

  res.json({
    message: "Admin created",
    email: admin.email,
  });
};
