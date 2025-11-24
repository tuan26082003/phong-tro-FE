import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);

  const handleLogin = () => {
    login("renter");
  };

  return (
    <div>
      <h2>Đăng nhập người thuê</h2>
      <button onClick={handleLogin}>Login Renter</button>
    </div>
  );
}
