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
import { SearchOutlined, EnvironmentOutlined, HomeOutlined, TeamOutlined } from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/imageHelper";

const API = "/api/search/rooms/advanced";
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState(""); // ROOM / HOUSE / APARTMENT
  const [minArea, setMinArea] = useState();
  const [maxArea, setMaxArea] = useState();
  const [minCapacity, setMinCapacity] = useState();
  const [status, setStatus] = useState(""); // AVAILABLE / OCCUPIED / ...

  const [pagination, setPagination] = useState({
    page: 0, // 0-based cho API
    size: 12,
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
    const typeParam = params.get("type") || params.get("roomType") || ""; // Hỗ trợ cả type và roomType
    const minAreaParam = params.get("minArea");
    const maxAreaParam = params.get("maxArea");
    const minCapacityParam = params.get("minCapacity");
    const statusParam = params.get("status") || "";
    const pageParam = params.get("page"); // 1-based trên URL

    setKeyword(kwParam);
    setType(typeParam);
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
      if (type) params.type = type;
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
    type,
    minArea,
    maxArea,
    minCapacity,
    status,
  ]);

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (type) params.set("type", type);
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
    if (s === "AVAILABLE") 
      return (
        <Tag 
          color="success" 
          style={{ 
            fontWeight: 600,
            fontSize: 13,
            padding: '4px 12px',
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
          }}
        >
          ✓ Còn trống
        </Tag>
      );
    if (s === "OCCUPIED") 
      return (
        <Tag 
          color="error"
          style={{ 
            fontWeight: 500,
            fontSize: 13,
            padding: '4px 12px',
            borderRadius: 6
          }}
        >
          Đã thuê
        </Tag>
      );
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
          <Col xs={24} md={6}>
            <Input
              placeholder="Từ khóa: tên phòng, địa chỉ..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Col>

          <Col xs={12} md={4}>
            <Select
              style={{ width: "100%" }}
              placeholder="Loại phòng"
              allowClear
              value={type || undefined}
              onChange={(v) => setType(v || "")}
            >
              <Option value="ROOM">Phòng trọ</Option>
              <Option value="HOUSE">Nhà nguyên căn</Option>
              <Option value="APARTMENT">Căn hộ</Option>
            </Select>
          </Col>

          <Col xs={12} md={3}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="DT min (m²)"
              min={0}
              value={minArea}
              onChange={setMinArea}
            />
          </Col>

          <Col xs={12} md={3}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="DT max (m²)"
              min={0}
              value={maxArea}
              onChange={setMaxArea}
            />
          </Col>

          <Col xs={12} md={3}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Sức chứa min"
              min={1}
              value={minCapacity}
              onChange={setMinCapacity}
            />
          </Col>

          <Col xs={12} md={3}>
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

          <Col xs={24} md={2}>
            <Button type="primary" block onClick={applyFilter}>
              Tìm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* LIST */}
      <Row gutter={[24, 24]}>
        {rooms.map((room) => (
          <Col xs={24} sm={12} md={6} key={room.id}>
            <Card
              hoverable
              loading={loading}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.3s"
              }}
              bodyStyle={{ padding: 16 }}
              cover={
                <img
                  src={
                    room.images && room.images.length > 0
                      ? getImageUrl(room.images[0])
                      : "https://placehold.co/900x600?text=Room"
                  }
                  alt={room.name}
                  style={{ height: 200, objectFit: "cover" }}
                />
              }
              onClick={() => navigate(`/rooms/${room.id}`)}
            >
              {/* Tên phòng */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 600, color: "#333" }}>
                  {room.name}
                </span>
              </div>

              {/* Tag trạng thái */}
              <div style={{ marginBottom: 12 }}>
                {getStatusTag(room.status)}
              </div>

              {/* Địa chỉ */}
              <div
                style={{
                  color: "#666",
                  fontSize: 14,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <EnvironmentOutlined style={{ fontSize: 16, color: "#1890ff" }} />
                <span>{room.address}</span>
              </div>

              {/* Thông tin phòng */}
              <div style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <HomeOutlined style={{ fontSize: 16, color: "#52c41a" }} />
                  <span>{room.area} m²</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <TeamOutlined style={{ fontSize: 16, color: "#fa8c16" }} />
                  <span>{room.capacity} người</span>
                </div>
              </div>

              {/* Giá */}
              <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0f0", marginBottom: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#d4380d" }}>
                  {room.price?.toLocaleString("vi-VN") || "0"}₫
                </span>
                <span style={{ fontSize: 14, color: "#999", marginLeft: 4 }}>
                  /tháng
                </span>
              </div>

              {/* Nút xem chi tiết */}
              <Button 
                type="primary" 
                block
                style={{
                  background: "#1890ff",
                  borderColor: "#1890ff",
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 38
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/rooms/${room.id}`);
                }}
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
