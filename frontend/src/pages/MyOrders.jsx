import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../api/orderApi";

/* ================= STATUS HELPER ================= */
const getOrderStatus = (order) => {
  if (order.isCancelled) {
    return { text: "Cancelled", color: "bg-red-100 text-red-700" };
  }
  if (order.isDelivered) {
    return { text: "Delivered", color: "bg-green-100 text-green-700" };
  }
  if (order.isPaid) {
    return { text: "Processing", color: "bg-indigo-100 text-indigo-700" };
  }
  return { text: "Pending", color: "bg-yellow-100 text-yellow-700" };
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH ORDERS ================= */
  const loadOrders = useCallback(async (signal) => {
    try {
      setLoading(true);
      const data = await fetchMyOrders({ signal });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error(err);
        setError("Failed to load your orders");
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadOrders(controller.signal);
    return () => controller.abort();
  }, [loadOrders]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="p-10 text-center text-gray-500">
        Loading your orders…
      </p>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => loadOrders()}
          className="px-6 py-2 rounded-full
                     bg-indigo-600 text-white font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (orders.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-semibold mb-2">
          You haven’t placed any orders 📦
        </h2>
        <p className="text-gray-500 mb-4">
          Start shopping to see your orders here.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-full
                     bg-linear-to-r from-indigo-500 to-pink-500
                     text-white font-medium hover:opacity-90 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  /* ================= LIST ================= */
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const status = getOrderStatus(order);

          return (
            <div
              key={order._id}
              className="bg-white border rounded-2xl shadow-sm
                         p-6 flex flex-col sm:flex-row
                         sm:items-center justify-between gap-4"
            >
              {/* LEFT */}
              <div className="space-y-1">
                <p className="font-semibold">
                  Order #{order._id.slice(-8)}
                </p>
                <p className="text-sm text-gray-500">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full
                              text-xs font-medium ${status.color}`}
                >
                  {status.text}
                </span>
              </div>

              {/* RIGHT */}
              <div className="text-right space-y-2">
                <p className="text-lg font-bold text-indigo-600">
                  ₹{order.totalPrice.toLocaleString()}
                </p>

                <Link
                  to={`/order/${order._id}`}
                  className="inline-block text-sm font-medium
                             text-indigo-600 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
