import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Tag,
  Input,
  Select,
} from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";

const { TextArea } = Input;

export default function HandleOwner() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0,
  });

  const [statusFilter, setStatusFilter] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [handleType, setHandleType] = useState(null); // "APPROVED" hoặc "REJECTED"

  const loadRequests = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const res = await axiosClient.get("/api/owner-requests", { params });

      setRequests(res.data.data || []);

      setPagination({
        ...pagination,
        total: res.data.totalElements,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      console.error("Lỗi khi tải danh sách yêu cầu:", err);
      message.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [pagination.page, statusFilter]);

  const openHandleModal = (record, type) => {
    setSelectedRequest(record);
    setHandleType(type);
    setModalOpen(true);
  };

  const handleRequest = async () => {
    if (!selectedRequest) return;

    try {
      await axiosClient.put("/api/owner-requests/handle", {
        requestId: selectedRequest.id,
        status: handleType,
      });

      message.success(
        handleType === "APPROVED"
          ? "Đã phê duyệt yêu cầu"
          : "Đã từ chối yêu cầu"
      );

      setModalOpen(false);
      loadRequests();
    } catch (err) {
      console.error("Lỗi khi xử lý yêu cầu:", err);
      message.error("Không thể xử lý yêu cầu");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "User ID",
      dataIndex: "userId",
      width: 80,
    },
    {
      title: "Tên người dùng",
      dataIndex: "userName",
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (email) => (
        <span style={{ fontSize: 13, color: "#666" }}>{email}</span>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
    },
    {
      title: "CCCD",
      dataIndex: "citizenId",
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      render: (text) => text || <span style={{ color: "#999" }}>N/A</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const statusMap = {
          PENDING: { color: "gold", text: "Chờ duyệt" },
          APPROVED: { color: "green", text: "Đã duyệt" },
          REJECTED: { color: "red", text: "Đã từ chối" },
        };
        const config = statusMap[status] || {};
        return <Tag color={config.color}>{config.text || status}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      render: (record) => (
        <Space>
          {record.status === "PENDING" && (
            <>
              <Button
                type="text"
                style={{ color: "green" }}
                icon={<CheckOutlined />}
                onClick={() => openHandleModal(record, "APPROVED")}
              >
                Duyệt
              </Button>
              <Button
                type="text"
                danger
                icon={<CloseOutlined />}
                onClick={() => openHandleModal(record, "REJECTED")}
              >
                Từ chối
              </Button>
            </>
          )}
          {record.status !== "PENDING" && (
            <span style={{ color: "#999" }}>Đã xử lý</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <Select
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          allowClear
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPagination({ ...pagination, page: 0 });
          }}
        >
          <Select.Option value="PENDING">Chờ duyệt</Select.Option>
          <Select.Option value="APPROVED">Đã duyệt</Select.Option>
          <Select.Option value="REJECTED">Đã từ chối</Select.Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={requests}
        rowKey="id"
        bordered
        loading={loading}
        pagination={{
          current: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (p) => setPagination({ ...pagination, page: p - 1 }),
          style: { textAlign: "center", marginTop: 16 },
        }}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleRequest}
        title={
          handleType === "APPROVED"
            ? "Phê duyệt yêu cầu chủ trọ"
            : "Từ chối yêu cầu chủ trọ"
        }
        okText={handleType === "APPROVED" ? "Phê duyệt" : "Từ chối"}
        okType={handleType === "APPROVED" ? "primary" : "danger"}
      >
        <div>
          <p>
            <strong>User ID:</strong> {selectedRequest?.userId}
          </p>
          <p>
            <strong>Tên người dùng:</strong> {selectedRequest?.userName}
          </p>
          <p>
            <strong>Email:</strong> {selectedRequest?.email}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {selectedRequest?.phoneNumber}
          </p>
          <p>
            <strong>CCCD:</strong> {selectedRequest?.citizenId}
          </p>
          <p>
            <strong>Lý do yêu cầu:</strong>{" "}
            {selectedRequest?.reason || "Không có"}
          </p>
          <p style={{ marginTop: 16, color: "#666" }}>
            Bạn có chắc chắn muốn {handleType === "APPROVED" ? "phê duyệt" : "từ chối"} yêu cầu này?
          </p>
        </div>
      </Modal>
    </div>
  );
}
