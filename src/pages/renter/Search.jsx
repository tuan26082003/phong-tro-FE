// src/pages/Search.jsx

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

const API = "/api/search/rooms/advanced";
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [minArea, setMinArea] = useState();
  const [maxArea, setMaxArea] = useState();
  const [minCapacity, setMinCapacity] = useState();
  const [status, setStatus] = useState(""); // AVAILABLE / OCCUPIED / ...

  const [pagination, setPagination] = useState({
    page: 0, // 0-based cho API
    size: 9,
    total: 0,
  });

  const logErr = (err, msg) => {
    console.error("=== SEARCH ROOMS ERROR ===");
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

  // Lấy giá trị ban đầu từ query string (nhảy từ Home sang)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const kwParam = params.get("keyword") || params.get("q") || "";
    const minAreaParam = params.get("minArea");
    const maxAreaParam = params.get("maxArea");
    const minCapacityParam = params.get("minCapacity");
    const statusParam = params.get("status") || "";
    const pageParam = params.get("page"); // 1-based trên URL

    setKeyword(kwParam);
    setMinArea(minAreaParam ? Number(minAreaParam) : undefined);
    setMaxArea(maxAreaParam ? Number(maxAreaParam) : undefined);
    setMinCapacity(minCapacityParam ? Number(minCapacityParam) : undefined);
    setStatus(statusParam);
    setPagination((prev) => ({
      ...prev,
      page: pageParam ? Number(pageParam) - 1 : 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
      };

      if (keyword) params.keyword = keyword;
      if (status) params.status = status;
      if (minArea) params.minArea = minArea;
      if (maxArea) params.maxArea = maxArea;
      if (minCapacity) params.minCapacity = minCapacity;

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
      logErr(err, "Không tải được kết quả tìm kiếm");
      setRooms([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.page,
    pagination.size,
    keyword,
    minArea,
    maxArea,
    minCapacity,
    status,
  ]);

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (minArea) params.set("minArea", String(minArea));
    if (maxArea) params.set("maxArea", String(maxArea));
    if (minCapacity) params.set("minCapacity", String(minCapacity));
    if (status) params.set("status", status);
    params.set("page", "1");

    navigate(`/search?${params.toString()}`);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page: page - 1 }));
    const params = new URLSearchParams(location.search);
    params.set("page", String(page));
    navigate(`/search?${params.toString()}`, { replace: true });
  };

  const getStatusTag = (s) => {
    if (s === "AVAILABLE") return <Tag color="green">Còn trống</Tag>;
    if (s === "OCCUPIED") return <Tag color="red">Đã thuê</Tag>;
    return <Tag>{s}</Tag>;
  };

  return (
    <div
      style={{
        maxWidth: "94%",
        margin: "24px auto 40px",
        padding: "0 16px",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Kết quả tìm kiếm phòng trọ
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Lọc nâng cao theo diện tích, sức chứa, trạng thái phòng.
        </Paragraph>
      </div>

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
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
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
            <InputNumber
              style={{ width: "100%" }}
              placeholder="DT tối đa (m²)"
              min={0}
              value={maxArea}
              onChange={setMaxArea}
            />
          </Col>

          <Col xs={12} md={4}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Sức chứa tối thiểu"
              min={1}
              value={minCapacity}
              onChange={setMinCapacity}
            />
          </Col>

          <Col xs={12} md={4}>
            <Select
              style={{ width: "100%" }}
              placeholder="Trạng thái"
              allowClear
              value={status || undefined}
              onChange={(v) => setStatus(v || "")}
            >
              <Option value="AVAILABLE">Còn trống</Option>
              <Option value="OCCUPIED">Đã thuê</Option>
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

              <div
                style={{
                  color: "#555",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
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

              <Button
                type="primary"
                block
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                Xem chi tiết
              </Button>
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
