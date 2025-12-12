import React, { useState } from "react";
import { Typography, Form, Input, Button, Steps, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import bgImage from "../../assets/tro3.jpg";

const { Title, Paragraph, Text } = Typography;

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Đếm ngược thời gian gửi lại OTP
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Bước 1: Gửi OTP đến email
  const handleRequestOtp = async (values) => {
    setLoading(true);
    try {
      const response = await axiosClient.post(
        `/api/user/forgot-password/request-otp?email=${encodeURIComponent(values.email)}`
      );
      
      if (response.data?.code === 200) {
        message.success("Mã OTP đã được gửi đến email của bạn!");
        setEmail(values.email);
        setCurrentStep(1);
        startCountdown();
      } else {
        message.error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP và đặt lại mật khẩu
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/api/user/forgot-password/reset", {
        email: email,
        otp: values.otp,
        newPassword: values.newPassword,
      });

      if (response.data?.code === 200) {
        message.success("Đặt lại mật khẩu thành công!");
        setCurrentStep(2);
      } else {
        message.error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const response = await axiosClient.post(
        `/api/user/forgot-password/request-otp?email=${encodeURIComponent(email)}`
      );
      
      if (response.data?.code === 200) {
        message.success("Đã gửi lại mã OTP!");
        startCountdown();
      }
    } catch (error) {
      message.error("Không thể gửi lại OTP. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      background: "#f0fdf4",
    },
    formSection: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px 60px",
      background: "#fff",
      position: "relative",
    },
    formSectionOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "transparent",
      zIndex: 1,
    },
    formWrapper: {
      width: "100%",
      maxWidth: 420,
      position: "relative",
      zIndex: 2,
    },
    imageSection: {
      flex: 1,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
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
    },
    logo: {
      fontSize: 32,
      fontWeight: 800,
      color: "#2196F3",
      marginBottom: 8,
      textAlign: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      color: "#1f2937",
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 30,
      textAlign: "center",
    },
    input: {
      height: 48,
      borderRadius: 10,
      border: "1.5px solid #d1d5db",
      fontSize: 15,
    },
    button: {
      width: "100%",
      height: 50,
      borderRadius: 10,
      fontSize: 16,
      fontWeight: 600,
      background: "linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)",
      border: "none",
      marginTop: 8,
    },
    formItem: {
      marginBottom: 20,
    },
    formLabel: {
      fontWeight: 500,
      color: "#374151",
    },
    link: {
      color: "#2196F3",
      fontWeight: 600,
    },
    footer: {
      textAlign: "center",
      marginTop: 24,
      color: "#6b7280",
    },
    steps: {
      marginBottom: 40,
    },
    otpInput: {
      height: 56,
      borderRadius: 10,
      border: "1.5px solid #d1d5db",
      fontSize: 24,
      textAlign: "center",
      letterSpacing: 8,
      fontWeight: 600,
    },
    resendLink: {
      color: countdown > 0 ? "#9ca3af" : "#2196F3",
      cursor: countdown > 0 ? "not-allowed" : "pointer",
      fontWeight: 500,
    },
    successIcon: {
      fontSize: 80,
      color: "#2196F3",
      marginBottom: 24,
    },
    backLink: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#6b7280",
      marginBottom: 30,
      cursor: "pointer",
      fontSize: 14,
    },
    homeLink: {
      textAlign: "center",
      marginTop: 20,
    },
    backHome: {
      color: "#6b7280",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: 14,
      textDecoration: "none",
      transition: "color 0.2s",
    },
  };

  // Step 1: Nhập email
  const renderEmailStep = () => (
    <>
      <Title style={styles.title}>Quên mật khẩu?</Title>
      <Paragraph style={styles.subtitle}>
        Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu
      </Paragraph>

      <Form layout="vertical" onFinish={handleRequestOtp}>
        <Form.Item
          label={<span style={styles.formLabel}>Email</span>}
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
          style={styles.formItem}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
            style={styles.input}
            placeholder="Nhập địa chỉ email của bạn"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={styles.button}
          >
            Gửi mã OTP
          </Button>
        </Form.Item>
      </Form>
    </>
  );

  // Step 2: Nhập OTP và mật khẩu mới
  const renderOtpStep = () => (
    <>
      <div style={styles.backLink} onClick={() => setCurrentStep(0)}>
        <ArrowLeftOutlined /> Quay lại
      </div>

      <Title style={styles.title}>Xác nhận OTP</Title>
      <Paragraph style={styles.subtitle}>
        Nhập mã OTP đã gửi đến <strong>{email}</strong>
      </Paragraph>

      <Form form={form} layout="vertical" onFinish={handleResetPassword}>
        <Form.Item
          label={<span style={styles.formLabel}>Mã OTP</span>}
          name="otp"
          rules={[
            { required: true, message: "Vui lòng nhập mã OTP" },
            { len: 6, message: "Mã OTP gồm 6 chữ số" },
          ]}
          style={styles.formItem}
        >
          <Input
            prefix={<SafetyOutlined style={{ color: "#9ca3af" }} />}
            style={styles.otpInput}
            placeholder="••••••"
            maxLength={6}
          />
        </Form.Item>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Text style={{ color: "#6b7280" }}>Không nhận được mã? </Text>
          <Text style={styles.resendLink} onClick={handleResendOtp}>
            {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại"}
          </Text>
        </div>

        <Form.Item
          label={<span style={styles.formLabel}>Mật khẩu mới</span>}
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu ít nhất 6 ký tự" },
          ]}
          style={styles.formItem}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
          />
        </Form.Item>

        <Form.Item
          label={<span style={styles.formLabel}>Xác nhận mật khẩu</span>}
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không khớp"));
              },
            }),
          ]}
          style={styles.formItem}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={styles.button}
          >
            Đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </>
  );

  // Step 3: Thành công
  const renderSuccessStep = () => (
    <div style={{ textAlign: "center" }}>
      <CheckCircleOutlined style={styles.successIcon} />
      <Title style={styles.title}>Đặt lại mật khẩu thành công!</Title>
      <Paragraph style={styles.subtitle}>
        Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập với mật khẩu mới.
      </Paragraph>
      <Button
        type="primary"
        style={styles.button}
        onClick={() => navigate("/login")}
      >
        Đăng nhập ngay
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderEmailStep();
      case 1:
        return renderOtpStep();
      case 2:
        return renderSuccessStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <div style={styles.container}>
      {/* Form Section - Left */}
      <div style={styles.formSection}>
        <div style={styles.formSectionOverlay}></div>
        <div style={styles.formWrapper}>
          <div style={styles.logo}>🏠 PhongTro</div>

          {/* Steps indicator */}
          <Steps
            current={currentStep}
            size="small"
            style={styles.steps}
            items={[
              { title: "Email" },
              { title: "Xác nhận" },
              { title: "Hoàn tất" },
            ]}
          />

          {renderCurrentStep()}

          {currentStep !== 2 && (
            <div style={styles.footer}>
              <Text>
                Đã nhớ mật khẩu?{" "}
                <Link to="/login" style={styles.link}>
                  Đăng nhập
                </Link>
              </Text>
            </div>
          )}

          <div style={styles.homeLink}>
            <Link to="/" style={styles.backHome}>
              <HomeOutlined /> Quay lại Trang chủ
            </Link>
          </div>
        </div>
      </div>

      {/* Image Section - Right */}
      <div style={styles.imageSection}>
        <img
          src={require("../../assets/tro3.jpg")}
          alt="Phòng trọ"
          style={styles.image}
        />
        <div style={styles.imageOverlay}></div>
      </div>
      
    </div>
  
  );
}
