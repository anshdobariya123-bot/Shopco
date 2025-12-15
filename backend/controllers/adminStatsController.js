import User from "../models/User.js";
import Order from "../models/Order.js";

/* ✅ ADMIN DASHBOARD STATS */
export const getAdminStats = async (req, res) => {
  const users = await User.countDocuments();

  const orders = await Order.countDocuments();

  const pendingOrders = await Order.countDocuments({
    isDelivered: false,
    isCancelled: false,
  });

  const revenueAgg = await Order.aggregate([
    { $match: { isDelivered: true } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);

  const revenue =
    revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  res.json({
    users,
    orders,
    pendingOrders,
    revenue,
  });
};
