import { useEffect } from "react";
import { Link , useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      {/* IMAGE */}
      <img
        src="/404.png"
        alt="Page not found"
        className="w-80 mb-8 opacity-90"
      />

      {/* TITLE */}
      <h1 className="text-3xl font-extrabold mb-2">
        Page Not Found
      </h1>

      {/* DESCRIPTION */}
      <p className="text-gray-500 max-w-md mb-6">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>

      {/* ACTION */}
      <Link
        to="/"
        className="text-indigo-600 font-medium hover:underline"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
