import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Input, Button, Form, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";
import loginBg from "../../assets/tro1.jpg";

export default function RenterLogin() {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Nếu đã có token thì đá thẳng về trang chủ
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);

    const payload = {
      email: values.email,
      password: values.password,
      platform: "WEB",
      deviceToken: "",
      versionApp: "1.0",
    };

    const success = await login(payload);

    setLoading(false);

    // Chỉ điều hướng về trang chủ nếu đăng nhập thành công
    if (success) {
      navigate("/");
    }
    // Nếu thất bại, ở lại trang login (AuthContext đã hiển thị toast lỗi)
  };

  return (
    <div style={styles.container}>
      {/* Bên trái - Ảnh */}
      <div style={styles.leftSide}>
        <img src={loginBg} alt="Phòng trọ" style={styles.image} />
        <div style={styles.imageOverlay}>
          <HomeOutlined style={styles.overlayIcon} />
          <h2 style={styles.overlayTitle}>Phòng Trọ Online</h2>
          <p style={styles.overlayText}>Tìm phòng trọ dễ dàng, nhanh chóng và an toàn</p>
        </div>
      </div>

      {/* Bên phải - Form */}
      <div style={styles.rightSide}>
        <div style={styles.formWrapper}>
          <div style={styles.logoSection}>
            <div style={styles.logoCircle}>
              <UserOutlined style={styles.logoIcon} />
            </div>
          </div>

          <Typography.Title level={2} style={styles.title}>
            Đăng nhập
          </Typography.Title>

          <Typography.Paragraph style={styles.subtitle}>
            Chào mừng bạn quay trở lại!
          </Typography.Paragraph>

          <Form layout="vertical" onFinish={onFinish} style={styles.form}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email" }]}
            >
              <Input 
                size="large" 
                placeholder="Email của bạn" 
                prefix={<UserOutlined style={styles.inputIcon} />}
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password 
                size="large" 
                placeholder="Mật khẩu" 
                prefix={<LockOutlined style={styles.inputIcon} />}
                style={styles.input}
              />
            </Form.Item>

            <div style={styles.forgotPassword}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                style={styles.loginButton}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>hoặc</span>
          </div>

          <div style={styles.registerSection}>
            <Typography.Text style={styles.registerText}>
              Chưa có tài khoản?{" "}
              <Link to="/register" style={styles.registerLink}>
                Đăng ký ngay
              </Link>
            </Typography.Text>
          </div>

          <div style={styles.homeLink}>
            <Link to="/" style={styles.backHome}>
              <HomeOutlined /> Quay lại Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row",
  },
  // Bên trái - Ảnh
  leftSide: {
    width: "50%",
    height: "100vh",
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 50%)",
    backdropFilter: "saturate(1.2) contrast(1.05)",
    WebkitBackdropFilter: "saturate(1.2) contrast(1.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    color: "#fff",
    padding: 40,
    paddingBottom: 60,
    textAlign: "center",
  },
  overlayIcon: {
    fontSize: 60,
    marginBottom: 20,
    color: "#fff",
  },
  overlayTitle: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 12,
    color: "#fff",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  overlayText: {
    fontSize: 18,
    color: "#fff",
    maxWidth: 300,
    lineHeight: 1.6,
  },
  // Bên phải - Form
  rightSide: {
    width: "50%",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    padding: 40,
    overflowY: "auto",
  },
  formWrapper: {
    width: "100%",
    maxWidth: 400,
  },
  logoSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(33, 150, 243, 0.4)",
  },
  logoIcon: {
    fontSize: 32,
    color: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: 700,
    color: "#1f2937",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    fontSize: 15,
    color: "#6b7280",
  },
  form: {
    width: "100%",
  },
  input: {
    borderRadius: 10,
    padding: "12px 14px",
    border: "1px solid #e5e7eb",
  },
  inputIcon: {
    color: "#2196F3",
    marginRight: 8,
  },
  forgotPassword: {
    textAlign: "right",
    marginBottom: 20,
    marginTop: -10,
  },
  forgotLink: {
    color: "#2196F3",
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    background: "linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)",
    border: "none",
    boxShadow: "0 4px 15px rgba(33, 150, 243, 0.4)",
  },
  divider: {
    textAlign: "center",
    margin: "24px 0",
    position: "relative",
  },
  dividerText: {
    background: "#fff",
    padding: "0 16px",
    color: "#9ca3af",
    fontSize: 14,
  },
  registerSection: {
    textAlign: "center",
    marginBottom: 20,
  },
  registerText: {
    color: "#6b7280",
    fontSize: 15,
  },
  registerLink: {
    color: "#2196F3",
    fontWeight: 600,
  },
  homeLink: {
    textAlign: "center",
  },
  backHome: {
    color: "#6b7280",
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
};
