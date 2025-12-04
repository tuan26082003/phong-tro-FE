// src/pages/Home.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  InputNumber,
  Collapse,
  Tag,
  Rate,
} from "antd";
import {
  SearchOutlined,
  WifiOutlined,
  SafetyOutlined,
  CarOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  StarFilled,
} from "@ant-design/icons";

import "./home.css";

const { Panel } = Collapse;

export default function Home() {
  const nav = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [minArea, setMinArea] = useState();
  const [maxArea, setMaxArea] = useState();
  const [minCapacity, setMinCapacity] = useState();

  const search = () => {
    const qs = new URLSearchParams();
    if (keyword) qs.append("keyword", keyword);
    if (minArea) qs.append("minArea", minArea);
    if (maxArea) qs.append("maxArea", maxArea);
    if (minCapacity) qs.append("minCapacity", minCapacity);
    nav("/rooms?" + qs.toString());
  };

  return (
    <div className="homepage-content">
      {/* HERO + SEARCH */}
      <section className="hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1>Không gian sống lý tưởng dành riêng cho bạn</h1>
          <p>Tìm phòng trọ đẹp, an toàn, đầy đủ tiện nghi với giá minh bạch.</p>

          <div className="search-box">
            <Input
              placeholder="Từ khóa: phòng, địa chỉ..."
              size="large"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              prefix={<SearchOutlined />}
            />

            <InputNumber
              placeholder="DT tối thiểu"
              size="large"
              style={{ width: "100%" }}
              value={minArea}
              onChange={setMinArea}
            />

            <InputNumber
              placeholder="DT tối đa"
              size="large"
              style={{ width: "100%" }}
              value={maxArea}
              onChange={setMaxArea}
            />

            <InputNumber
              placeholder="Sức chứa"
              size="large"
              style={{ width: "100%" }}
              value={minCapacity}
              onChange={setMinCapacity}
            />

            <Button type="primary" size="large" block onClick={search}>
              Tìm phòng ngay
            </Button>
          </div>

          <div className="hero-tags">
            <Tag>Gần trường đại học</Tag>
            <Tag>Phòng giá rẻ</Tag>
            <Tag>Phòng cao cấp</Tag>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section stats-section">
        <Row gutter={[24, 24]}>
          <Col xs={12} md={6}>
            <div className="stat-item">
              <div className="stat-number">12.500+</div>
              <div className="stat-label">Phòng đang hoạt động</div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="stat-item">
              <div className="stat-number">8.900+</div>
              <div className="stat-label">Chủ trọ đăng ký</div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="stat-item">
              <div className="stat-number">1.2M+</div>
              <div className="stat-label">Lượt tìm kiếm/tháng</div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Hài lòng</div>
            </div>
          </Col>
        </Row>
      </section>

      {/* HOT LOCATIONS */}
      <section className="section hot-locations">
        <h2 className="section-title">Khu vực nổi bật</h2>
        <Row gutter={[24, 24]}>
          {[
            "Hà Nội",
            "TP.HCM",
            "Đà Nẵng",
            "Cần Thơ",
            "Bình Dương",
            "Hải Phòng",
          ].map((city) => (
            <Col xs={12} md={8} key={city}>
              <div
                className="location-card"
                onClick={() =>
                  nav("/rooms?keyword=" + encodeURIComponent(city))
                }
              >
                <img src={`https://placehold.co/800x500?text=${city}`} />
                <div className="location-overlay">
                  <EnvironmentOutlined />
                  <span>{city}</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* FEATURED ROOMS */}
      <section className="section">
        <h2 className="section-title">Phòng nổi bật</h2>

        <Row gutter={[24, 24]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card
                hoverable
                className="room-card"
                cover={
                  <img
                    src={`https://placehold.co/900x600?text=Room+${i + 1}`}
                  />
                }
              >
                <h3>Phòng Premium {i + 1}</h3>
                <p className="room-meta">
                  {20 + i * 3} m² · {2 + (i % 3)} người
                </p>
                <p className="room-price">
                  {(3000000 + i * 400000).toLocaleString("vi-VN")}₫/tháng
                </p>

                <Button type="primary" block>
                  Xem chi tiết
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* UTILITIES */}
      <section className="utilities">
        <h2 className="section-title">Tiện ích nổi bật</h2>

        <Row gutter={[24, 24]} justify="center">
          <Col xs={12} sm={6}>
            <div className="util-item">
              <WifiOutlined className="util-icon" />
              <h4>Wifi tốc độ cao</h4>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="util-item">
              <SafetyOutlined className="util-icon" />
              <h4>An ninh 24/7</h4>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="util-item">
              <CarOutlined className="util-icon" />
              <h4>Bãi đỗ xe</h4>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="util-item">
              <ThunderboltOutlined className="util-icon" />
              <h4>Điện nước minh bạch</h4>
            </div>
          </Col>
        </Row>
      </section>

      {/* FAQ */}
      <section className="section faq-section">
        <h2 className="section-title">Câu hỏi thường gặp</h2>

        <Collapse accordion>
          <Panel header="Tìm phòng có mất phí không?" key="1">
            <p>Hoàn toàn miễn phí.</p>
          </Panel>
          <Panel header="Thông tin phòng có chính xác?" key="2">
            <p>Có kiểm duyệt trước khi đăng.</p>
          </Panel>
          <Panel header="Có hỗ trợ tranh chấp?" key="3">
            <p>Có hỗ trợ kết nối chủ trọ.</p>
          </Panel>
        </Collapse>
      </section>

      {/* REVIEWS */}
      <section className="section reviews">
        <h2 className="section-title">Người dùng đánh giá</h2>

        <Row gutter={[24, 24]}>
          {[
            {
              name: "Minh Tr.",
              comment: "Rất hài lòng, tìm được phòng nhanh.",
              rating: 5,
            },
            { name: "Hằng N.", comment: "Thông tin rõ ràng.", rating: 4.5 },
            {
              name: "Long V.",
              comment: "Dễ sử dụng, tiện ích tốt.",
              rating: 5,
            },
          ].map((rv) => (
            <Col xs={24} md={8} key={rv.name}>
              <Card className="review-card">
                <div className="review-header">
                  <div className="avatar-placeholder">{rv.name.charAt(0)}</div>
                  <div>
                    <div className="review-name">{rv.name}</div>
                    <Rate
                      disabled
                      defaultValue={rv.rating}
                      allowHalf
                      character={<StarFilled />}
                      style={{ fontSize: 14 }}
                    />
                  </div>
                </div>
                <p className="review-comment">“{rv.comment}”</p>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}
