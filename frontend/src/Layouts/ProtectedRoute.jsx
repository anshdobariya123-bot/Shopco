import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../pages/PageLoader";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // ⏳ Still checking auth
  if (loading) {
    return <PageLoader />;
  }

  // ❌ Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authenticated → render child routes
  return <Outlet />;
}
