import { Collapse, Input, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
const { Panel } = Collapse;

export default function Help() {
  const faqs = [
    {
      q: "Làm sao để tìm phòng nhanh nhất?",
      a: "Dùng bộ lọc diện tích, mức giá và vị trí. Các phòng nổi bật được ưu tiên hiển thị đầu trang.",
    },
    {
      q: "Thông tin phòng có chính xác không?",
      a: "Mỗi phòng đều được kiểm duyệt trước khi đăng nhằm hạn chế sai lệch.",
    },
    {
      q: "Tôi có thể liên hệ chủ trọ qua đâu?",
      a: "Trang phòng có số điện thoại và nút nhắn tin trực tiếp nếu chủ trọ bật tính năng này.",
    },
    {
      q: "Tôi bị lừa đảo thì sao?",
      a: "Bổ sung bằng chứng và gửi qua trang Liên hệ. Hệ thống hỗ trợ xác minh chủ trọ.",
    },
    {
      q: "Tôi muốn đăng phòng cho thuê?",
      a: "Đăng ký tài khoản chủ trọ và truy cập mục Quản lý để thêm phòng.",
    },
  ];

  return (
    <div
      style={{ background: "#f5f6fa", minHeight: "100vh", paddingBottom: 80 }}
    >
      {/* HERO */}
      <section
        style={{
          position: "relative",
          height: 300,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1484154218962-a197022b5858)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
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
            textAlign: "center",
            maxWidth: 800,
            padding: "0 20px",
            animation: "fadeUp .9s forwards",
            opacity: 0,
            transform: "translateY(20px)",
          }}
        >
          <h1 style={{ fontSize: 42, marginBottom: 12, fontWeight: 700 }}>
            Trung tâm hỗ trợ
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9 }}>
            Giải đáp thắc mắc – hỗ trợ bạn 24/7
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section
        style={{ maxWidth: 900, margin: "40px auto 0", padding: "0 20px" }}
      >
        <Input
          size="large"
          placeholder="Nhập câu hỏi: tìm phòng, giá điện, an toàn..."
          prefix={<SearchOutlined />}
          style={{
            height: 50,
            fontSize: 16,
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          }}
        />
      </section>

      {/* FAQ MAIN */}
      <section
        style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}
      >
        <Collapse
          accordion
          style={{
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {faqs.map((f, i) => (
            <Panel
              header={f.q}
              key={i}
              style={{
                fontSize: 16,
                padding: 0,
              }}
            >
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{f.a}</p>
            </Panel>
          ))}
        </Collapse>
      </section>

      {/* OTHER SECTIONS */}
      <section
        style={{ maxWidth: 1100, margin: "40px auto", padding: "0 20px" }}
      >
        <h2 style={{ fontSize: 28, marginBottom: 20 }}>Chủ đề phổ biến</h2>

        <Row gutter={[20, 20]}>
          {[
            "Vấn đề với chủ trọ",
            "Thanh toán – tiền đặt cọc",
            "Hướng dẫn đăng phòng",
            "Lỗi khi sử dụng hệ thống",
            "Bảo mật tài khoản",
            "Quy trình xác minh",
          ].map((topic) => (
            <Col xs={12} md={8} key={topic}>
              <div
                style={{
                  background: "#fff",
                  padding: "18px 22px",
                  borderRadius: 14,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
                  cursor: "pointer",
                  fontSize: 16,
                  transition: "0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {topic}
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* CONTACT CTA */}
      <section
        style={{
          maxWidth: 900,
          margin: "60px auto 0",
          background: "#fff",
          padding: "40px 28px",
          borderRadius: 16,
          boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 30, marginBottom: 12 }}>
          Không tìm thấy câu trả lời?
        </h2>
        <p style={{ fontSize: 17, marginBottom: 28 }}>
          Bạn có thể gửi yêu cầu để đội ngũ hỗ trợ phản hồi trong thời gian sớm
          nhất.
        </p>

        <a
          href="/contact"
          style={{
            display: "inline-block",
            padding: "14px 34px",
            background: "#1677ff",
            color: "#fff",
            borderRadius: 10,
            fontSize: 17,
            fontWeight: 600,
            textDecoration: "none",
            transition: "0.25s",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = 0.85)}
          onMouseLeave={(e) => (e.target.style.opacity = 1)}
        >
          Liên hệ hỗ trợ
        </a>
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
