// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Input, Collapse, Carousel, Pagination } from "antd";
import RoomCard from "../../components/RoomCard";
import {
  SearchOutlined,
  WifiOutlined,
  SafetyOutlined,
  CarOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  BankOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/imageHelper";

import "./home.css";

const { Panel } = Collapse;
const API = "/api/search/rooms/advanced";

export default function Home() {
  const nav = useNavigate();

  const [keyword, setKeyword] = useState("");

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [latestRooms, setLatestRooms] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(false);

  const [apartments, setApartments] = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(false);

  const [houses, setHouses] = useState([]);
  const [loadingHouses, setLoadingHouses] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
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
      toast.error(msg || err.response.data?.message || "Có lỗi xảy ra");
    } else if (err.request) {
      console.error("NO RESPONSE:", err.request);
      toast.error("Không nhận phản hồi từ server");
    } else {
      console.error("REQUEST ERROR:", err.message);
      toast.error(err.message);
    }
  };

  // SEARCH trên thanh hero → điều hướng sang trang /search (page riêng)
  const search = () => {
    const qs = new URLSearchParams();
    if (keyword) qs.append("keyword", keyword);
    nav("/search?" + qs.toString());
  };

  const loadLatestRooms = async () => {
    try {
      setLoadingLatest(true);
      const params = {
        page: 0,
        size: 20,
        status: "AVAILABLE",
        sort: "createdAt,desc",
      };

      const res = await axiosClient.get(API, { params });
      const body = res.data;
      setLatestRooms(body.data || []);
    } catch (err) {
      logErr(err, "Không tải được danh sách Phòng Thuê mới nhất");
    } finally {
      setLoadingLatest(false);
    }
  };

  // Load danh sách phòng cho section "Phòng trọ" (có phân trang)
  const loadRooms = async () => {
    try {
      setLoadingRooms(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
        status: "AVAILABLE",
        type: "ROOM",
      };

      const res = await axiosClient.get(API, { params });
      const body = res.data;

      const data = body.data || [];
      setRooms(data);

      setPagination((prev) => ({
        ...prev,
        total: body.totalElements || body.total || 0,
      }));
    } catch (err) {
      logErr(err, "Không tải được danh sách phòng");
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadApartments = async () => {
    try {
      setLoadingApartments(true);
      const params = { page: 0, size: 8, status: "AVAILABLE", type: "APARTMENT" };
      const res = await axiosClient.get(API, { params });
      const body = res.data;
      setApartments(body.data || []);
    } catch (err) {
      logErr(err, "Không tải được danh sách Chung cư");
    } finally {
      setLoadingApartments(false);
    }
  };

  const loadHouses = async () => {
    try {
      setLoadingHouses(true);
      const params = { page: 0, size: 8, status: "AVAILABLE", type: "HOUSE" };
      const res = await axiosClient.get(API, { params });
      const body = res.data;
      setHouses(body.data || []);
    } catch (err) {
      logErr(err, "Không tải được danh sách Nguyên Căn");
    } finally {
      setLoadingHouses(false);
    }
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    loadLatestRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadApartments();
    loadHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // use shared RoomCard component for consistent UI

  return (
    <div className="homepage-content">
      {/* HERO + SEARCH */}
      <section className="hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1>Phòng vừa ý, giá hợp lý!</h1>

          <div className="search-box">
            <Input
              placeholder="Tìm Phòng Trọ..."
              size="large"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              prefix={<SearchOutlined />}
              className="search-input"
            />

            <Button type="primary" size="large" onClick={search} className="search-button">
              Tìm phòng
            </Button>
          </div>

          <div className="category-cards">
            <div className="category-card" onClick={() => nav("/rooms?type=rent")}>
              <div className="category-icon" style={{ background: "#E3F2FD" }}>
                <HomeOutlined style={{ color: "#2196F3", fontSize: 24 }} />
              </div>
              <div className="category-info">
                <div className="category-title">Cho thuê</div>
                <div className="category-count">78.404 tin cho thuê</div>
              </div>
            </div>

            <div className="category-card" onClick={() => nav("/rooms")}>
              <div className="category-icon" style={{ background: "#FFF3E0" }}>
                <HomeOutlined style={{ color: "#FF9800", fontSize: 24 }} />
              </div>
              <div className="category-info">
                <div className="category-title">Phòng Trọ</div>
                <div className="category-count">49.328 tin Phòng Trọ</div>
              </div>
            </div>

            <div className="category-card" onClick={() => nav("/rooms?type=project")}>
              <div className="category-icon" style={{ background: "#F3E5F5" }}>
                <BankOutlined style={{ color: "#9C27B0", fontSize: 24 }} />
              </div>
              <div className="category-info">
                <div className="category-title">Dự án</div>
                <div className="category-count">5.200 Dự án</div>
              </div>
            </div>

            <div className="category-card" onClick={() => nav("/contact")}>
              <div className="category-icon" style={{ background: "#E8F5E9" }}>
                <TeamOutlined style={{ color: "#4CAF50", fontSize: 24 }} />
              </div>
              <div className="category-info">
                <div className="category-title">Môi giới</div>
                <div className="category-count">952 chuyên viên</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST ROOMS (Carousel) */}
      <section className="section latest-rooms">
        <h2 className="section-title">Danh sách Phòng Thuê mới nhất</h2>
        <div style={{ marginTop: 12 }}>
          {/* carousel controls */}
          <div className="carousel-controls" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
            <Button size="small" onClick={() => carouselRef?.current?.prev()}>‹</Button>
            <Button size="small" onClick={() => carouselRef?.current?.next()}>›</Button>
          </div>

          <Carousel
            ref={(node) => (carouselRef.current = node)}
            dots={false}
            arrows={false}
            infinite={true}
            autoplay={true}
            autoplaySpeed={3000}
            pauseOnHover={true}
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            afterChange={(current) => setCurrentSlide(current)}
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 3 } },
              { breakpoint: 992, settings: { slidesToShow: 2 } },
              { breakpoint: 576, settings: { slidesToShow: 1 } },
            ]}
            className="latest-rooms-carousel"
          >
            {(() => {
              // deduplicate latestRooms by id and render with the shared room card
              const uniq = Array.from(new Map(latestRooms.map((r, i) => [r?.id ?? i, r])).values());
              return uniq.map((room, idx) => (
                <div key={room.id ?? idx} style={{ padding: 12 }}>
                  <RoomCard room={room} loading={loadingLatest} />
                </div>
              ));
            })()}
          </Carousel>
          {/* custom per-item dots: clicking will goTo that slide index (bring item to start) */}
          <div className="custom-dots" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            {latestRooms.map((r, idx) => (
              <button
                key={r.id || idx}
                className={"custom-dot" + (idx === currentSlide ? " active" : "")}
                onClick={() => carouselRef?.current?.goTo(idx)}
                aria-label={`Go to item ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOT LOCATIONS */}
      <section className="section hot-locations">
        <h2 className="section-title">Khu vực nổi bật</h2>
        <Row gutter={[24, 24]}>
          {[
            { name: "Hà Nội", img: "https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-1.jpg" },
            { name: "TP.HCM", img: "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2023/1/17/1139308/Du-Lich-Truc-Thang.jpg" },
            { name: "Đà Nẵng", img: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20%C4%91%C3%A0%20n%E1%BA%B5ng/anh-dep-da-nang-thumb.jpg" },
            { name: "Cần Thơ", img: "https://cdn-media.sforum.vn/storage/app/media/ctv_seo4/danh-lam-thang-canh-can-tho-thumb.jpg" },
            { name: "Bình Dương", img: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20b%C3%ACnh%20d%C6%B0%C6%A1ng/anh-dep-binh-duong-thumbnail.jpg" },
            { name: "Hải Phòng", img: "https://bhd.1cdn.vn/2025/07/07/cau-hoang-van-thu-1-6ca5b1e8b315a843ba4a8484b77c83e9.jpg" },
          ].map((loc) => (
            <Col xs={24} sm={12} md={8} key={loc.name}>
              <div
                className="hot-location-card"
                onClick={() => nav(`/search?keyword=${encodeURIComponent(loc.name)}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="hot-location-media">
                  <img
                    className="hot-location-image"
                    src={loc.img}
                    alt={loc.name}
                  />

                  <div className="hot-location-overlay">
                    <div className="hot-location-label">
                      <div className="hot-location-overlay-title">{loc.name}</div>
                    </div>
                  </div>
                </div>
                <div className="hot-location-name" style={{ marginTop: 8 }}>{loc.name}</div>
              </div>
            </Col>
          ))}
        </Row>
      </section>


      {/* FEATURED ROOMS */}
      <section className="section featured-rooms">
        <h2 className="section-title">Danh sách phòng trọ</h2>

        <Row gutter={[24, 24]}>
          {rooms.map((room) => (
            <Col xs={24} sm={12} md={6} key={room.id}>
              <RoomCard room={room} loading={loadingRooms} />
            </Col>
          ))}

          {!loadingRooms && rooms.length === 0 && (
            <Col span={24}>
              <p style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>
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

      {/* APARTMENT FEATURED */}
      <section className="section featured-rooms">
        <h2 className="section-title">Danh sách chung cư</h2>
        <Row gutter={[24, 24]}>
          {apartments.map((room) => (
            <Col xs={24} sm={12} md={6} key={room.id}>
              <RoomCard room={room} loading={loadingApartments} />
            </Col>
          ))}

          {!loadingApartments && apartments.length === 0 && (
            <Col span={24}>
              <p style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>
                Không có phòng nào.
              </p>
            </Col>
          )}
        </Row>
      </section>

      {/* HOUSE FEATURED */}
      <section className="section featured-rooms">
        <h2 className="section-title">Danh sách nhà nguyên căn</h2>
        <Row gutter={[24, 24]}>
          {houses.map((room) => (
            <Col xs={24} sm={12} md={6} key={room.id}>
              <RoomCard room={room} loading={loadingHouses} />
            </Col>
          ))}

          {!loadingHouses && houses.length === 0 && (
            <Col span={24}>
              <p style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>
                Không có phòng nào.
              </p>
            </Col>
          )}
        </Row>
      </section>

      {/* UTILITIES */}
      <section className="section utilities">
        <h2 className="section-title">Tiện ích nổi bật</h2>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <div className="util-item">
              <div className="util-icon-wrapper">
                <WifiOutlined className="util-icon" />
              </div>
              <h4>Wifi tốc độ cao</h4>
              <p>Tốc độ ổn định, phục vụ công việc và giải trí</p>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="util-item">
              <div className="util-icon-wrapper">
                <SafetyOutlined className="util-icon" />
              </div>
              <h4>An ninh 24/7</h4>
              <p>Bảo vệ túc trực, camera giám sát toàn bộ</p>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="util-item">
              <div className="util-icon-wrapper">
                <CarOutlined className="util-icon" />
              </div>
              <h4>Bãi đỗ xe</h4>
              <p>Rộng rãi, an toàn cho xe máy và ô tô</p>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="util-item">
              <div className="util-icon-wrapper">
                <ThunderboltOutlined className="util-icon" />
              </div>
              <h4>Điện nước minh bạch</h4>
              <p>Giá cả rõ ràng, thanh toán dễ dàng</p>
            </div>
          </Col>
        </Row>
      </section>

      {/* FAQ */}
      <section className="section faq-section">
        <h2 className="section-title">Câu hỏi thường gặp</h2>

        <Collapse accordion className="faq-collapse" expandIconPosition="end">
          <Panel header="Tìm Phòng Trọ trên hệ thống có mất phí không?" key="1" className="faq-panel">
            <p>
              Hoàn toàn miễn phí cho người tìm phòng. Bạn có thể tìm kiếm, xem thông tin chi tiết và liên hệ với chủ trọ mà không mất bất kỳ khoản phí nào.
            </p>
          </Panel>

          <Panel header="Thông tin Phòng Trọ có chính xác và đáng tin cậy không?" key="2" className="faq-panel">
            <p>
              Tất cả thông tin Phòng Trọ đều được kiểm duyệt trước khi đăng. Chúng tôi yêu cầu chủ trọ cung cấp đầy đủ thông tin và hình ảnh thực tế để đảm bảo độ tin cậy.
            </p>
          </Panel>

          <Panel header="Làm thế nào để liên hệ với chủ trọ?" key="3" className="faq-panel">
            <p>
              Bạn có thể nhấn nút "Nhắn tin" trên trang chi tiết phòng để chat trực tiếp với chủ trọ. Hoặc sử dụng số điện thoại được hiển thị để liên hệ qua điện thoại.
            </p>
          </Panel>

          <Panel header="Có hỗ trợ giải quyết tranh chấp giữa người thuê và chủ trọ không?" key="4" className="faq-panel">
            <p>
              Chúng tôi có đội ngũ hỗ trợ khách hàng sẵn sàng làm cầu nối và tư vấn khi có tranh chấp phát sinh. Tuy nhiên, hợp đồng thuê phòng được ký kết trực tiếp giữa 2 bên.
            </p>
          </Panel>

          <Panel header="Tôi có thể xem phòng trực tiếp trước khi thuê không?" key="5" className="faq-panel">
            <p>
              Tất nhiên! Chúng tôi khuyến khích bạn liên hệ chủ trọ để đặt lịch xem phòng trực tiếp, kiểm tra tình trạng phòng và tiện ích trước khi quyết định thuê.
            </p>
          </Panel>

          <Panel header="Làm sao để đăng ký tài khoản và đặt phòng?" key="6" className="faq-panel">
            <p>
              Bạn chỉ cần nhấn nút "Đăng nhập/Đăng ký" ở góc trên cùng, điền thông tin cơ bản để tạo tài khoản. Sau đó có thể đặt phòng trực tiếp hoặc nhắn tin với chủ trọ.
            </p>
          </Panel>

          <Panel header="Phí điện, nước, internet có được tính riêng không?" key="7" className="faq-panel">
            <p>
              Tùy thuộc vào từng phòng. Thông tin chi tiết về giá phòng, giá điện, nước, internet sẽ được hiển thị rõ ràng trên trang chi tiết phòng và trong hợp đồng thuê.
            </p>
          </Panel>

          <Panel header="Tôi cần chuẩn bị gì khi thuê Phòng Trọ?" key="8" className="faq-panel">
            <p>
              Thông thường bạn cần chuẩn bị: CMND/CCCD, giấy tờ liên quan (giấy xác nhận công việc/học tập nếu cần), tiền đặt cọc và tiền thuê tháng đầu theo thỏa thuận với chủ trọ.
            </p>
          </Panel>

          <Panel header="Làm thế nào để đăng ký làm chủ trọ và đăng tin cho thuê phòng?" key="9" className="faq-panel">
            <p>
              Để trở thành chủ trọ, bạn cần đăng ký tài khoản như đăng kí người dùng bình thường, sau đó chọn đăng tin để yêu cầu làm chủ trọ và đội ngũ chúng tôi sẽ phản hồi sớm trên email của bạn.
            </p>
          </Panel>
        </Collapse>
      </section>
    </div>
  );
}
