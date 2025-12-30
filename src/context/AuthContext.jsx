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
  const login = async (payload, options = { redirect: true }) => {
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

      // Redirect theo role (mặc định) - nếu caller muốn skip redirect, đặt options.redirect = false
      if (options && options.redirect === false) {
        // do not redirect
      } else {
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
      }

      // return both normalized userData and raw response so callers can inspect codes
      return { userData, raw: data };
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối server");
      return null;
    }
  };

  // Set auth state from existing tokens/user (used by social login flows)
  const setAuth = (authData, options = { persist: true, redirect: true }) => {
    if (!authData) return;
    const accessToken = authData.accessToken || authData.token || authData.access_token;
    const refreshToken = authData.refreshToken || authData.refresh_token || authData.refreshToken;
    const userResp = authData.user || authData.userResponse || authData.user_response || null;
    const role = authData.role || authData.roleName || (userResp && userResp.roleName) || null;

    const userData = { accessToken, refreshToken, user: userResp, role };

    if (options.persist) {
      try {
        if (accessToken) localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (e) {
        console.warn('Failed to persist auth data', e);
      }
    }

    setUser(userData);

    if (options.redirect) {
      if (role === "ADMIN" || role === "ROLE_ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (role === "OWNER" || role === "ROLE_OWNER") {
        window.location.href = "/owner/dashboard";
      } else {
        window.location.href = "/";
      }
    }
  };

  // LOGOUT: xóa token + về trang chủ
  const logout = () => {
    // remove all known token/user keys (cover multiple naming variants)
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      localStorage.removeItem('accessToken');
    } catch (e) {
      console.warn('Error clearing localStorage during logout', e);
    }

    setUser(null);
    // redirect to public homepage
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
