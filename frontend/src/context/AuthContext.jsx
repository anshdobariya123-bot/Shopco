import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = not logged in
  const [loading, setLoading] = useState(true);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setUser(data);
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /* ================= LOGIN ================= */
  const login = useCallback((data) => {
    localStorage.setItem("token", data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      isAdmin: data.isAdmin,
    });
  }, []);

  /* ================= LOGOUT ================= */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("cartItems");
    setUser(null);
  }, []);

  /* ================= MEMOIZED VALUE ================= */
  const value = useMemo(
    () => ({
      user,
      setUser,           // ✅ ADD THIS LINE
      loading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
