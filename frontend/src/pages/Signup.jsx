import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess("Signup successful! Please login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-pink-50 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT SIDE (TEXT) */}
        <div className="hidden md:flex flex-col justify-center px-10 bg-linear-to-br from-indigo-500 to-pink-500 text-white">
          <h1 className="text-3xl font-bold mb-4">Create your account ✨</h1>
          <p className="text-sm text-indigo-50">
            Join us to enjoy exclusive offers, faster checkout and order tracking.
          </p>
        </div>

        {/* RIGHT SIDE (FORM) */}
        <div className="px-8 py-10">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center md:text-left">
            Sign Up
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center md:text-left">
            It only takes a minute to get started.
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 text-sm text-green-700 bg-green-100 border border-green-200 px-3 py-2 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold mt-2 transition
                ${
                  loading
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-500 to-pink-500 hover:opacity-90 shadow-md"
                }`}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
