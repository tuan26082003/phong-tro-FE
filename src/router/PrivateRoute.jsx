import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useState, useEffect } from "react";

export default function PrivateRoute({ roles, children }) {
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Đợi một chút để localStorage sẵn sàng
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  console.log("PrivateRoute - token:", token ? "exists" : "missing");
  console.log("PrivateRoute - userStr:", userStr);

  // Hiển thị loading trong khi check
  if (isChecking) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!token || !userStr) return <Navigate to="/login" replace />;

  const userData = JSON.parse(userStr);
  console.log("PrivateRoute - parsed userData:", userData);
  
  const roleName = userData?.role || userData?.user?.roleName;
  console.log("PrivateRoute - roleName:", roleName);
  console.log("PrivateRoute - required roles:", roles);

  if (!roleName) return <Navigate to="/login" replace />;

  // Hỗ trợ cả ADMIN và ROLE_ADMIN
  const normalizedRole = roleName.replace("ROLE_", "");
  const hasAccess = roles.some(r => r === roleName || r === normalizedRole || `ROLE_${r}` === roleName);
  
  console.log("PrivateRoute - hasAccess:", hasAccess);

  // Nếu role không nằm trong roles → chặn
  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
