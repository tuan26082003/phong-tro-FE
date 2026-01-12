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
import { toast } from "react-toastify";
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
      const res = await axiosClient.put("/api/owner-requests/handle", {
        requestId: selectedRequest.id,
        status: handleType,
      });

      // prefer server message if provided
      const serverMsg = res?.data?.message;
      if (handleType === "APPROVED") {
        message.success(serverMsg || "Đã phê duyệt yêu cầu");
        toast.success(serverMsg || "Phê duyệt yêu cầu thành công");
      } else {
        message.success(serverMsg || "Đã từ chối yêu cầu");
        toast.success(serverMsg || "Từ chối yêu cầu thành công");
      }

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
      render: (name) => <strong style={{ display: 'inline-block', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</strong>,
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (email) => (
        <span title={email} style={{ fontSize: 13, color: "#666", display: 'inline-block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
      ),
      ellipsis: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      ellipsis: true,
    },
    {
      title: "CCCD",
      dataIndex: "citizenId",
      ellipsis: true,
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      render: (text) => (
        text ? (
          <div title={text} style={{ maxWidth: 280, whiteSpace: 'normal', wordBreak: 'break-word', color: '#333' }}>{text}</div>
        ) : (
          <span style={{ color: "#999" }}>N/A</span>
        )
      ),
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
      render: (date) => (date ? new Date(date).toLocaleString("vi-VN") : '-'),
      width: 160,
    },
    {
      title: "Hành động",
      width: 160,
      render: (record) => (
        <div style={{ whiteSpace: 'nowrap', display: 'flex', gap: 8, alignItems: 'center' }}>
          {record.status === "PENDING" ? (
            <>
              <Button
                type="text"
                size="small"
                style={{ color: "green", padding: '4px 8px' }}
                icon={<CheckOutlined />}
                onClick={() => openHandleModal(record, "APPROVED")}
              >
                Duyệt
              </Button>
              <Button
                type="text"
                size="small"
                danger
                style={{ padding: '4px 8px' }}
                icon={<CloseOutlined />}
                onClick={() => openHandleModal(record, "REJECTED")}
              >
                Từ chối
              </Button>
            </>
          ) : (
            <span style={{ color: "#999" }}>Đã xử lý</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          alignItems: 'center',
          justifyContent: 'space-between'
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
        <div style={{ marginLeft: 'auto', color: '#666', fontSize: 13 }}>{pagination.total ? `Tổng: ${pagination.total}` : ''}</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: 12 }}>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          bordered
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.page + 1,
            pageSize: pagination.size,
            total: pagination.total,
            onChange: (p) => setPagination({ ...pagination, page: p - 1 }),
            style: { textAlign: "center", marginTop: 16 },
          }}
          locale={{ emptyText: 'Không có yêu cầu' }}
        />
      </div>

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p><strong>User ID:</strong> {selectedRequest?.userId || '-'}</p>
            <p><strong>Tên người dùng:</strong> {selectedRequest?.userName || '-'}</p>
            <p><strong>Email:</strong> <span style={{ color: '#444' }}>{selectedRequest?.email || '-'}</span></p>
          </div>
          <div>
            <p><strong>Số điện thoại:</strong> {selectedRequest?.phoneNumber || '-'}</p>
            <p><strong>CCCD:</strong> {selectedRequest?.citizenId || '-'}</p>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <p><strong>Lý do yêu cầu:</strong></p>
            <div style={{ background: '#fafafa', padding: 10, borderRadius: 6, color: '#333', maxHeight: 140, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{selectedRequest?.reason || 'Không có'}</div>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: 8, color: '#666' }}>
            Bạn có chắc chắn muốn {handleType === "APPROVED" ? "phê duyệt" : "từ chối"} yêu cầu này?
          </div>
        </div>
      </Modal>
    </div>
  );
}
