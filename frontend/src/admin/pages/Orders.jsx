import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  /* ===============================
     LOAD ORDERS
  =============================== */
  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ===============================
     ACTION HANDLERS
  =============================== */
  const shipHandler = async (id) => {
    try {
      setUpdatingId(id);
      await api.put(`/admin/orders/${id}/ship`);
      await loadOrders();
    } catch {
      alert("Failed to ship order");
    } finally {
      setUpdatingId(null);
    }
  };

  const deliverHandler = async (id) => {
    try {
      setUpdatingId(id);
      await api.put(`/admin/orders/${id}/deliver`);
      await loadOrders();
    } catch {
      alert("Failed to mark order delivered");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ===============================
     STATUS BADGE
  =============================== */
  const StatusBadge = ({ order }) => {
    if (order.isCancelled)
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
          Cancelled
        </span>
      );

    if (order.isDelivered)
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
          Delivered
        </span>
      );

    if (order.isShipped)
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
          Shipped
        </span>
      );

    return (
      <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
        Processing
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Orders</h2>

      {/* ERROR */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500 py-10">
          Loading orders…
        </p>
      )}

      {/* EMPTY */}
      {!loading && orders.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No orders found
        </p>
      )}

      {/* TABLE */}
      {!loading && orders.length > 0 && (
        <div className="bg-white border rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => {
                const isUpdating = updatingId === o._id;

                return (
                  <tr
                    key={o._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium">
                      #{o._id.slice(-6)}
                    </td>

                    <td className="px-6 py-4">
                      {o.user?.name || "Guest"}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      ₹{o.totalPrice.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge order={o} />
                    </td>

                    <td className="px-6 py-4">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-center space-x-3">
                      <Link
                        to={`/admin/orders/${o._id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        View
                      </Link>

                      {!o.isCancelled && !o.isShipped && (
                        <button
                          onClick={() => shipHandler(o._id)}
                          disabled={isUpdating}
                          aria-busy={isUpdating}
                          className="text-blue-600 hover:underline disabled:text-gray-400"
                        >
                          {isUpdating ? "Shipping…" : "Ship"}
                        </button>
                      )}

                      {o.isShipped && !o.isDelivered && (
                        <button
                          onClick={() => deliverHandler(o._id)}
                          disabled={isUpdating}
                          aria-busy={isUpdating}
                          className="text-green-600 hover:underline disabled:text-gray-400"
                        >
                          {isUpdating ? "Updating…" : "Deliver"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
