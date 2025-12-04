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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const images =
    room.images && room.images.length > 0
      ? room.images
      : ["https://placehold.co/900x900?text=Room"];

  const statusTag =
    room.status === "AVAILABLE" ? (
      <Tag color="green">Còn trống</Tag>
    ) : (
      <Tag color="red">Đã thuê</Tag>
    );

  return (
    <div
      style={{
        maxWidth: "94%",
        margin: "32px auto 40px",
        padding: "0 16px",
      }}
    >
      {/* BACK */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        style={{ paddingLeft: 0, marginBottom: 16 }}
        onClick={() => navigate("/rooms")}
      >
        Quay lại danh sách phòng
      </Button>

      {/* TOP: 2 CỘT – TRÁI ẢNH, PHẢI THÔNG TIN */}
      <Row gutter={[24, 24]}>
        {/* ẢNH (tối đa ~50% width) */}
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
            <Carousel autoplay>
              {images.map((img, idx) => (
                <div key={idx}>
                  <img
                    src={img}
                    alt={`room-${idx}`}
                    style={{
                      width: "100%",
                      height: 500,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </Carousel>
          </Card>
        </Col>

        {/* THÔNG TIN CHÍNH */}
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
                  {room.price.toLocaleString("vi-VN")}₫/tháng
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Tiền cọc:{" "}
                  <strong>{room.deposit.toLocaleString("vi-VN")}₫</strong>
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
            >
              Đặt thuê ngay
            </Button>
          </Card>
        </Col>
      </Row>

      {/* DƯỚI: MÔ TẢ, TIỆN ÍCH, DỊCH VỤ */}
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
            <Paragraph style={{ whiteSpace: "pre-line" }}>
              {room.utilities || "Không có thông tin tiện ích."}
            </Paragraph>
          </Card>
        </Col>

        {/* DỊCH VỤ THEO PHÒNG */}
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
                          <strong>{item.price.toLocaleString("vi-VN")}₫</strong>
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
  );
}
