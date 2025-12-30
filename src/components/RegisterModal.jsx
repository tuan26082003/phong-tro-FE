import { useState } from "react";
import { Modal, Form, Input, Button, Typography, Select } from "antd";
import { UserAddOutlined, MailOutlined, PhoneOutlined, LockOutlined, HomeOutlined, IdcardOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import registerImg from "../assets/tro2.jpg";

export default function RegisterModal({ visible, onClose }) {
  const [loading, setLoading] = useState(false);

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

      if (reqRegister.data?.status >= 400) {
        toast.error(reqRegister.data.message || "Đăng ký thất bại");
        return;
      }

      toast.success("Đăng ký thành công");
      onClose();
    } catch (err) {
      console.error("REGISTER ERR", err);
      toast.error("Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={820}
      bodyStyle={{ padding: 0, overflow: "hidden" }}
    >
      <div style={{ display: "flex", minHeight: 520 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <img src={registerImg} alt="img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ width: 460, padding: 28, background: '#fff' }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Typography.Text style={{ color: '#6b7280' }}>Chưa có tài khoản?</Typography.Text>
            <Typography.Title level={3} style={{ margin: '6px 0 12px' }}>Đăng ký để tiếp tục</Typography.Title>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item name="fullName" rules={[{ required: true, message: 'Nhập họ tên' }]}>
              <Input prefix={<UserAddOutlined />} placeholder="Họ tên" />
            </Form.Item>

            <Form.Item name="email" rules={[{ required: true, message: 'Nhập email' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item name="phone" rules={[{ required: true, message: 'Nhập SĐT' }]}>
              <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item name="citizenId" rules={[{ required: true, message: 'Nhập CCCD' }]}>
              <Input prefix={<IdcardOutlined />} placeholder="CCCD" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <Typography.Text>Đã có tài khoản? <a onClick={onClose}>Đăng nhập</a></Typography.Text>
          </div>
        </div>
      </div>
    </Modal>
  );
}
