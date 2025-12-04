import { useState, useEffect } from "react";
import { Card, Input, Button, Form, Typography, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

export default function RegisterRenter() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Nếu đã đăng nhập (có token) thì không cho vào trang đăng ký, đá về trang chủ
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const logErr = (err, msg) => {
    console.error("=== REGISTER ERROR ===");

    console.error("URL:", err.config?.url);
    console.error("METHOD:", err.config?.method);
    console.error("DATA:", err.config?.data);

    if (err.response) {
      console.error("STATUS:", err.response.status);
      console.error("BODY:", err.response.data);
      toast.error(msg || err.response.data.message);
    } else if (err.request) {
      console.error("NO RESPONSE:", err.request);
      toast.error("Không nhận phản hồi từ server");
    } else {
      console.error("REQUEST ERROR:", err.message);
      toast.error(err.message);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);

    const payload = {
      email: values.email,
      fullName: values.fullName,
      phone: values.phone,
      password: values.password,
      gender: values.gender,
      address: values.address,
      citizenId: values.citizenId,
    };

    try {
      const reqRegister = await axiosClient.post("/api/user", payload);

      // Nếu backend bọc status trong body
      if (reqRegister.data?.status >= 400) {
        toast.error(reqRegister.data.message || "Đăng ký thất bại");
        return;
      }

      toast.success("Đăng ký thành công");
      navigate("/login"); // chuyển hướng mềm, không reload
    } catch (err) {
      logErr(err, "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
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
          width: 480,
          borderRadius: 12,
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          paddingBottom: 20,
        }}
      >
        <Typography.Title
          level={3}
          style={{ textAlign: "center", marginBottom: 10, fontWeight: 700 }}
        >
          Đăng ký người thuê trọ
        </Typography.Title>

        <Typography.Paragraph
          style={{
            textAlign: "center",
            marginBottom: 25,
            fontSize: 14,
            color: "gray",
          }}
        >
          Tạo tài khoản để bắt đầu tìm phòng
        </Typography.Paragraph>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: "Nhập họ và tên" }]}
          >
            <Input size="large" placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Nhập email" }]}
          >
            <Input size="large" placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Nhập số điện thoại" }]}
          >
            <Input size="large" placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Nhập mật khẩu" }]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            initialValue="MALE"
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Select.Option value="MALE">Nam</Select.Option>
              <Select.Option value="FEMALE">Nữ</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Nhập địa chỉ" }]}
          >
            <Input size="large" placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            label="CCCD"
            name="citizenId"
            rules={[{ required: true, message: "Nhập số CCCD" }]}
          >
            <Input size="large" placeholder="Nhập số CCCD" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{ width: "100%", marginTop: 10 }}
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Typography.Text>
            Đã có tài khoản?{" "}
            <Link to="/login" style={{ color: "#1677ff" }}>
              Đăng nhập
            </Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
