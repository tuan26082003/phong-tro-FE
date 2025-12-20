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
import { getImageUrl } from "../../utils/imageHelper";

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

  if (!booking)
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Title level={4}>Không tìm thấy dữ liệu</Title>
        <Button onClick={() => navigate("/booking-list")}>
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
                <DollarCircleOutlined />{" "}
                <strong>Gía đặt cọc: {booking.totalPrice.toLocaleString("vi-VN")}₫</strong>
              </p>

              <p>Trạng thái: {statusTag}</p>

              <Divider />

              <p>Ngày tạo: {new Date(booking.createdAt).toLocaleString()}</p>

              <p>Tên phòng: {booking.roomName}</p>
              <p>Tên người dùng đặt : {booking.nameUser}</p>
            </Card>
          </Col>

        </Row>
      </div>
    </div>
  );
}
