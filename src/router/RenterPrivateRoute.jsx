import { Navigate } from "react-router-dom";

export default function RenterPrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr)?.user;
  if (!user) return <Navigate to="/login" replace />;

  if (user.roleName !== "RENTER") {
    return <Navigate to="/login" replace />;
  }

  console.log("RenterPrivateRoute: Authenticated as RENTER");

  return children;
}
