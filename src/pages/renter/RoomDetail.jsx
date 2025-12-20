// src/pages/RoomDetail.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Button,
  Skeleton,
  Carousel,
  Divider,
  List,
  Empty,
} from "antd";
import {
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { getImageUrls } from "../../utils/imageHelper";

const { Title, Text, Paragraph } = Typography;

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const logErr = (err, msg) => {
    console.error("=== ROOM DETAIL ERROR ===");
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

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingServices(true);

      const [roomRes, serviceRes] = await Promise.all([
        axiosClient.get(`/api/rooms/${id}`),
        axiosClient.get(`/api/room-services/assign/room/${id}`),
      ]);

      const roomBody = roomRes.data;
      const serviceBody = serviceRes.data;

      if (!roomBody || !roomBody.data) {
        toast.error("Không tìm thấy thông tin phòng");
        setRoom(null);
      } else {
        setRoom(roomBody.data);
      }

      setServices(Array.isArray(serviceBody?.data) ? serviceBody.data : []);
    } catch (err) {
      logErr(err, "Không tải được dữ liệu phòng");
      setRoom(null);
      setServices([]);
    } finally {
      setLoading(false);
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    loadData();
    window.scroll(0, 0);
  }, [id]);

  if (loading)
    return (
      <div
        style={{
          maxWidth: "94%",
          margin: "40px auto",
          padding: "0 16px",
        }}
      >
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );

  if (!room)
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Title level={4}>Không tìm thấy phòng</Title>
        <Button onClick={() => navigate("/rooms")}>Quay lại danh sách</Button>
      </div>
    );

  const images = getImageUrls(room.images);

  const statusTag =
    room.status === "AVAILABLE" ? (
      <Tag color="green">Còn trống</Tag>
    ) : (
      <Tag color="red">Đã thuê</Tag>
    );

  return (
    <>
      <style>
        {`
          .custom-carousel-dots li button {
            background: rgba(255, 255, 255, 0.5) !important;
            width: 12px !important;
            height: 12px !important;
            border-radius: 50% !important;
            border: 2px solid #fff !important;
          }
          .custom-carousel-dots li.slick-active button {
            background: #fff !important;
            width: 14px !important;
            height: 14px !important;
          }
          .custom-carousel-dots {
            bottom: 20px !important;
          }
        `}
      </style>
      <div
        style={{
          maxWidth: "94%",
          margin: "32px auto 40px",
          padding: "0 16px",
        }}
      >
      {/* ================= BREADCRUMB WITH IMAGE ================= */}
      <div style={{ width: "100%", marginBottom: 28 }}>
        <div
          style={{
            height: 300,
            width: "100%",
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
            backgroundImage:
              "url(https://images.unsplash.com/photo-1590490360182-c33d57733427)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            textAlign: "center",
          }}
        >
          {/* Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
            }}
          />

          {/* Breadcrumb */}

          {/* Title + Address */}
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{room.name}</div>
            <br />
            <div
              style={{
                position: "relative",
                fontSize: 17,
              }}
            >
              <span
                style={{ cursor: "pointer", color: "#dbe8ff" }}
                onClick={() => navigate("/")}
              >
                Trang chủ
              </span>

              <span style={{ margin: "0 6px" }}>›</span>

              <span
                style={{ cursor: "pointer", color: "#dbe8ff" }}
                onClick={() => navigate("/rooms")}
              >
                Phòng
              </span>

              <span style={{ margin: "0 6px" }}>›</span>

              <span style={{ color: "#fff" }}>{room.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP: 2 CỘT */}
      <Row gutter={[24, 24]}>
        {/* ẢNH */}
        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: 12,
              overflow: "hidden",
              padding: 0,
              height: "100%",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Carousel 
              autoplay
              dots={{
                className: "custom-carousel-dots"
              }}
              dotPosition="bottom"
            >
              {images.map((img, idx) => (
                <div key={idx}>
                  <div style={{
                    position: "relative",
                    width: "100%",
                    height: 500,
                    background: "#000"
                  }}>
                    <img
                      src={img}
                      alt={`Ảnh phòng ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                    {/* Badge số ảnh */}
                    <div style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: "rgba(0,0,0,0.7)",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 500
                    }}>
                      {idx + 1} / {images.length}
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </Card>
        </Col>

        {/* THÔNG TIN */}
        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: 12,
              height: "100%",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                  {room.name}
                </Title>
                {statusTag}
              </div>

              <div style={{ textAlign: "right" }}>
                <Text
                  strong
                  style={{
                    fontSize: 20,
                    color: "#d4380d",
                    display: "block",
                  }}
                >
                  {room.price?.toLocaleString("vi-VN") || "0"}₫/tháng
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Tiền cọc:{" "}
                  <strong>{room.deposit?.toLocaleString("vi-VN")}₫</strong>
                </Text>
              </div>
            </div>

            <Divider />

            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <HomeOutlined />
                <Text>Diện tích: {room.area} m²</Text>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <TeamOutlined />
                <Text>Sức chứa: {room.capacity} người</Text>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <UserOutlined />
                <Text>
                  Chủ trọ: <strong>{room.ownerName}</strong>
                </Text>
              </div>
            </div>

            <Divider />

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <EnvironmentOutlined />
              <Text>{room.address}</Text>
            </div>

            <Button
              type="primary"
              size="large"
              block
              style={{ marginTop: 16 }}
              disabled={room.status !== "AVAILABLE"}
              onClick={() =>
                navigate("/booking", {
                  state: { room }, // TRUYỀN TOÀN BỘ OBJECT ROOM SANG BOOKING
                })
              }
            >
              Đặt lịch xem phòng 
            </Button>
          </Card>
        </Col>
      </Row>

      {/* DƯỚI: MÔ TẢ + TIỆN ÍCH + DỊCH VỤ */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={14}>
          <Card
            style={{ borderRadius: 12, marginBottom: 16 }}
            bodyStyle={{ padding: 20 }}
          >
            <Title level={4} style={{ marginBottom: 12 }}>
              Mô tả phòng
            </Title>
            <Paragraph style={{ whiteSpace: "pre-line" }}>
              {room.description || "Không có mô tả."}
            </Paragraph>
          </Card>

          <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 20 }}>
            <Title level={4} style={{ marginBottom: 12 }}>
              Tiện ích
            </Title>
            {room.facilities && room.facilities.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {room.facilities.map((facility, idx) => (
                  <Tag key={idx} color="blue" style={{ 
                    fontSize: 14, 
                    padding: "4px 12px",
                    marginBottom: 8
                  }}>
                    {facility}
                  </Tag>
                ))}
              </div>
            ) : (
              <Paragraph style={{ color: "#999" }}>
                Không có thông tin tiện ích.
              </Paragraph>
            )}
          </Card>
        </Col>

        {/* Dịch vụ */}
        <Col xs={24} md={10}>
          <Card
            style={{ borderRadius: 12 }}
            bodyStyle={{ padding: 20 }}
            title={
              <span>
                <DollarCircleOutlined style={{ marginRight: 6 }} />
                Dịch vụ theo phòng
              </span>
            }
          >
            {loadingServices ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : services.length === 0 ? (
              <Empty description="Không có dịch vụ nào được gán" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={services}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.serviceName}
                      description={
                        <Text type="secondary">
                          Giá:{" "}
                          <strong>{item.price?.toLocaleString("vi-VN") || "0"}₫</strong>
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
    </>
  );
}
