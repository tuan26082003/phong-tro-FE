// src/pages/BookingList.jsx

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Typography,
  Pagination,
  Empty,
  Popconfirm,
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function BookingList() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0,
  });

  const logErr = (err, msg) => {
    console.error("=== BOOKING LIST ERROR ===", err);
    toast.error(msg || "Lỗi tải danh sách booking");
  };

  const loadBookings = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
      };

      const res = await axiosClient.get("/api/bookings", { params });
      const body = res.data;

      const data = Array.isArray(body.data) ? body.data : [];
      setBookings(data);

      setPagination((prev) => ({
        ...prev,
        total: body.totalElements ?? data.length,
      }));
    } catch (err) {
      logErr(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line
    window.scroll(0, 0);
  }, [pagination.page]);

  const handleDelete = async (id) => {
    try {
      const res = await axiosClient.delete(`/api/bookings/${id}`, { data: {} });

      if (res.data.code >= 400) {
        toast.error(res.data.message || "Không thể hủy booking");
        return;
      }

      toast.success("Đã hủy booking");
      loadBookings();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      toast.error(err.response?.data?.message || "Không thể hủy booking");
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="gold">Chờ duyệt</Tag>;
      case "APPROVED":
        return <Tag color="green">Đã duyệt</Tag>;
      case "REJECTED":
        return <Tag color="red">Từ chối</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <div>
      {/* ================= HERO BREADCRUMB ================= */}
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
            Danh sách Booking
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
            <span style={{ color: "#fff" }}>Booking</span>
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
        {/* LIST */}
        <Row gutter={[24, 24]}>
          {bookings.map((b) => (
            <Col xs={24} sm={12} md={8} key={b.id}>
              <Card
                loading={loading}
                hoverable
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  padding: 4,
                }}
                onClick={() => navigate(`/booking/${b.id}`)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text strong style={{ fontSize: 16 }}>
                    Booking #{b.id}
                  </Text>
                  {getStatusTag(b.status)}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#666",
                  }}
                >
                  <EnvironmentOutlined />
                  <span>Phòng #{b.roomId}</span>
                </div>

                <div style={{ marginBottom: 10, fontSize: 15 }}>
                  <CalendarOutlined />{" "}
                  <strong>
                    {b.startDate} → {b.endDate}
                  </strong>
                </div>

                <div
                  style={{
                    marginBottom: 16,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <DollarOutlined />
                  <strong>{b.totalPrice?.toLocaleString("vi-VN")}₫</strong>
                </div>

                <div style={{ marginTop: "auto", textAlign: "right" }}>
                  <Popconfirm
                    title="Hủy booking này?"
                    okText="Hủy"
                    cancelText="Không"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(b.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Hủy
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}

          {!loading && bookings.length === 0 && (
            <Col span={24}>
              <div style={{ padding: 40, textAlign: "center" }}>
                <Empty description="Không có booking nào" />
              </div>
            </Col>
          )}
        </Row>

        {/* Pagination */}
        {pagination.total > pagination.size && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Pagination
              current={pagination.page + 1}
              pageSize={pagination.size}
              total={pagination.total}
              onChange={(p) =>
                setPagination((prev) => ({ ...prev, page: p - 1 }))
              }
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
