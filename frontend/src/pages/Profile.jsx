import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/users/profile");
        setUser(data);
        setName(data.name || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* ================= UPDATE PROFILE ================= */
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const { data } = await api.put("/users/profile", {
        name: name.trim(),
      });

      setUser(data);

      // ✅ Update auth context safely
      setAuthUser((prev) => ({
        ...prev,
        name: data.name,
      }));

      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= SAFE GUARDS ================= */
  if (loading) {
    return <p className="p-6 text-center">Loading profile…</p>;
  }

  if (!user) {
    return (
      <p className="p-6 text-center text-red-500">
        Failed to load profile
      </p>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <section className="bg-white border rounded-xl p-6 space-y-1">
        <p className="font-semibold text-lg">{user.name}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
        <p className="text-xs text-gray-500">
          Joined on {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </section>

      <section className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Edit Profile</h2>

        {success && <p className="text-green-600">{success}</p>}
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={submitHandler} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-4 py-3 rounded-lg"
          />

          <button
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
