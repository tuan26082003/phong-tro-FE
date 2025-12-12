import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user khi reload trang
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // LOGIN API
  const login = async (payload) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/auth/login", // đổi URL API nếu cần
        payload
      );

      const data = res.data;

      // Nếu backend trả dạng { status, message, ... } mà status >= 400
      if (data.status >= 400) {
        toast.error(data.message || "Đăng nhập thất bại");
        return null;
      }

      const userData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.userResponse, // user info
        role: data.roleName,     // VD: ADMIN / OWNER / RENTER hoặc ROLE_ADMIN...
      };

      // Lưu localStorage
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Lưu vào state context
      setUser(userData);

      const role = userData.role;

      // Redirect theo role
      if (role === "ADMIN" || role === "ROLE_ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (role === "OWNER" || role === "ROLE_OWNER") {
        window.location.href = "/owner/dashboard";
      } else if (role === "RENTER" || role === "ROLE_RENTER") {
        window.location.href = "/"; // renter về trang chủ
      } else {
        // role lạ -> cho về trang chủ
        window.location.href = "/";
      }

      return userData;
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối server");
      return null;
    }
  };

  // LOGOUT: xóa token + về trang chủ
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/"; // luôn về trang chủ
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
