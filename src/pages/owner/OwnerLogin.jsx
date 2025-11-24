import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Card, Input, Button, Form, Typography } from "antd";

export default function OwnerLogin() {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);

    await login({
      email: values.email,
      password: values.password,
      platform: "WEB",
      deviceToken: "",
      versionApp: "1.0",
    });

    window.location.href = "/admin/dashboard";
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
        padding: 20,
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Typography.Title
          level={3}
          style={{ textAlign: "center", marginBottom: 30 }}
        >
          HỆ THỐNG QUẢN TRỊ
        </Typography.Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Nhập email" }]}
          >
            <Input size="large" placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Nhập mật khẩu" }]}
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
      </Card>
    </div>
  );
}
