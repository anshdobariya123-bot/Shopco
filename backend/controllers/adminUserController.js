import User from "../models/User.js";
import Order from "../models/Order.js";

/* ✅ GET ALL USERS */
export const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");

  const usersWithStats = await Promise.all(
    users.map(async (u) => {
      const orders = await Order.find({ user: u._id });
      const totalSpent = orders.reduce(
        (sum, o) => sum + o.totalPrice,
        0
      );

      return {
        ...u._doc,
        ordersCount: orders.length,
        totalSpent,
      };
    })
  );

  res.json(usersWithStats);
};

/* ✅ GET USER DETAILS */
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const orders = await Order.find({ user: user._id });

  res.json({ user, orders });
};

/* ✅ BLOCK / UNBLOCK USER */
export const toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({ message: "User status updated", isBlocked: user.isBlocked });
};
