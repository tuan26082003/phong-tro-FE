import { useState } from "react";
import { Row, Col, Input, Button } from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";

export default function Contact() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!fullName || !email || !message) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setFullName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh" }}>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          height: 360,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1527030280862-64139fba04ca)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 20px",
            animation: "fadeUp .95s forwards",
            opacity: 0,
            transform: "translateY(26px)",
          }}
        >
          <h1 style={{ fontSize: 46, marginBottom: 12, fontWeight: 700 }}>
            Kết nối với chúng tôi
          </h1>
          <p style={{ fontSize: 20, opacity: 0.9 }}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn trong mọi vấn đề.
          </p>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section
        style={{
          maxWidth: 1150,
          margin: "0 auto",
          padding: "70px 20px",
        }}
      >
        <Row gutter={[40, 40]}>
          {/* FORM */}
          <Col xs={24} md={14}>
            <div
              style={{
                background: "#fff",
                padding: 35,
                borderRadius: 16,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                animation: "fadeUp .9s forwards",
                opacity: 0,
                transform: "translateY(20px)",
              }}
            >
              <h2
                style={{
                  fontSize: 28,
                  marginBottom: 25,
                  fontWeight: 600,
                }}
              >
                Gửi yêu cầu hỗ trợ
              </h2>

              <Input
                size="large"
                placeholder="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ marginBottom: 20, height: 48, borderRadius: 10 }}
              />

              <Input
                size="large"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: 20, height: 48, borderRadius: 10 }}
              />

              <Input.TextArea
                rows={5}
                size="large"
                placeholder="Nội dung cần hỗ trợ"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  marginBottom: 25,
                  borderRadius: 10,
                  paddingTop: 14,
                  fontSize: 15,
                }}
              />

              <Button
                type="primary"
                size="large"
                block
                loading={sending}
                onClick={submit}
                style={{
                  height: 50,
                  fontSize: 17,
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                Gửi yêu cầu
              </Button>
            </div>
          </Col>

          {/* INFO + MAP */}
          <Col xs={24} md={10}>
            <div
              style={{
                background: "#fff",
                padding: 35,
                borderRadius: 16,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                animation: "fadeUp .95s forwards",
                opacity: 0,
                transform: "translateY(26px)",
              }}
            >
              <h2 style={{ fontSize: 28, marginBottom: 25, fontWeight: 600 }}>
                Thông tin liên hệ
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 20,
                  fontSize: 17,
                }}
              >
                <EnvironmentOutlined style={{ fontSize: 22 }} />
                <span>123 Nguyễn Văn Cừ, Việt Nam</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 20,
                  fontSize: 17,
                }}
              >
                <PhoneOutlined style={{ fontSize: 22 }} />
                <span>0123 456 789</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 28,
                  fontSize: 17,
                }}
              >
                <MailOutlined style={{ fontSize: 22 }} />
                <span>support@renthouse.vn</span>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                }}
              >
                <iframe
                  title="map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.640028283918!2d105.84117017519702!3d21.00752058851914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab984d9f563f%3A0xfe4b7b681f1c990!2zSMOyYSBtxrDhu51uZyBUw7JhIMSQ4buTbmggSOG6o2kgUGjhuqFt!5e0!3m2!1svi!2s!4v1700000000000"
                  width="100%"
                  height="270"
                  style={{ border: 0 }}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </Col>
        </Row>
      </section>

      {/* INLINE KEYFRAMES */}
      <style>
        {`
          @keyframes fadeUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
