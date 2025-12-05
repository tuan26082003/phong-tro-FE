// src/pages/Home.jsx

import { useState, useEffect } from "react";
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
  Pagination,
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
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

import "./home.css";

const { Panel } = Collapse;
const API = "/api/rooms";

export default function Home() {
  const nav = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [minArea, setMinArea] = useState();
  const [maxArea, setMaxArea] = useState();
  const [minCapacity, setMinCapacity] = useState();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 6,
    total: 0,
  });

  const logErr = (err, msg) => {
    console.error("=== ROOMS ERROR ===");

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

  // SEARCH trên thanh hero → vẫn điều hướng sang trang /search (search page riêng)
  const search = () => {
    const qs = new URLSearchParams();
    if (keyword) qs.append("keyword", keyword);
    if (minArea) qs.append("minArea", minArea);
    if (maxArea) qs.append("maxArea", maxArea);
    if (minCapacity) qs.append("minCapacity", minCapacity);
    nav("/search?" + qs.toString());
  };

  // Load danh sách phòng cho section "Phòng nổi bật" (thực tế là list có phân trang)
  const loadRooms = async () => {
    try {
      setLoadingRooms(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
      };

      const res = await axiosClient.get(API, { params });
      const body = res.data;

      let data = body.data || [];

      // Nếu người ta cố dùng minCapacity ở Home nhưng API không hỗ trợ → filter client
      if (minCapacity) {
        data = data.filter((r) => (r.capacity || 0) >= Number(minCapacity));
      }

      setRooms(data);
      setPagination((prev) => ({
        ...prev,
        total: body.totalElements || 0,
      }));
    } catch (err) {
      logErr(err, "Không tải được danh sách phòng");
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size, minCapacity]);

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
            {
              name: "Hà Nội",
              img: "https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-1.jpg",
            },
            {
              name: "TP.HCM",
              img: "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2023/1/17/1139308/Du-Lich-Truc-Thang.jpg",
            },
            {
              name: "Đà Nẵng",
              img: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20%C4%91%C3%A0%20n%E1%BA%B5ng/anh-dep-da-nang-thumb.jpg",
            },
            {
              name: "Cần Thơ",
              img: "https://cdn-media.sforum.vn/storage/app/media/ctv_seo4/danh-lam-thang-canh-can-tho-thumb.jpg",
            },
            {
              name: "Bình Dương",
              img: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20b%C3%ACnh%20d%C6%B0%C6%A1ng/anh-dep-binh-duong-thumbnail.jpg",
            },
            {
              name: "Hải Phòng",
              img: "https://bhd.1cdn.vn/2025/07/07/cau-hoang-van-thu-1-6ca5b1e8b315a843ba4a8484b77c83e9.jpg",
            },
          ].map((city) => (
            <Col xs={12} md={8} key={city.name}>
              <div
                className="location-card"
                onClick={() =>
                  nav("/rooms?keyword=" + encodeURIComponent(city.name))
                }
              >
                <img src={city.img} />
                <div className="location-overlay">
                  <EnvironmentOutlined />
                  <span>{city.name}</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* FEATURED ROOMS – DÙNG API THỰC */}
      <section className="section">
        <h2 className="section-title">Phòng nổi bật</h2>

        <Row gutter={[24, 24]}>
          {rooms.map((room) => (
            <Col
              xs={24}
              sm={12}
              md={8}
              key={room.id}
              onClick={() => nav(`/rooms/${room.id}`)}
            >
              <Card
                hoverable
                className="room-card"
                loading={loadingRooms}
                cover={
                  <img
                    src={
                      room.images && room.images.length > 0
                        ? `http://localhost:8080/${room.images[0]}`
                        : "https://placehold.co/900x600?text=No+Image"
                    }
                    alt={room.name}
                  />
                }
              >
                <h3>{room.name}</h3>

                <p className="room-meta">
                  {room.area} m² · {room.capacity} người
                </p>

                <p className="room-address">{room.address}</p>

                <p className="room-price">
                  {room.price.toLocaleString("vi-VN")}₫/tháng
                </p>
              </Card>
            </Col>
          ))}

          {!loadingRooms && rooms.length === 0 && (
            <Col span={24}>
              <p style={{ textAlign: "center", color: "#888" }}>
                Không có phòng nào.
              </p>
            </Col>
          )}
        </Row>

        {pagination.total > pagination.size && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Pagination
              current={pagination.page + 1}
              pageSize={pagination.size}
              total={pagination.total}
              onChange={(page, pageSize) =>
                setPagination({
                  ...pagination,
                  page: page - 1,
                  size: pageSize,
                })
              }
              showSizeChanger={false}
            />
          </div>
        )}
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
