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
    // payload = { email, password, platform, deviceToken, versionApp }

    const res = await axios.post(
      "http://localhost:8080/auth/login", // đổi URL API vào đây
      payload
    );

    const data = res.data;

    if (data.status >= 400) {
      toast.error(data.message);
      return;
    }

    const userData = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.userResponse,
      role: data.roleName,
    };

    // Lưu localStorage
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Set vào state
    setUser(userData);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
