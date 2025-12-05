import { Navigate } from "react-router-dom";

export default function PrivateRoute({ roles, children }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) return <Navigate to="/admin/login" replace />;

  const user = JSON.parse(userStr)?.user;
  if (!user) return <Navigate to="/admin/login" replace />;

  const roleName = user.roleName;

  // Nếu role không nằm trong roles → chặn
  if (!roles.includes(roleName)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
