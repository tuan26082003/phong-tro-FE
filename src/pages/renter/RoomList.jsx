// src/pages/RoomList.jsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Input,
  InputNumber,
  Button,
  Select,
  Tag,
  Pagination,
  Typography,
  Empty,
} from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const API = "/api/rooms";
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

export default function RoomList() {
  const location = useLocation();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [minArea, setMinArea] = useState();
  const [sort, setSort] = useState("");

  const [pagination, setPagination] = useState({
    page: 0,
    size: 9,
    total: 0,
  });

  const logErr = (err, msg) => {
    console.error("=== ROOM LIST ERROR ===");
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const qParam = params.get("q") || params.get("keyword") || "";
    const minPriceParam = params.get("minPrice");
    const maxPriceParam = params.get("maxPrice");
    const minAreaParam = params.get("minArea");
    const sortParam = params.get("sort") || "";
    const pageParam = params.get("page");

    setQ(qParam);
    setMinPrice(minPriceParam ? Number(minPriceParam) : undefined);
    setMaxPrice(maxPriceParam ? Number(maxPriceParam) : undefined);
    setMinArea(minAreaParam ? Number(minAreaParam) : undefined);
    setSort(sortParam);
    setPagination((prev) => ({
      ...prev,
      page: pageParam ? Number(pageParam) - 1 : 0,
    }));
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
      };

      if (q) params.q = q;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minArea) params.minArea = minArea;
      if (sort) params.sort = sort;

      const res = await axiosClient.get(API, { params });
      const body = res.data;

      const data = Array.isArray(body.data)
        ? body.data
        : Array.isArray(body.content)
        ? body.content
        : [];

      setRooms(data);

      setPagination((prev) => ({
        ...prev,
        total: body.totalElements ?? data.length ?? 0,
      }));
    } catch (err) {
      logErr(err, "Không tải được danh sách phòng");
      setRooms([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [pagination.page, pagination.size, q, minPrice, maxPrice, minArea, sort]);

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (minPrice) params.set("minPrice", String(minPrice));
    if (maxPrice) params.set("maxPrice", String(maxPrice));
    if (minArea) params.set("minArea", String(minArea));
    if (sort) params.set("sort", sort);
    params.set("page", "1");

    navigate(`/rooms?${params.toString()}`);

    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page: page - 1 }));
    const params = new URLSearchParams(location.search);
    params.set("page", String(page));
    navigate(`/rooms?${params.toString()}`, { replace: true });
  };

  const getStatusTag = (status) => {
    if (status === "AVAILABLE") return <Tag color="green">Còn trống</Tag>;
    if (status === "OCCUPIED") return <Tag color="red">Đã thuê</Tag>;
    return <Tag>{status}</Tag>;
  };

  return (
    <div
      style={{
        maxWidth: "94%",
        margin: "24px auto 40px",
        padding: "0 16px",
      }}
    >
      {/* =================== BANNER TOP (giống RoomDetail) =================== */}
      <div style={{ width: "100%", marginBottom: 28 }}>
        <div
          style={{
            height: 300,
            width: "100%",
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
            backgroundImage:
              "url(https://images.unsplash.com/photo-1502672260266-1c1ef2d93688)",
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
            <div style={{ fontSize: 32, fontWeight: 700 }}>
              Danh sách phòng trọ
            </div>
            <div style={{ marginTop: 10, fontSize: 17 }}>
              <span
                style={{ cursor: "pointer", color: "#dbe8ff" }}
                onClick={() => navigate("/")}
              >
                Trang chủ
              </span>

              <span style={{ margin: "0 6px" }}>›</span>

              <span style={{ color: "#fff" }}>Phòng trọ</span>
            </div>
          </div>
        </div>
      </div>
      {/* ==================================================================== */}

      {/* FILTER BAR */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Từ khóa: tên phòng, địa chỉ..."
              prefix={<SearchOutlined />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Col>
          <Col xs={12} md={4}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Giá từ"
              min={0}
              value={minPrice}
              onChange={setMinPrice}
            />
          </Col>
          <Col xs={12} md={4}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Giá đến"
              min={0}
              value={maxPrice}
              onChange={setMaxPrice}
            />
          </Col>
          <Col xs={12} md={4}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="DT tối thiểu (m²)"
              min={0}
              value={minArea}
              onChange={setMinArea}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: "100%" }}
              placeholder="Sắp xếp"
              allowClear
              value={sort || undefined}
              onChange={(v) => setSort(v || "")}
            >
              <Option value="asc">Giá tăng dần</Option>
              <Option value="desc">Giá giảm dần</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button type="primary" block onClick={applyFilter}>
              Áp dụng
            </Button>
          </Col>
        </Row>
      </Card>

      {/* LIST */}
      <Row gutter={[24, 24]}>
        {rooms.map((room) => (
          <Col xs={24} sm={12} md={8} key={room.id}>
            <Card
              hoverable
              loading={loading}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={() => navigate(`/rooms/${room.id}`)}
              cover={
                <img
                  src={
                    room.images && room.images.length > 0
                      ? room.images[0]
                      : "https://placehold.co/900x600?text=Room"
                  }
                  alt={room.name}
                  style={{ height: 200, objectFit: "cover" }}
                />
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text strong style={{ fontSize: 16 }}>
                  {room.name}
                </Text>
                {getStatusTag(room.status)}
              </div>

              <div
                style={{
                  color: "#666",
                  fontSize: 13,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <EnvironmentOutlined />
                <span>{room.address}</span>
              </div>

              <div style={{ color: "#555", fontSize: 13, marginBottom: 8 }}>
                {room.area} m² · {room.capacity} người · Chủ trọ:{" "}
                <strong>{room.ownerName}</strong>
              </div>

              {room.utilities && (
                <div
                  style={{
                    color: "#888",
                    fontSize: 12,
                    marginBottom: 8,
                    maxHeight: 40,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Text type="secondary">Tiện ích: {room.utilities}</Text>
                </div>
              )}

              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text strong style={{ fontSize: 16, color: "#d4380d" }}>
                  {room.price.toLocaleString("vi-VN")}₫/tháng
                </Text>
              </div>
            </Card>
          </Col>
        ))}

        {!loading && rooms.length === 0 && (
          <Col span={24}>
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <Empty description="Không tìm thấy phòng phù hợp" />
            </div>
          </Col>
        )}
      </Row>

      {pagination.total > pagination.size && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Pagination
            current={pagination.page + 1}
            pageSize={pagination.size}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
