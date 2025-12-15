import { Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import PageLoader from "../pages/PageLoader";

/* Lazy load layout components */
const Navbar = lazy(() => import("../components/Navbar"));
const Footer = lazy(() => import("../pages/Footer"));

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Navbar */}
      <Suspense fallback={<PageLoader />}>
        <Navbar />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>

    </div>
  );
}
