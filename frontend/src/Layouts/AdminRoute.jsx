import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../pages/PageLoader";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  // ⏳ Checking auth
  if (loading) {
    return <PageLoader />;
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but not admin
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
    // or: <Navigate to="/unauthorized" replace />
  }

  // ✅ Admin → render admin routes
  return <Outlet />;
}
