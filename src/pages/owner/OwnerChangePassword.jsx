import { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";

const { Title, Paragraph, Text } = Typography;

export default function OwnerChangePassword() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.put("/api/user/change-password", null, {
        params: {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
      });

      if (response.data?.code === 200) {
        message.success("Đổi mật khẩu thành công!");
        form.resetFields();
        setCurrentStep(1);
        setTimeout(() => {
          setCurrentStep(0);
        }, 3000);
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f7fa",
      padding: "40px 20px",
    },
    card: {
      borderRadius: 16,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      border: "none",
      maxWidth: 500,
      width: "100%",
    },
    header: {
      textAlign: "center",
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: 700,
      color: "#1f2937",
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    subtitle: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 0,
    },
    form: {
      width: "100%",
    },
    formItem: {
      marginBottom: 20,
    },
    formLabel: {
      fontWeight: 600,
      color: "#374151",
      marginBottom: 8,
    },
    input: {
      height: 48,
      borderRadius: 10,
      fontSize: 15,
      border: "1.5px solid #e5e7eb",
    },
    button: {
      height: 50,
      borderRadius: 10,
      fontSize: 16,
      fontWeight: 600,
      background: "linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)",
      border: "none",
      marginTop: 8,
    },
    successContainer: {
      textAlign: "center",
      padding: "40px 20px",
    },
    successIcon: {
      fontSize: 80,
      color: "#2196F3",
      marginBottom: 24,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: 700,
      color: "#1f2937",
      marginBottom: 12,
    },
    successText: {
      fontSize: 15,
      color: "#6b7280",
      marginBottom: 0,
    },
    divider: {
      margin: "24px 0",
      borderTop: "1px solid #e5e7eb",
    },
    tips: {
      background: "#f0f9ff",
      border: "1px solid #bfdbfe",
      borderRadius: 10,
      padding: 16,
      marginTop: 24,
    },
    tipsTitle: {
      fontWeight: 600,
      color: "#0c4a6e",
      marginBottom: 8,
    },
    tipsList: {
      color: "#0c4a6e",
      fontSize: 13,
      lineHeight: 1.6,
    },
  };

  if (currentStep === 1) {
    return (
      <div style={styles.container}>
        <Card style={styles.card} bordered={false}>
          <div style={styles.successContainer}>
            <CheckCircleOutlined style={styles.successIcon} />
            <Title style={styles.successTitle}>Thành công!</Title>
            <Paragraph style={styles.successText}>
              Mật khẩu của bạn đã được thay đổi thành công.
            </Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Card style={styles.card} bordered={false}>
        <div style={styles.header}>
          <div style={styles.title}>
            <LockOutlined style={{ fontSize: 32, color: "#2196F3" }} />
            Đổi mật khẩu
          </div>
          <Paragraph style={styles.subtitle}>
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
          style={styles.form}
        >
          <Form.Item
            name="oldPassword"
            label={<span style={styles.formLabel}>Mật khẩu hiện tại</span>}
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
              { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" },
            ]}
            style={styles.formItem}
          >
            <Input.Password
              placeholder="Nhập mật khẩu hiện tại"
              prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
              style={styles.input}
            />
          </Form.Item>

          <div style={styles.divider} />

          <Form.Item
            name="newPassword"
            label={<span style={styles.formLabel}>Mật khẩu mới</span>}
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  "Mật khẩu phải chứa chữ hoa, chữ thường và số",
              },
            ]}
            style={styles.formItem}
          >
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
              style={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={
              <span style={styles.formLabel}>Xác nhận mật khẩu mới</span>
            }
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
            style={styles.formItem}
          >
            <Input.Password
              placeholder="Nhập lại mật khẩu mới"
              prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
              style={styles.input}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={styles.button}
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>

        <div style={styles.tips}>
          <div style={styles.tipsTitle}>💡 Mẹo bảo mật:</div>
          <div style={styles.tipsList}>
            ✓ Sử dụng mật khẩu dài ít nhất 6 ký tự
            <br />
            ✓ Kết hợp chữ hoa, chữ thường và số
            <br />
            ✓ Không chia sẻ mật khẩu với ai khác
            <br />
            ✓ Thay đổi mật khẩu định kỳ để bảo mật
          </div>
        </div>
      </Card>
    </div>
  );
}
