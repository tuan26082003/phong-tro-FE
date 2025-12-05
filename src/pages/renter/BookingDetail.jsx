// src/pages/BookingDetail.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Skeleton,
  Divider,
  List,
  Empty,
  Button,
} from "antd";
import {
  CalendarOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const { Title, Text, Paragraph } = Typography;

export default function BookingDetail() {
  const { id } = useParams(); // bookingId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [room, setRoom] = useState(null);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const bookingRes = await axiosClient.get(`/api/bookings/${id}`);
      const bookingData = bookingRes.data?.data;

      if (!bookingData) {
        toast.error("Không tìm thấy booking");
        return;
      }

      setBooking(bookingData);

      // song song lấy room + service
      const [roomRes, serviceRes] = await Promise.all([
        axiosClient.get(`/api/rooms/${bookingData.roomId}`),
        axiosClient.get(`/api/room-services/assign/room/${bookingData.roomId}`),
      ]);

      setRoom(roomRes.data?.data || null);
      setServices(serviceRes.data?.data || []);
    } catch (err) {
      console.error("LOAD BOOKING DETAIL ERROR:", err);
      toast.error("Không thể tải dữ liệu booking");
    } finally {
      setLoading(false);
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading)
    return (
      <div style={{ maxWidth: "94%", margin: "40px auto" }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );

  if (!booking || !room)
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Title level={4}>Không tìm thấy dữ liệu</Title>
        <Button onClick={() => navigate("/bookings")}>
          Quay lại danh sách
        </Button>
      </div>
    );

  const statusTag = {
    PENDING: <Tag color="gold">Chờ duyệt</Tag>,
    APPROVED: <Tag color="green">Đã duyệt</Tag>,
    REJECTED: <Tag color="red">Từ chối</Tag>,
  }[booking.status];

  return (
    <div>
      {/* ================= HERO ================= */}
      <section
        style={{
          position: "relative",
          height: 260,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1507089947368-19c1da9775ae)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
          }}
        />

        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: 42, marginBottom: 10, fontWeight: 700 }}>
            Chi tiết Booking #{booking.id}
          </h1>

          {/* Breadcrumb */}
          <div style={{ fontSize: 16, opacity: 0.9 }}>
            <span
              style={{ cursor: "pointer", color: "#dbe8ff" }}
              onClick={() => navigate("/")}
            >
              Trang chủ
            </span>
            <span> &nbsp;›&nbsp; </span>

            <span
              style={{ cursor: "pointer", color: "#dbe8ff" }}
              onClick={() => navigate("/bookings")}
            >
              Booking
            </span>

            <span> &nbsp;›&nbsp; </span>
            <span style={{ color: "#fff" }}>#{booking.id}</span>
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <div
        style={{
          maxWidth: "94%",
          margin: "0 auto 40px",
          padding: "0 16px",
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/booking-list")}
          style={{ marginBottom: 20 }}
        >
          Quay lại danh sách
        </Button>

        <Row gutter={[24, 24]}>
          {/* ======== BOOKING INFO ======== */}
          <Col xs={24} md={14}>
            <Card
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 22 }}
              title={<strong>Thông tin Booking</strong>}
            >
              <p>
                <CalendarOutlined /> &nbsp;
                <strong>
                  {booking.startDate} → {booking.endDate}
                </strong>
              </p>

              <p>
                <DollarCircleOutlined />{" "}
                <strong>{booking.totalPrice.toLocaleString("vi-VN")}₫</strong>
              </p>

              <p>Trạng thái: {statusTag}</p>

              <Divider />

              <p>Ngày tạo: {new Date(booking.createdAt).toLocaleString()}</p>

              <p>Mã phòng: #{booking.roomId}</p>
              <p>Mã người dùng: #{booking.userId}</p>
            </Card>
          </Col>

          {/* ======== ROOM INFO ======== */}
          <Col xs={24} md={10}>
            <Card
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 22 }}
              title={<strong>Thông tin Phòng</strong>}
            >
              <img
                src={
                  room.images?.length
                    ? room.images[0]
                    : "https://placehold.co/600x400?text=Room"
                }
                alt="room"
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              />

              <Title level={4}>{room.name}</Title>

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

              <p>
                <HomeOutlined /> Diện tích: {room.area} m²
              </p>
              <p>
                <TeamOutlined /> Sức chứa: {room.capacity} người
              </p>
              <p>
                <UserOutlined /> Chủ trọ: <strong>{room.ownerName}</strong>
              </p>

              <Divider />

              <h4>Tiện ích</h4>
              <Paragraph style={{ whiteSpace: "pre-line" }}>
                {room.utilities || "Không có tiện ích."}
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* ======== SERVICES ======== */}
        <Row style={{ marginTop: 24 }}>
          <Col xs={24} md={24}>
            <Card
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 22 }}
              title={<strong>Dịch vụ kèm theo phòng</strong>}
            >
              {loadingServices ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : services.length === 0 ? (
                <Empty description="Không có dịch vụ nào" />
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
                            <strong>
                              {item.price.toLocaleString("vi-VN")}₫
                            </strong>
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
    </div>
  );
}
