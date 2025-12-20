import React, { useState } from "react";
import { Typography, Row, Col, Card, Form, Input, Button, message } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await axiosClient.post("/api/help", values);
      
      toast.success(res.data.message || "Gửi liên hệ thành công!");
      form.resetFields();
    } catch (err) {
      console.error("Contact error:", err);
      toast.error(err.response?.data?.message || "Gửi liên hệ thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    // Hero Section
    heroSection: {
      minHeight: "40vh",
      background: `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url(${require("../../assets/tro2.jpg")})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "60px 20px",
    },
    heroTitle: {
      fontSize: 42,
      fontWeight: 800,
      color: "#fff",
      marginBottom: 16,
      textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
    },
    heroSubtitle: {
      fontSize: 18,
      color: "rgba(255,255,255,0.9)",
      maxWidth: 600,
      margin: "0 auto",
    },

    // Main Section
    mainSection: {
      padding: "80px 40px",
      maxWidth: 1200,
      margin: "0 auto",
    },

    // Contact Info Card
    infoCard: {
      borderRadius: 16,
      border: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      height: "100%",
    },
    infoItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 28,
    },
    infoIcon: {
      width: 50,
      height: 50,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    infoIconInner: {
      fontSize: 22,
      color: "#fff",
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: "#1f2937",
      marginBottom: 4,
    },
    infoText: {
      fontSize: 14,
      color: "#6b7280",
      lineHeight: 1.6,
    },

    // Form Card
    formCard: {
      borderRadius: 16,
      border: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    },
    formTitle: {
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 8,
      color: "#1f2937",
    },
    formSubtitle: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 30,
    },
    input: {
      height: 48,
      borderRadius: 10,
      border: "1.5px solid #e5e7eb",
      fontSize: 15,
    },
    textArea: {
      borderRadius: 10,
      border: "1.5px solid #e5e7eb",
      fontSize: 15,
    },
    submitBtn: {
      height: 50,
      borderRadius: 10,
      fontSize: 16,
      fontWeight: 600,
      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      border: "none",
      width: "100%",
    },
    formLabel: {
      fontWeight: 500,
      color: "#374151",
    },

    // Social Section
    socialSection: {
      background: "#f9fafb",
      padding: "60px 40px",
    },
    socialTitle: {
      fontSize: 28,
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 40,
      color: "#1f2937",
    },
    socialCard: {
      textAlign: "center",
      padding: "30px 20px",
      borderRadius: 16,
      border: "none",
      boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    socialIcon: {
      fontSize: 40,
      marginBottom: 16,
    },
    socialName: {
      fontSize: 16,
      fontWeight: 600,
      color: "#1f2937",
    },
    socialHandle: {
      fontSize: 13,
      color: "#6b7280",
    },

    // Map Section
    mapSection: {
      padding: "0",
    },
    mapContainer: {
      width: "100%",
      height: 400,
      background: "#e5e7eb",
      position: "relative",
    },
    mapImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    mapOverlay: {
      position: "absolute",
      bottom: 30,
      left: 30,
      background: "#fff",
      padding: "20px 30px",
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      maxWidth: 350,
    },

    // FAQ Section
    faqSection: {
      padding: "80px 40px",
      maxWidth: 900,
      margin: "0 auto",
    },
    faqTitle: {
      fontSize: 32,
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 50,
      color: "#1f2937",
    },
    faqItem: {
      background: "#fff",
      borderRadius: 12,
      padding: "24px 28px",
      marginBottom: 16,
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: 600,
      color: "#1f2937",
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    faqAnswer: {
      fontSize: 14,
      color: "#6b7280",
      lineHeight: 1.7,
      paddingLeft: 32,
    },
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined style={styles.infoIconInner} />,
      title: "Hotline",
      text: "1900 1234 56\n(8:00 - 22:00, T2 - CN)",
    },
    {
      icon: <MailOutlined style={styles.infoIconInner} />,
      title: "Email",
      text: "support@phongtro.vn\ninfo@phongtro.vn",
    },
    {
      icon: <EnvironmentOutlined style={styles.infoIconInner} />,
      title: "Địa chỉ",
      text: "123 Nguyễn Văn Linh, Quận 7\nTP. Hồ Chí Minh, Việt Nam",
    },
    {
      icon: <ClockCircleOutlined style={styles.infoIconInner} />,
      title: "Giờ làm việc",
      text: "Thứ 2 - Thứ 6: 8:00 - 18:00\nThứ 7 - CN: 9:00 - 17:00",
    },
  ];

  const socials = [
    {
      icon: <FacebookOutlined style={{ ...styles.socialIcon, color: "#1877f2" }} />,
      name: "Facebook",
      handle: "@phongtro.vn",
      color: "#e7f3ff",
    },
    {
      icon: <InstagramOutlined style={{ ...styles.socialIcon, color: "#e4405f" }} />,
      name: "Instagram",
      handle: "@phongtro.official",
      color: "#fce7f3",
    },
    {
      icon: <YoutubeOutlined style={{ ...styles.socialIcon, color: "#ff0000" }} />,
      name: "Youtube",
      handle: "PhongTro Channel",
      color: "#fee2e2",
    },
    {
      icon: <MessageOutlined style={{ ...styles.socialIcon, color: "#0084ff" }} />,
      name: "Zalo",
      handle: "PhongTro Support",
      color: "#dbeafe",
    },
  ];

  const faqs = [
    {
      question: "Làm sao để đăng tin cho thuê phòng?",
      answer: "Bạn cần đăng ký tài khoản chủ trọ, sau đó vào mục 'Đăng tin' và điền đầy đủ thông tin Phòng Trọ. Tin đăng sẽ được duyệt trong vòng 24 giờ.",
    },
    {
      question: "Chi phí đăng tin là bao nhiêu?",
      answer: "PhongTro cung cấp gói đăng tin miễn phí và các gói trả phí với nhiều ưu đãi. Liên hệ hotline để được tư vấn chi tiết.",
    },
    {
      question: "Làm sao để liên hệ trực tiếp với chủ trọ?",
      answer: "Sau khi tìm được phòng ưng ý, bạn có thể bấm nút 'Liên hệ' hoặc 'Nhắn tin' để kết nối trực tiếp với chủ trọ thông qua nền tảng.",
    },
    {
      question: "PhongTro có đảm bảo thông tin chính xác không?",
      answer: "Chúng tôi xác minh thông tin chủ trọ và kiểm duyệt tin đăng. Tuy nhiên, bạn nên xem phòng trực tiếp trước khi quyết định thuê.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div>
          <Title style={styles.heroTitle}>📞 Liên hệ với chúng tôi</Title>
          <Paragraph style={styles.heroSubtitle}>
            Có câu hỏi hoặc cần hỗ trợ? Đội ngũ PhongTro luôn sẵn sàng lắng nghe và giúp đỡ bạn!
          </Paragraph>
        </div>
      </div>

      {/* Main Contact Section */}
      <div style={styles.mainSection}>
        <Row gutter={[40, 40]}>
          {/* Contact Info */}
          <Col xs={24} lg={10}>
            <Card style={styles.infoCard} bodyStyle={{ padding: 36 }}>
              <Title level={4} style={{ marginBottom: 30 }}>
                Thông tin liên hệ
              </Title>
              {contactInfo.map((item, index) => (
                <div key={index} style={styles.infoItem}>
                  <div style={styles.infoIcon}>{item.icon}</div>
                  <div>
                    <div style={styles.infoTitle}>{item.title}</div>
                    <div style={styles.infoText}>
                      {item.text.split("\n").map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Working Hours Visual */}
              <div
                style={{
                  background: "#f0fdf4",
                  borderRadius: 12,
                  padding: 20,
                  marginTop: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#22c55e",
                      animation: "pulse 2s infinite",
                    }}
                  ></div>
                  <Text strong style={{ color: "#22c55e" }}>
                    Đang hoạt động
                  </Text>
                </div>
                <Text style={{ color: "#6b7280", fontSize: 13 }}>
                  Chúng tôi phản hồi trong vòng 30 phút trong giờ làm việc
                </Text>
              </div>
            </Card>
          </Col>

          {/* Contact Form */}
          <Col xs={24} lg={14}>
            <Card style={styles.formCard} bodyStyle={{ padding: 40 }}>
              <Title level={4} style={styles.formTitle}>
                Gửi tin nhắn cho chúng tôi
              </Title>
              <Paragraph style={styles.formSubtitle}>
                Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất
              </Paragraph>

              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={styles.formLabel}>Họ và tên</span>}
                      name="fullName"
                      rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                    >
                      <Input style={styles.input} placeholder="Nhập họ và tên" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={styles.formLabel}>Số điện thoại</span>}
                      name="phone"
                      rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
                    >
                      <Input style={styles.input} placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={<span style={styles.formLabel}>Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input style={styles.input} placeholder="Nhập địa chỉ email" />
                </Form.Item>

                <Form.Item
                  label={<span style={styles.formLabel}>Chủ đề</span>}
                  name="subject"
                  rules={[{ required: true, message: "Vui lòng nhập chủ đề" }]}
                >
                  <Input style={styles.input} placeholder="Bạn cần hỗ trợ về vấn đề gì?" />
                </Form.Item>

                <Form.Item
                  label={<span style={styles.formLabel}>Nội dung tin nhắn</span>}
                  name="message"
                  rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                >
                  <TextArea
                    style={styles.textArea}
                    rows={5}
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SendOutlined />}
                    style={styles.submitBtn}
                  >
                    Gửi tin nhắn
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Social Media Section */}
      <div style={styles.socialSection}>
        <Title style={styles.socialTitle}>Kết nối với chúng tôi</Title>
        <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 900, margin: "0 auto" }}>
          {socials.map((social, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card
                style={{ ...styles.socialCard, background: social.color }}
                bodyStyle={{ padding: "30px 20px" }}
                hoverable
              >
                {social.icon}
                <div style={styles.socialName}>{social.name}</div>
                <div style={styles.socialHandle}>{social.handle}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Map Section */}
      <div style={styles.mapSection}>
        <div style={styles.mapContainer}>
          <img
            src={require("../../assets/images.jpg")}
            alt="Bản đồ"
            style={styles.mapImage}
          />
          <div style={styles.mapOverlay}>
            <Title level={5} style={{ marginBottom: 8 }}>
              📍 Văn phòng PhongTro
            </Title>
            <Paragraph style={{ color: "#6b7280", marginBottom: 0, fontSize: 14 }}>
              123 Nguyễn Văn Linh, Quận 7<br />
              TP. Hồ Chí Minh, Việt Nam
            </Paragraph>
            <Button
              type="link"
              style={{ padding: 0, marginTop: 10, color: "#22c55e", fontWeight: 600 }}
            >
              Xem trên Google Maps →
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={styles.faqSection}>
        <Title style={styles.faqTitle}>Câu hỏi thường gặp</Title>
        {faqs.map((faq, index) => (
          <div key={index} style={styles.faqItem}>
            <div style={styles.faqQuestion}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#22c55e",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ?
              </span>
              {faq.question}
            </div>
            <div style={styles.faqAnswer}>{faq.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
