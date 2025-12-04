import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Card, Input, Button, Form, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";

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

    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        padding: 20,
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          paddingBottom: 10,
        }}
      >
        <Typography.Title
          level={3}
          style={{ textAlign: "center", marginBottom: 10, fontWeight: 700 }}
        >
          Đăng nhập người thuê trọ
        </Typography.Title>

        <Typography.Paragraph
          style={{
            textAlign: "center",
            marginBottom: 28,
            fontSize: 14,
            color: "gray",
          }}
        >
          Truy cập hệ thống để tìm phòng trọ
        </Typography.Paragraph>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input size="large" placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{ width: "100%", marginTop: 10 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Typography.Text>
            Chưa có tài khoản?{" "}
            <Link to="/register" style={{ color: "#1677ff" }}>
              Đăng ký ngay
            </Link>
          </Typography.Text>
        </div>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Typography.Text>
            <Link to="/" style={{ color: "#1677ff" }}>
              Quay lại Trang chủ
            </Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
