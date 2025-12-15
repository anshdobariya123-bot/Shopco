import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

export default function UserDetails() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  /* ===============================
     FETCH USER DETAILS
  =============================== */
  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/admin/users/${id}`);
      setData(data);
    } catch {
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  /* ===============================
     BLOCK / UNBLOCK USER
  =============================== */
  const toggleBlockHandler = async () => {
    try {
      setUpdating(true);
      await api.put(`/admin/users/${id}/block`);
      await loadUser();
    } catch {
      alert("Failed to update user status");
    } finally {
      setUpdating(false);
    }
  };

  /* ===============================
     STATES
  =============================== */
  if (loading) {
    return (
      <p className="p-6 text-center text-gray-500">
        Loading user…
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-center text-red-600">
        {error}
      </p>
    );
  }

  const { user, orders = [] } = data;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Details</h1>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium
            ${
              user.isBlocked
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
        >
          {user.isBlocked ? "Blocked" : "Active"}
        </span>
      </div>

      {/* USER INFO */}
      <section className="bg-white border rounded-xl p-5 space-y-1">
        <p className="text-lg font-semibold">{user.name}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
        <p className="text-xs text-gray-500">
          Joined on {new Date(user.createdAt).toLocaleDateString()}
        </p>

        <button
          onClick={toggleBlockHandler}
          disabled={updating}
          className={`mt-4 px-5 py-2 rounded-lg text-sm font-medium
            ${
              user.isBlocked
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
            text-white disabled:bg-gray-400`}
        >
          {updating
            ? "Updating…"
            : user.isBlocked
            ? "Unblock User"
            : "Block User"}
        </button>
      </section>

      {/* ORDERS */}
      <section className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold mb-4">Orders</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No orders placed by this user.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Order</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Total</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-center px-4 py-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => {
                  const status = o.isCancelled
                    ? "Cancelled"
                    : o.isDelivered
                    ? "Delivered"
                    : o.isShipped
                    ? "Shipped"
                    : "Processing";

                  return (
                    <tr
                      key={o._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium">
                        #{o._id.slice(-6)}
                      </td>

                      <td className="px-4 py-2">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-2 font-semibold">
                        ₹{o.totalPrice.toLocaleString()}
                      </td>

                      <td className="px-4 py-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs
                            ${
                              status === "Delivered"
                                ? "bg-green-100 text-green-700"
                                : status === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : status === "Shipped"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-2 text-center">
                        <Link
                          to={`/admin/orders/${o._id}`}
                          className="text-indigo-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
