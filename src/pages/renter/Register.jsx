import { useState, useEffect } from "react";
import { Input, Button, Form, Typography, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { UserAddOutlined, MailOutlined, PhoneOutlined, LockOutlined, HomeOutlined, IdcardOutlined } from "@ant-design/icons";

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
    },
    formWrapper: {
      width: "100%",
      maxWidth: 450,
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
      height: 44,
      borderRadius: 8,
      border: "1.5px solid #d1d5db",
      fontSize: 15,
    },
    select: {
      height: 44,
      borderRadius: 8,
    },
    button: {
      width: "100%",
      height: 48,
      borderRadius: 8,
      fontSize: 16,
      fontWeight: 600,
      background: "linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)",
      border: "none",
      marginTop: 8,
    },
    formItem: {
      marginBottom: 16,
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
      marginTop: 20,
      color: "#6b7280",
    },
    row: {
      display: "flex",
      gap: 16,
    },
    col: {
      flex: 1,
    },
  };

  return (
    <div style={styles.container}>
      {/* Form Section - Left */}
      <div style={styles.formSection}>
        <div style={styles.formWrapper}>
          <div style={styles.logo}>🏠 PhongTro</div>
          <Typography.Title level={3} style={styles.title}>
            Tạo tài khoản mới
          </Typography.Title>
          <Typography.Paragraph style={styles.subtitle}>
            Đăng ký để bắt đầu tìm phòng trọ phù hợp
          </Typography.Paragraph>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={<span style={styles.formLabel}>Họ và tên</span>}
              name="fullName"
              rules={[{ required: true, message: "Nhập họ và tên" }]}
              style={styles.formItem}
            >
              <Input 
                prefix={<UserAddOutlined style={{ color: "#9ca3af" }} />}
                style={styles.input} 
                placeholder="Nhập họ và tên" 
              />
            </Form.Item>

            <div style={styles.row}>
              <div style={styles.col}>
                <Form.Item
                  label={<span style={styles.formLabel}>Email</span>}
                  name="email"
                  rules={[{ required: true, message: "Nhập email" }]}
                  style={styles.formItem}
                >
                  <Input 
                    prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                    style={styles.input} 
                    placeholder="Nhập email" 
                  />
                </Form.Item>
              </div>
              <div style={styles.col}>
                <Form.Item
                  label={<span style={styles.formLabel}>Số điện thoại</span>}
                  name="phone"
                  rules={[{ required: true, message: "Nhập SĐT" }]}
                  style={styles.formItem}
                >
                  <Input 
                    prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
                    style={styles.input} 
                    placeholder="Nhập SĐT" 
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item
              label={<span style={styles.formLabel}>Mật khẩu</span>}
              name="password"
              rules={[{ required: true, message: "Nhập mật khẩu" }]}
              style={styles.formItem}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                style={styles.input} 
                placeholder="Nhập mật khẩu" 
              />
            </Form.Item>

            <div style={styles.row}>
              <div style={styles.col}>
                <Form.Item
                  label={<span style={styles.formLabel}>Giới tính</span>}
                  name="gender"
                  initialValue="MALE"
                  rules={[{ required: true }]}
                  style={styles.formItem}
                >
                  <Select style={styles.select} size="large">
                    <Select.Option value="MALE">Nam</Select.Option>
                    <Select.Option value="FEMALE">Nữ</Select.Option>
                    <Select.Option value="OTHER">Khác</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div style={styles.col}>
                <Form.Item
                  label={<span style={styles.formLabel}>CCCD</span>}
                  name="citizenId"
                  rules={[{ required: true, message: "Nhập CCCD" }]}
                  style={styles.formItem}
                >
                  <Input 
                    prefix={<IdcardOutlined style={{ color: "#9ca3af" }} />}
                    style={styles.input} 
                    placeholder="Nhập số CCCD" 
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item
              label={<span style={styles.formLabel}>Địa chỉ</span>}
              name="address"
              rules={[{ required: true, message: "Nhập địa chỉ" }]}
              style={styles.formItem}
            >
              <Input 
                prefix={<HomeOutlined style={{ color: "#9ca3af" }} />}
                style={styles.input} 
                placeholder="Nhập địa chỉ của bạn" 
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={styles.button}
              >
                Đăng ký tài khoản
              </Button>
            </Form.Item>
          </Form>

          <div style={styles.footer}>
            <Typography.Text>
              Đã có tài khoản?{" "}
              <Link to="/login" style={styles.link}>
                Đăng nhập ngay
              </Link>
            </Typography.Text>
          </div>
        </div>
      </div>

      {/* Image Section - Right */}
      <div style={styles.imageSection}>
        <img
          src={require("../../assets/tro2.jpg")}
          alt="Phòng trọ"
          style={styles.image}
        />
        <div style={styles.imageOverlay}></div>
      </div>
    </div>
  );
}
