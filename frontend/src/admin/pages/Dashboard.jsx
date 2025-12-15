import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Users,
  ShoppingCart,
  Clock,
  IndianRupee,
} from "lucide-react";

const EMPTY_STATS = {
  users: 0,
  orders: 0,
  pendingOrders: 0,
  revenue: 0,
};

export default function Dashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH STATS ================= */
  useEffect(() => {
    const controller = new AbortController();

    const loadStats = async () => {
      try {
        const { data } = await api.get("/admin/stats", {
          signal: controller.signal,
        });

        setStats({
          users: data?.users ?? 0,
          orders: data?.orders ?? 0,
          pendingOrders: data?.pendingOrders ?? 0,
          revenue: data?.revenue ?? 0,
        });
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError("Failed to load dashboard stats");
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    return () => controller.abort();
  }, []);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-red-600 text-center">
        {error}
      </p>
    );
  }

  const revenueFormatted = `₹${stats.revenue.toLocaleString()}`;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Users"
          value={stats.users}
          icon={<Users />}
          color="indigo"
        />

        <StatCard
          title="Orders"
          value={stats.orders}
          icon={<ShoppingCart />}
          color="blue"
        />

        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<Clock />}
          color="yellow"
        />

        <StatCard
          title="Revenue"
          value={revenueFormatted}
          icon={<IndianRupee />}
          color="green"
        />
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
function StatCard({ title, value, icon, color }) {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6 
                    hover:shadow-md transition flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>

      <div className={`p-4 rounded-full ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}
