// src/pages/ChangePassword.jsx

import { useState } from "react";
import { Card, Form, Input, Button, Typography } from "antd";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

export default function ChangePassword() {
  const [form] = Form.useForm();
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.user?.email || "";

  const requestOtp = async () => {
    try {
      setLoading(true);

      const res = await axiosClient.post(
        "/api/user/forgot-password/request-otp",
        null,
        { params: { email } }
      );

      if (res.data.status >= 400) {
        toast.error(res.data.message);
        setLoading(false);
        return;
      }

      toast.success("OTP đã được gửi đến email của bạn");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async () => {
    const values = await form.validateFields();

    const payload = {
      email,
      otp: values.otp,
      newPassword: values.newPassword,
    };

    try {
      setLoading(true);
      await axiosClient.post("/api/user/forgot-password/reset", payload);

      toast.success("Đổi mật khẩu thành công");
      form.resetFields();
      setOtpSent(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        padding: "0 16px",
      }}
    >
      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          padding: "8px 4px 20px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 6 }}>
          Đổi mật khẩu
        </Title>
        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center", marginBottom: 20 }}
        >
          Nhập email và nhận mã OTP để đổi mật khẩu mới.
        </Text>

        <Form layout="vertical" form={form}>
          <Form.Item label="Email">
            <Input value={email} readOnly style={{ background: "#fafafa" }} />
          </Form.Item>

          <Button
            type="primary"
            size="large"
            block
            onClick={requestOtp}
            loading={loading}
            disabled={otpSent}
            style={{
              height: 48,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            Gửi mã OTP
          </Button>

          {otpSent && (
            <>
              <Form.Item
                name="otp"
                label="Mã OTP"
                rules={[{ required: true, message: "Vui lòng nhập OTP" }]}
              >
                <Input placeholder="Nhập mã OTP" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Button
                type="primary"
                size="large"
                block
                onClick={submitReset}
                loading={loading}
                style={{
                  height: 48,
                  borderRadius: 10,
                  marginTop: 8,
                }}
              >
                Xác nhận đổi mật khẩu
              </Button>
            </>
          )}
        </Form>
      </Card>
    </div>
  );
}
