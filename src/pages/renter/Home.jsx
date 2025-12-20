// src/pages/Home.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
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
  HomeOutlined,
  AppstoreOutlined,
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
  const [location, setLocation] = useState("all");
  const [roomType, setRoomType] = useState("all");

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
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
      toast.error(msg || err.response.data.message);
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

  // Load danh sách phòng cho section "Phòng nổi bật" (thực tế là list có phân trang)
  const loadRooms = async () => {
    try {
      setLoadingRooms(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
        status: "AVAILABLE",
        // Có thể thêm các filter khác nếu muốn
        // keyword: "",
        // type: "",
        // minArea: null,
        // maxArea: null,
        // minCapacity: null,
      };

      const res = await axiosClient.get(API, { params });
      const body = res.data;

      console.log("API Response:", body);
      console.log("Rooms data:", body.data);
      console.log("First room:", body.data?.[0]);
      console.log("First room images:", body.data?.[0]?.images);

      // API trả về PageResponse<RoomDocument>
      const data = body.data || [];

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
  }, [pagination.page, pagination.size]);

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

            <Button 
              type="primary" 
              size="large" 
              onClick={search}
              className="search-button"
            >
              Tìm phòng
            </Button>
            
          </div>

          <div className="category-cards">
            <div className="category-card" onClick={() => nav("/rooms?type=rent")}>
              <div className="category-icon" style={{ background: '#E3F2FD' }}>
                <HomeOutlined style={{ color: '#2196F3', fontSize: 24 }} />
              </div>
              <div className="category-info">
                <div className="category-title">Cho thuê</div>
                <div className="category-count">78.404 tin cho thuê</div>
              </div>
            </div>

            <div className="category-card" onClick={() => nav("/rooms")}>
              <div className="category-icon" style={{ background: '#FFF3E0' }}>
                <HomeOutlined style={{ color: '#FF9800', fontSize: 24 }} />
              </div>
              <div className="category-info">
                <div className="category-title">Phòng Trọ</div>
                <div className="category-count">49.328 tin Phòng Trọ</div>
              </div>
            </div>

            <div className="category-card" onClick={() => nav("/rooms?type=project")}>
              <div className="category-icon" style={{ background: '#F3E5F5' }}>
                <BankOutlined style={{ color: '#9C27B0', fontSize: 24 }} />
              </div>
              <div className="category-info">
                <div className="category-title">Dự án</div>
                <div className="category-count">5.200 Dự án</div>
              </div>
            </div>

            <div className="category-card" onClick={() => nav("/contact")}>
              <div className="category-icon" style={{ background: '#E8F5E9' }}>
                <TeamOutlined style={{ color: '#4CAF50', fontSize: 24 }} />
              </div>
              <div className="category-info">
                <div className="category-title">Môi giới</div>
                <div className="category-count">952 chuyên viên</div>
              </div>
            </div>
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
      <section className="section featured-rooms">
        <h2 className="section-title">Phòng nổi bật</h2>

        <Row gutter={[24, 24]}>
          {rooms.map((room) => {
            console.log("Rendering room:", room.id, "Images:", room.images);
            const imageUrl = room.images && room.images.length > 0
              ? getImageUrl(room.images[0])
              : "https://placehold.co/900x600?text=No+Image";
            console.log("Image URL:", imageUrl);
            
            return (
              <Col
                xs={24}
                sm={12}
                md={6}
                key={room.id}
              >
                <Card
                  hoverable
                  className="room-card"
                  loading={loadingRooms}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    height: "auto",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "all 0.3s"
                  }}
                  bodyStyle={{ padding: 12 }}
                  cover={
                    <div className="room-image-wrapper">
                      <img
                        src={imageUrl}
                        alt={room.name}
                        className="room-image"
                        style={{ height: 140, objectFit: "cover" }}
                        onError={(e) => {
                          console.error("Image load error:", imageUrl);
                          e.target.src = "https://placehold.co/900x600?text=Error";
                        }}
                      />
                    </div>
                  }
                  onClick={() => nav(`/rooms/${room.id}`)}
                >
                <div className="room-card-body">
                  {/* Tên phòng */}
                  <div style={{ 
                    marginBottom: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: "#333" }}>
                      {room.name}
                    </span>
                  </div>

                  {/* Địa chỉ, diện tích, số người trên 1 hàng */}
                  <div style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    overflow: "hidden"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 4,
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden"
                    }}>
                      <EnvironmentOutlined style={{ fontSize: 14, flexShrink: 0 }} />
                      <span style={{ 
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>{room.address}</span>
                    </div>
                    <span style={{ color: "#d9d9d9", flexShrink: 0 }}>|</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <HomeOutlined style={{ fontSize: 14 }} />
                      <span>{room.area}m²</span>
                    </div>
                    <span style={{ color: "#d9d9d9", flexShrink: 0 }}>|</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <TeamOutlined style={{ fontSize: 14 }} />
                      <span>{room.capacity} người</span>
                    </div>
                  </div>

                  {/* Giá */}
                  <div className="room-price-section" style={{ 
                    marginBottom: 10,
                    paddingTop: 8,
                    borderTop: "1px solid #f0f0f0"
                  }}>
                    <span className="room-price" style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#d4380d"
                    }}>
                      {room.price?.toLocaleString("vi-VN") || "0"}₫
                    </span>
                    <span className="price-unit" style={{
                      fontSize: 14,
                      color: "#999",
                      marginLeft: 4
                    }}>
                      /tháng
                    </span>
                  </div>

                  {/* Nút xem chi tiết và nhắn tin */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      type="primary"
                      style={{
                        flex: 1,
                        background: "#1890ff",
                        borderColor: "#1890ff",
                        height: 32,
                        fontWeight: 500,
                        borderRadius: 6,
                        fontSize: 13
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        nav(`/rooms/${room.id}`);
                      }}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      style={{
                        flex: 1,
                        height: 32,
                        fontWeight: 500,
                        borderRadius: 6,
                        fontSize: 13
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!room.ownerId) {
                          toast.warning("Không tìm thấy thông tin chủ trọ");
                          return;
                        }
                        // Lưu ownerId vào localStorage để Chat component sử dụng
                        localStorage.setItem("chatWithUserId", room.ownerId);
                        nav(`/chat`);
                      }}
                    >
                      Nhắn tin
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
            );
          })}

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

        <Collapse 
          accordion
          className="faq-collapse"
          expandIconPosition="end"
        >
          <Panel 
            header="Tìm Phòng Trọ trên hệ thống có mất phí không?" 
            key="1"
            className="faq-panel"
          >
            <p>Hoàn toàn miễn phí cho người tìm phòng. Bạn có thể tìm kiếm, xem thông tin chi tiết và liên hệ với chủ trọ mà không mất bất kỳ khoản phí nào.</p>
          </Panel>
          <Panel 
            header="Thông tin Phòng Trọ có chính xác và đáng tin cậy không?" 
            key="2"
            className="faq-panel"
          >
            <p>Tất cả thông tin Phòng Trọ đều được kiểm duyệt trước khi đăng. Chúng tôi yêu cầu chủ trọ cung cấp đầy đủ thông tin và hình ảnh thực tế để đảm bảo độ tin cậy.</p>
          </Panel>
          <Panel 
            header="Làm thế nào để liên hệ với chủ trọ?" 
            key="3"
            className="faq-panel"
          >
            <p>Bạn có thể nhấn nút "Nhắn tin" trên trang chi tiết phòng để chat trực tiếp với chủ trọ. Hoặc sử dụng số điện thoại được hiển thị để liên hệ qua điện thoại.</p>
          </Panel>
          <Panel 
            header="Có hỗ trợ giải quyết tranh chấp giữa người thuê và chủ trọ không?" 
            key="4"
            className="faq-panel"
          >
            <p>Chúng tôi có đội ngũ hỗ trợ khách hàng sẵn sàng làm cầu nối và tư vấn khi có tranh chấp phát sinh. Tuy nhiên, hợp đồng thuê phòng được ký kết trực tiếp giữa 2 bên.</p>
          </Panel>
          <Panel 
            header="Tôi có thể xem phòng trực tiếp trước khi thuê không?" 
            key="5"
            className="faq-panel"
          >
            <p>Tất nhiên! Chúng tôi khuyến khích bạn liên hệ chủ trọ để đặt lịch xem phòng trực tiếp, kiểm tra tình trạng phòng và tiện ích trước khi quyết định thuê.</p>
          </Panel>
          <Panel 
            header="Làm sao để đăng ký tài khoản và đặt phòng?" 
            key="6"
            className="faq-panel"
          >
            <p>Bạn chỉ cần nhấn nút "Đăng nhập/Đăng ký" ở góc trên cùng, điền thông tin cơ bản để tạo tài khoản. Sau đó có thể đặt phòng trực tiếp hoặc nhắn tin với chủ trọ.</p>
          </Panel>
          <Panel 
            header="Phí điện, nước, internet có được tính riêng không?" 
            key="7"
            className="faq-panel"
          >
            <p>Tùy thuộc vào từng phòng. Thông tin chi tiết về giá phòng, giá điện, nước, internet sẽ được hiển thị rõ ràng trên trang chi tiết phòng và trong hợp đồng thuê.</p>
          </Panel>
          <Panel 
            header="Tôi cần chuẩn bị gì khi thuê Phòng Trọ?" 
            key="8"
            className="faq-panel"
          >
            <p>Thông thường bạn cần chuẩn bị: CMND/CCCD, giấy tờ liên quan (giấy xác nhận công việc/học tập nếu cần), tiền đặt cọc và tiền thuê tháng đầu theo thỏa thuận với chủ trọ.</p>
          </Panel>
          <Panel 
            header="Làm thế nào để đăng ký làm chủ trọ và đăng tin cho thuê phòng?" 
            key="9"
            className="faq-panel"
          >
            <p>Để trở thành chủ trọ, bạn cần đăng ký tài khoản như đăng kí người dùng bình thường, sau đó chọn đăng tin để yêu cầu làm chủ trọ và đội ngũ chúng tôi sẽ phản hồi sớm trên email của bạn.</p>
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
