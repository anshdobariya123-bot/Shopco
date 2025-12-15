import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  /* ===============================
     LOAD USERS
  =============================== */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/admin/users");

      // keep admins on top
      data.sort((a, b) => b.isAdmin - a.isAdmin);

      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ===============================
     BLOCK / UNBLOCK USER
  =============================== */
  const blockHandler = async (id, isBlocked) => {
    const ok = window.confirm(
      isBlocked
        ? "Unblock this user?"
        : "Block this user? They will not be able to login."
    );
    if (!ok) return;

    try {
      setUpdatingId(id);
      await api.put(`/admin/users/${id}/block`);
      await loadUsers();
    } catch {
      alert("Failed to update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ===============================
     SEARCH FILTER
  =============================== */
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="p-6 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Users</h1>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="border px-4 py-2 rounded-lg w-full md:w-64
                     focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="text-left">Email</th>
              <th className="text-center">Orders</th>
              <th className="text-center">Total Spent</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* LOADING */}
            {loading && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  Loading users…
                </td>
              </tr>
            )}

            {/* EMPTY */}
            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {/* USERS */}
            {!loading &&
              filteredUsers.map((u) => (
                <tr key={u._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">
                      {u.name}
                      {u.isAdmin && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full 
                                         bg-indigo-100 text-indigo-700">
                          Admin
                        </span>
                      )}
                    </p>
                  </td>

                  <td>{u.email}</td>

                  <td className="text-center">{u.ordersCount}</td>

                  <td className="text-center font-medium">
                    ₹{u.totalSpent.toLocaleString()}
                  </td>

                  <td className="text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          u.isBlocked
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                    >
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>

                  <td className="text-center space-x-3">
                    <Link
                      to={`/admin/users/${u._id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      View
                    </Link>

                    {!u.isAdmin && (
                      <button
                        onClick={() =>
                          blockHandler(u._id, u.isBlocked)
                        }
                        disabled={updatingId === u._id}
                        className={`hover:underline
                          ${
                            updatingId === u._id
                              ? "text-gray-400"
                              : "text-red-600"
                          }`}
                      >
                        {updatingId === u._id
                          ? "Updating…"
                          : u.isBlocked
                          ? "Unblock"
                          : "Block"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
