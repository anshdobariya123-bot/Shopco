import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-pink-50 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center px-10 bg-linear-to-br from-indigo-500 to-pink-500 text-white">
          <h1 className="text-3xl font-bold mb-4">Welcome back 👋</h1>
          <p className="text-sm text-indigo-50">
            Login to manage your orders, wishlist and profile.
          </p>
        </div>

        {/* RIGHT FORM */}
        <div className="px-8 py-10">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center md:text-left">
            Login
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center md:text-left">
            Enter your credentials to continue
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition
                ${
                  loading
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-500 to-pink-500 hover:opacity-90 shadow-md"
                }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
