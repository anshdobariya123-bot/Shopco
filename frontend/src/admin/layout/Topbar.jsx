import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMenu } from "react-icons/fi";

export default function Topbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const logoutHandler = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b px-6
                       flex items-center justify-between
                       sticky top-0 z-30">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* ☰ MOBILE MENU */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-gray-600 hover:text-gray-900"
        >
          <FiMenu size={22} />
        </button>

        <h2 className="font-semibold text-lg text-gray-800">
          Admin Dashboard
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* USER NAME */}
        <span className="hidden sm:block text-sm text-gray-600">
          {user?.name || "Admin"}
        </span>

        {/* AVATAR */}
        <div
          className="w-9 h-9 rounded-full
                     flex items-center justify-center
                     bg-linear-to-r from-indigo-500 to-pink-500
                     text-white font-bold uppercase select-none"
        >
          {user?.name?.charAt(0) || "A"}
        </div>

        {/* LOGOUT */}
        <button
          onClick={logoutHandler}
          className="px-4 py-1.5 text-sm font-medium 
                     bg-red-500 text-white rounded-lg
                     hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
