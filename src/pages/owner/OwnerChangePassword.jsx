import { useState } from "react";
import { Card, Form, Input, Button } from "antd";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

export default function OwnerChangePassword() {
  const [form] = Form.useForm();
  const [otpSent, setOtpSent] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.user?.email || "";

  const requestOtp = async () => {
    try {
      const sendMailReq = await axiosClient.post(
        "/api/user/forgot-password/request-otp",
        null,
        {
          params: { email },
        }
      );

      if (sendMailReq.data.status >= 400) {
        toast.error(sendMailReq.data.message);
        return;
      }

      toast.success("OTP đã được gửi về email");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể gửi OTP");
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
      await axiosClient.post("/api/user/forgot-password/reset", payload);
      toast.success("Đổi mật khẩu thành công");
      form.resetFields();
      setOtpSent(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <Card title="Đổi mật khẩu" bordered style={{ maxWidth: 500 }}>
      <Form layout="vertical" form={form}>
        <Form.Item label="Email đăng ký">
          <Input value={email} readOnly />
        </Form.Item>

        <Button type="primary" onClick={requestOtp} block disabled={otpSent}>
          Gửi mã OTP
        </Button>

        {otpSent && (
          <>
            <Form.Item
              name="otp"
              label="Mã OTP"
              rules={[{ required: true }]}
              style={{ marginTop: 20 }}
            >
              <Input placeholder="Nhập OTP" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[{ required: true }]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>

            <Button type="primary" onClick={submitReset} block>
              Xác nhận đổi mật khẩu
            </Button>
          </>
        )}
      </Form>
    </Card>
  );
}
