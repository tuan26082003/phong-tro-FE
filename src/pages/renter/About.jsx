import React from "react";
import { Typography, Row, Col, Card, Avatar, Button } from "antd";
import {
  HomeOutlined,
  SafetyOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  StarOutlined,
  RocketOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import RenterLayout from "../../layouts/RenterLayout";

const { Title, Paragraph, Text } = Typography;

export default function About() {
  const styles = {
    // Hero Section
    heroSection: {
      minHeight: "60vh",
      background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%), url(${require("../../assets/images.jpg")})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "60px 20px",
      position: "relative",
    },
    heroContent: {
      maxWidth: 800,
      color: "#fff",
    },
    heroTitle: {
      fontSize: 48,
      fontWeight: 800,
      color: "#fff",
      marginBottom: 20,
      textShadow: "2px 2px 8px rgba(0,0,0,0.2)",
    },
    heroSubtitle: {
      fontSize: 20,
      color: "rgba(255,255,255,0.95)",
      marginBottom: 30,
      lineHeight: 1.8,
    },
    heroStats: {
      display: "flex",
      justifyContent: "center",
      gap: 60,
      marginTop: 40,
    },
    statItem: {
      textAlign: "center",
    },
    statNumber: {
      fontSize: 42,
      fontWeight: 800,
      color: "#fff",
    },
    statLabel: {
      fontSize: 14,
      color: "rgba(255,255,255,0.9)",
      marginTop: 5,
    },

    // Section Styles
    section: {
      padding: "80px 40px",
      maxWidth: 1200,
      margin: "0 auto",
    },
    sectionTitle: {
      fontSize: 36,
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 16,
      color: "#1f2937",
    },
    sectionSubtitle: {
      fontSize: 16,
      color: "#6b7280",
      textAlign: "center",
      marginBottom: 50,
      maxWidth: 600,
      margin: "0 auto 50px",
    },

    // Feature Cards
    featureCard: {
      borderRadius: 16,
      border: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      height: "100%",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    featureIcon: {
      fontSize: 48,
      color: "#22c55e",
      marginBottom: 20,
    },
    featureTitle: {
      fontSize: 20,
      fontWeight: 600,
      marginBottom: 12,
      color: "#1f2937",
    },
    featureDesc: {
      fontSize: 14,
      color: "#6b7280",
      lineHeight: 1.7,
    },

    // Story Section
    storySection: {
      background: "#f0fdf4",
      padding: "80px 40px",
    },
    storyContent: {
      maxWidth: 1200,
      margin: "0 auto",
    },
    storyImage: {
      width: "100%",
      height: 400,
      objectFit: "cover",
      borderRadius: 20,
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    },
    storyText: {
      padding: "20px 40px",
    },

    // Team Section
    teamCard: {
      textAlign: "center",
      borderRadius: 16,
      border: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      padding: "30px 20px",
    },
    teamAvatar: {
      width: 120,
      height: 120,
      marginBottom: 20,
      border: "4px solid #22c55e",
    },
    teamName: {
      fontSize: 18,
      fontWeight: 600,
      color: "#1f2937",
      marginBottom: 4,
    },
    teamRole: {
      fontSize: 14,
      color: "#22c55e",
      fontWeight: 500,
    },

    // Values Section
    valueItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 30,
    },
    valueIcon: {
      width: 50,
      height: 50,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    valueIconInner: {
      fontSize: 24,
      color: "#fff",
    },

    // CTA Section
    ctaSection: {
      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      padding: "80px 40px",
      textAlign: "center",
    },
    ctaTitle: {
      fontSize: 36,
      fontWeight: 700,
      color: "#fff",
      marginBottom: 16,
    },
    ctaSubtitle: {
      fontSize: 18,
      color: "rgba(255,255,255,0.9)",
      marginBottom: 30,
    },
    ctaButton: {
      height: 50,
      padding: "0 40px",
      fontSize: 16,
      fontWeight: 600,
      borderRadius: 25,
      background: "#fff",
      color: "#22c55e",
      border: "none",
    },
  };

  const features = [
    {
      icon: <HomeOutlined style={styles.featureIcon} />,
      title: "Phòng trọ đa dạng",
      desc: "Hàng nghìn phòng trọ từ giá rẻ đến cao cấp, phù hợp với mọi nhu cầu và ngân sách của bạn.",
    },
    {
      icon: <SafetyOutlined style={styles.featureIcon} />,
      title: "An toàn & Uy tín",
      desc: "Thông tin phòng trọ được xác minh kỹ lưỡng, đảm bảo an toàn cho người thuê.",
    },
    {
      icon: <CustomerServiceOutlined style={styles.featureIcon} />,
      title: "Hỗ trợ 24/7",
      desc: "Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn mọi lúc.",
    },
    {
      icon: <RocketOutlined style={styles.featureIcon} />,
      title: "Tìm phòng nhanh chóng",
      desc: "Công nghệ tìm kiếm thông minh giúp bạn tìm được phòng phù hợp trong vài phút.",
    },
  ];

  const values = [
    {
      icon: <HeartOutlined style={styles.valueIconInner} />,
      title: "Tận tâm phục vụ",
      desc: "Chúng tôi luôn đặt lợi ích của khách hàng lên hàng đầu, mang đến trải nghiệm tốt nhất.",
    },
    {
      icon: <StarOutlined style={styles.valueIconInner} />,
      title: "Chất lượng hàng đầu",
      desc: "Cam kết mang đến những phòng trọ chất lượng, được kiểm duyệt nghiêm ngặt.",
    },
    {
      icon: <CheckCircleOutlined style={styles.valueIconInner} />,
      title: "Minh bạch thông tin",
      desc: "Mọi thông tin về phòng trọ đều rõ ràng, chính xác, không gây nhầm lẫn.",
    },
    {
      icon: <TeamOutlined style={styles.valueIconInner} />,
      title: "Kết nối cộng đồng",
      desc: "Xây dựng cộng đồng người thuê trọ văn minh, hỗ trợ lẫn nhau.",
    },
  ];

  const team = [
    {
      name: "Nguyễn Văn A",
      role: "CEO & Founder",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Trần Thị B",
      role: "CTO",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Lê Văn C",
      role: "Marketing Director",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    {
      name: "Phạm Thị D",
      role: "Customer Success",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  return (
    <div>
    
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <Title style={styles.heroTitle}>
            🏠 Chào mừng đến với PhongTro
          </Title>
          <Paragraph style={styles.heroSubtitle}>
            Nền tảng kết nối người thuê và chủ trọ hàng đầu Việt Nam. 
            Chúng tôi giúp bạn tìm được ngôi nhà thứ hai một cách dễ dàng, 
            nhanh chóng và an toàn nhất.
          </Paragraph>
          <div style={styles.heroStats}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>10K+</div>
              <div style={styles.statLabel}>Phòng trọ</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>50K+</div>
              <div style={styles.statLabel}>Người dùng</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>100+</div>
              <div style={styles.statLabel}>Thành phố</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.section}>
        <Title style={styles.sectionTitle}>Tại sao chọn PhongTro?</Title>
        <Paragraph style={styles.sectionSubtitle}>
          Chúng tôi cung cấp giải pháp tìm phòng trọ toàn diện với nhiều tính năng vượt trội
        </Paragraph>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                style={styles.featureCard}
                hoverable
                bodyStyle={{ padding: 30, textAlign: "center" }}
              >
                {feature.icon}
                <Title level={4} style={styles.featureTitle}>
                  {feature.title}
                </Title>
                <Paragraph style={styles.featureDesc}>{feature.desc}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Story Section */}
      <div style={styles.storySection}>
        <div style={styles.storyContent}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <img
                src={require("../../assets/tro1.jpg")}
                alt="Câu chuyện của chúng tôi"
                style={styles.storyImage}
              />
            </Col>
            <Col xs={24} lg={12}>
              <div style={styles.storyText}>
                <Text
                  style={{
                    color: "#22c55e",
                    fontWeight: 600,
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                  }}
                >
                  Câu chuyện của chúng tôi
                </Text>
                <Title level={2} style={{ marginTop: 10, marginBottom: 20 }}>
                  Hành trình kết nối những ngôi nhà
                </Title>
                <Paragraph
                  style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.8 }}
                >
                  PhongTro được thành lập vào năm 2020 với sứ mệnh đơn giản: 
                  giúp mọi người tìm được nơi ở phù hợp một cách dễ dàng nhất. 
                  Chúng tôi hiểu rằng việc tìm phòng trọ có thể rất mệt mỏi 
                  và tốn thời gian.
                </Paragraph>
                <Paragraph
                  style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.8 }}
                >
                  Với đội ngũ trẻ, năng động và đam mê công nghệ, chúng tôi đã 
                  xây dựng nền tảng kết nối người thuê và chủ trọ một cách 
                  minh bạch, an toàn và hiệu quả. Đến nay, PhongTro đã giúp 
                  hàng chục nghìn người tìm được ngôi nhà thứ hai của mình.
                </Paragraph>
                <div style={{ marginTop: 30 }}>
                  <Row gutter={[30, 16]}>
                    <Col span={12}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircleOutlined style={{ fontSize: 20, color: "#22c55e" }} />
                        <span style={{ fontWeight: 500 }}>Xác minh chủ trọ</span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircleOutlined style={{ fontSize: 20, color: "#22c55e" }} />
                        <span style={{ fontWeight: 500 }}>Hợp đồng rõ ràng</span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircleOutlined style={{ fontSize: 20, color: "#22c55e" }} />
                        <span style={{ fontWeight: 500 }}>Hỗ trợ pháp lý</span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircleOutlined style={{ fontSize: 20, color: "#22c55e" }} />
                        <span style={{ fontWeight: 500 }}>Bảo vệ người thuê</span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Values Section */}
      <div style={styles.section}>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={12}>
            <Text
              style={{
                color: "#22c55e",
                fontWeight: 600,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Giá trị cốt lõi
            </Text>
            <Title level={2} style={{ marginTop: 10, marginBottom: 30 }}>
              Những giá trị chúng tôi theo đuổi
            </Title>
            {values.map((value, index) => (
              <div key={index} style={styles.valueItem}>
                <div style={styles.valueIcon}>{value.icon}</div>
                <div>
                  <Title level={5} style={{ marginBottom: 4 }}>
                    {value.title}
                  </Title>
                  <Paragraph style={{ color: "#6b7280", marginBottom: 0 }}>
                    {value.desc}
                  </Paragraph>
                </div>
              </div>
            ))}
          </Col>
          <Col xs={24} lg={12}>
            <img
              src={require("../../assets/tro2.jpg")}
              alt="Giá trị cốt lõi"
              style={{
                width: "100%",
                height: 450,
                objectFit: "cover",
                borderRadius: 20,
                boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              }}
            />
          </Col>
        </Row>
      </div>

      {/* Team Section */}
      <div style={{ ...styles.section, background: "#f9fafb", padding: "80px 40px" }}>
        <Title style={styles.sectionTitle}>Đội ngũ của chúng tôi</Title>
        <Paragraph style={styles.sectionSubtitle}>
          Những người đang nỗ lực mỗi ngày để mang đến trải nghiệm tốt nhất cho bạn
        </Paragraph>
        <Row gutter={[24, 24]} justify="center">
          {team.map((member, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card style={styles.teamCard} bodyStyle={{ padding: 0 }}>
                <Avatar src={member.avatar} style={styles.teamAvatar} />
                <div style={styles.teamName}>{member.name}</div>
                <div style={styles.teamRole}>{member.role}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
