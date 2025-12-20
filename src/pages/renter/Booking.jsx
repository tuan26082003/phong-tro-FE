// src/pages/Booking.jsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Divider,
} from "antd";
import {
  HomeOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/imageHelper";

const { Title, Text } = Typography;

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();

  const room = location.state?.room || null;

  const [loading, setLoading] = useState(false);

  if (!room)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Title level={4}>Không có thông tin phòng</Title>
        <Button type="primary" onClick={() => navigate("/rooms")}>
          Quay lại danh sách
        </Button>
      </div>
    );

  const createBooking = async () => {
    try {
      setLoading(true);

      const body = {
        roomId: room.id,
      };

      const res = await axiosClient.post("/api/bookings", body);
      const data = res.data;

      if (data.code >= 400) {
        toast.success(data.message);
        return;
      }

      toast.success("Đặt phòng thành công");
      navigate(`/booking-list`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "94%",
        margin: "32px auto 40px",
        padding: "0 16px",
      }}
    >
      {/* HERO */}
      <div
        style={{
          height: 300,
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          marginBottom: 32,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
          }}
        />
        <div style={{ position: "absolute", textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>Đặt phòng</div>

          <div style={{ marginTop: 10, fontSize: 17 }}>
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

            <span style={{ color: "#fff" }}>Đặt phòng</span>
          </div>
        </div>
      </div>

      <Card
        style={{
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Title level={3} style={{ marginBottom: 20 }}>
          Xác nhận đặt phòng
        </Title>

        <Row gutter={[24, 24]}>
          {/* ROOM INFO */}
          <Col xs={24} md={12}>
            <Card
              style={{
                borderRadius: 12,
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <img
                src={
                  room.images && room.images.length > 0
                    ? getImageUrl(room.images[0])
                    : "https://placehold.co/800x500?text=Room"
                }
                alt="room"
                style={{ width: "100%", height: 220, objectFit: "cover" }}
              />

              <div style={{ padding: 18 }}>
                <Title level={4} style={{ marginBottom: 4 }}>
                  {room.name}
                </Title>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#666",
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  <EnvironmentOutlined />
                  {room.address}
                </div>

                <div style={{ marginBottom: 6 }}>
                  <HomeOutlined /> {room.area} m² · {room.capacity} người
                </div>

                <div style={{ marginBottom: 6 }}>
                  <UserOutlined /> Chủ trọ: {room.ownerName}
                </div>

                <div style={{ marginTop: 12 }}>
                  <Text strong style={{ color: "#d4380d", fontSize: 18 }}>
                    <DollarOutlined /> {room.price.toLocaleString("vi-VN")}₫ /
                    tháng
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* FORM */}
          <Col xs={24} md={12}>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div style={{ marginBottom: 12, color: '#666' }}>
                Kiểm tra thông tin phòng, sau khi xác nhận hệ thống sẽ gửi yêu cầu đặt phòng cho chủ trọ.
              </div>

              <Divider />

              <Button
                type="primary"
                size="large"
                block
                onClick={createBooking}
                loading={loading}
                style={{
                  height: 50,
                  fontSize: 17,
                  fontWeight: 600,
                  borderRadius: 10,
                }}
              >
                Xác nhận đặt phòng
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
