// src/pages/Contract.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Table,
  Skeleton,
  Empty,
} from "antd";
import {
  FileDoneOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

export default function Contract() {
  const navigate = useNavigate();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadContracts = async () => {
    try {
      setLoading(true);

      const res = await axiosClient.get("/api/contracts", {
        params: { page: 0, size: 50 },
      });

      const body = res.data;
      const arr = Array.isArray(body.data) ? body.data : [];

      setContracts(arr);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách hợp đồng");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const downloadContract = async (id) => {
    try {
      const res = await axiosClient.get(`/api/contracts/${id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải hợp đồng");
    }
  };

  const columns = [
    {
      title: "Hợp đồng",
      dataIndex: "contractId",
      render: (id) => (
        <span style={{ fontWeight: 600 }}>
          <FileDoneOutlined style={{ marginRight: 6 }} />#{id}
        </span>
      ),
    },
    {
      title: "Phòng",
      render: (_, r) => (
        <div>
          <Text strong>{r.roomName}</Text>
          <div style={{ fontSize: 12, color: "#666" }}>
            <HomeOutlined /> {r.roomAddress}
          </div>
        </div>
      ),
    },
    {
      title: "Người thuê",
      render: (_, r) => (
        <div>
          <UserOutlined /> {r.renterName}
          <div style={{ fontSize: 12 }}>{r.renterPhone}</div>
        </div>
      ),
    },
    {
      title: "Thời hạn",
      render: (_, r) => (
        <div>
          <CalendarOutlined /> {r.startDate.slice(0, 10)} →{" "}
          {r.endDate.slice(0, 10)}
        </div>
      ),
    },
    {
      title: "Giá thuê",
      render: (_, r) => (
        <Text strong type="danger">
          <DollarOutlined /> {r.price.toLocaleString("vi-VN")}₫
        </Text>
      ),
    },
    {
      title: "Tải file",
      render: (_, r) => (
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          onClick={() => downloadContract(r.contractId)}
        >
          Tải PDF
        </Button>
      ),
    },
  ];

  return (
    <div
      style={{
        maxWidth: "94%",
        margin: "0 auto 40px",
        padding: "0 16px",
      }}
    >
      {/* BANNER */}
      <div style={{ width: "100%", marginBottom: 28 }}>
        <div
          style={{
            height: 300,
            width: "100%",
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
            backgroundImage:
              "url(https://images.unsplash.com/photo-1582407947304-fd86f028f716)",
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
              Quản lý hợp đồng thuê
            </div>

            <div style={{ marginTop: 10, fontSize: 17 }}>
              <span
                style={{ cursor: "pointer", color: "#dbe8ff" }}
                onClick={() => navigate("/")}
              >
                Trang chủ
              </span>

              <span style={{ margin: "0 6px" }}>›</span>

              <span style={{ color: "#fff" }}>Hợp đồng</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <Card
        style={{
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Title level={3} style={{ marginBottom: 20 }}>
          Danh sách hợp đồng
        </Title>

        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : contracts.length === 0 ? (
          <Empty description="Không có hợp đồng nào" style={{ padding: 40 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={contracts}
            rowKey="contractId"
            pagination={false}
            style={{ marginTop: 10 }}
          />
        )}
      </Card>
    </div>
  );
}
