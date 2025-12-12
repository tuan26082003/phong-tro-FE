import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Tabs,
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PostRoom() {
  const navigate = useNavigate();
  const [registerForm] = Form.useForm();
  const [loginForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("login");
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // Kiểm tra đã đăng nhập chưa
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setCurrentUser(userData.user);

        // Pre-fill form đăng ký với thông tin user
        registerForm.setFieldsValue({
          fullName: userData.user?.fullName || "",
          email: userData.user?.email || "",
          phone: userData.user?.phone || "",
          citizenId: userData.user?.citizenId || "",
        });
      } catch (e) {
        console.error("Parse user error:", e);
      }
    }
  }, [registerForm]);

  const handleLogin = async (values) => {
    try {
      setLoading(true);

      const response = await axiosClient.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      const { accessToken, refreshToken, userResponse } = response.data;

      // Lưu vào localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify({ user: userResponse }));
      localStorage.setItem("role", userResponse.roleName);

      setCurrentUser(userResponse);

      // Pre-fill form đăng ký
      registerForm.setFieldsValue({
        fullName: userResponse.fullName || "",
        email: userResponse.email || "",
        phone: userResponse.phone || "",
        citizenId: userResponse.citizenId || "",
      });

      toast.success("Đăng nhập thành công!");
      
      // Reload trang để hiển thị form đăng ký
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOwner = async (values) => {
    try {
      setLoading(true);

      const payload = {
        reason: values.reason,
      };

      const response = await axiosClient.post("/api/owner-requests", payload);

      // Kiểm tra response
      console.log("Response:", response);

      toast.success(response.data?.message || "Gửi yêu cầu đăng ký làm chủ trọ thành công!");
      
      // Redirect về trang chủ sau 1.5s
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Submit error:", err);
      
      // Hiển thị lỗi từ backend
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Không thể gửi yêu cầu. Vui lòng thử lại";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginFormContent = (
    <Form form={loginForm} layout="vertical" onFinish={handleLogin} size="large">
      <Form.Item
        name="email"
        label={<span style={{ fontWeight: 500 }}>Email</span>}
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      >
        <Input
          prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
          placeholder="example@email.com"
          style={{ height: 44, borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label={<span style={{ fontWeight: 500 }}>Mật khẩu</span>}
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
          placeholder="Nhập mật khẩu"
          style={{ height: 44, borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          block
          style={{
            height: 46,
            borderRadius: 8,
            background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
            border: "none",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Đăng nhập
        </Button>
      </Form.Item>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Chưa có tài khoản?{" "}
          <a
            onClick={() => navigate("/register")}
            style={{ color: "#2196F3", fontWeight: 600, cursor: "pointer" }}
          >
            Đăng ký ngay
          </a>
        </Text>
      </div>
    </Form>
  );

  const registerFormContent = (
    <Form
      form={registerForm}
      layout="vertical"
      onFinish={handleRegisterOwner}
      size="large"
    >
      <Form.Item
        name="fullName"
        label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
      >
        <Input
          prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
          placeholder="Nguyễn Văn A"
          disabled={currentUser}
          style={{ height: 44, borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        name="email"
        label={<span style={{ fontWeight: 500 }}>Email</span>}
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      >
        <Input
          prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
          placeholder="example@email.com"
          disabled={currentUser}
          style={{ height: 44, borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        name="phone"
        label={<span style={{ fontWeight: 500 }}>Số điện thoại</span>}
        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
      >
        <Input
          prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
          placeholder="0123456789"
          disabled={currentUser}
          style={{ height: 44, borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        name="citizenId"
        label={<span style={{ fontWeight: 500 }}>Số CCCD/CMND</span>}
        rules={[{ required: true, message: "Vui lòng nhập số CCCD" }]}
      >
        <Input
          prefix={<IdcardOutlined style={{ color: "#9ca3af" }} />}
          placeholder="001234567890"
          disabled={currentUser}
          style={{ height: 44, borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        name="reason"
        label={<span style={{ fontWeight: 500 }}>Lý do muốn trở thành chủ trọ</span>}
        rules={[
          { required: true, message: "Vui lòng nhập lý do" },
          { min: 20, message: "Lý do phải có ít nhất 20 ký tự" },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Ví dụ: Tôi có 5 năm kinh nghiệm quản lý nhà trọ, hiện đang sở hữu 2 dãy phòng trọ tại..."
          maxLength={500}
          showCount
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button
            size="large"
            onClick={() => navigate("/")}
            style={{ 
              minWidth: 120, 
              height: 46, 
              borderRadius: 8,
              fontWeight: 500 
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            style={{
              minWidth: 160,
              height: 46,
              borderRadius: 8,
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              border: "none",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Gửi yêu cầu
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "60px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        style={{
          maxWidth: 550,
          width: "100%",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e8eaed",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HomeOutlined
              style={{
                fontSize: 32,
                color: "#fff",
              }}
            />
          </div>
          <Title level={2} style={{ margin: 0, color: "#1a1a1a", fontSize: 28 }}>
            Đăng ký làm Chủ trọ
          </Title>
          <Text type="secondary" style={{ fontSize: 15, display: "block", marginTop: 8 }}>
            {currentUser
              ? "Hoàn tất thông tin để gửi yêu cầu đến quản trị viên"
              : "Đăng nhập để bắt đầu trở thành chủ trọ"}
          </Text>
        </div>

        {currentUser ? (
          <>
            {registerFormContent}
            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "#e3f2fd",
                borderRadius: 8,
                borderLeft: "4px solid #2196F3",
              }}
            >
              <Text style={{ fontSize: 13, color: "#424242", lineHeight: 1.6 }}>
                <strong style={{ color: "#1976D2" }}>💡 Lưu ý:</strong> Sau khi
                gửi yêu cầu, quản trị viên sẽ xem xét và phê duyệt trong vòng
                24-48 giờ. Bạn sẽ nhận được email thông báo kết quả.
              </Text>
            </div>
          </>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "login",
                label: "Đăng nhập",
                children: loginFormContent,
              },
              {
                key: "register",
                label: "Đăng ký làm chủ trọ",
                children: registerFormContent,
                disabled: !currentUser,
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
