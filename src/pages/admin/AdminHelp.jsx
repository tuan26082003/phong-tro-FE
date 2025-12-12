import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  Form,
  Card,
  Descriptions,
  Badge,
  Spin,
  Select,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const { TextArea } = Input;
const { Option } = Select;

export default function AdminHelp() {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadContacts();
  }, [pagination.page, searchQuery]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/api/help", {
        params: {
          q: searchQuery || undefined,
          page: pagination.page,
          size: pagination.size,
        },
      });

      setContacts(res.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.total || 0,
      }));
    } catch (err) {
      console.error("Load contacts error:", err);
      toast.error("Không thể tải danh sách liên hệ");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleViewDetail = async (id) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/api/help/${id}`);
      setSelectedContact(res.data.data);
      setViewModalVisible(true);
    } catch (err) {
      console.error("View contact error:", err);
      toast.error("Không thể xem chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (record) => {
    setSelectedContact(record);
    form.setFieldsValue({
      fullName: record.fullName,
      phone: record.phone,
      email: record.email,
      subject: record.subject,
      message: record.message,
      status: record.status,
      response: record.response || "",
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const res = await axiosClient.put(`/api/help/${selectedContact.id}`, values);
      toast.success(res.data.message || "Cập nhật thành công!");
      setEditModalVisible(false);
      form.resetFields();
      loadContacts();
    } catch (err) {
      console.error("Update contact error:", err);
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      NEW: { color: "blue", icon: <ClockCircleOutlined />, text: "Mới" },
      APPROVED: { color: "green", icon: <CheckCircleOutlined />, text: "Đã duyệt" },
      REJECTED: { color: "red", icon: <CloseCircleOutlined />, text: "Từ chối" },
    };

    const config = statusConfig[status] || statusConfig.NEW;
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 120,
    },
    {
      title: "Chủ đề",
      dataIndex: "subject",
      key: "subject",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.id)}
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEdit(record)}
          >
            Xử lý
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <span style={{ fontSize: 20, fontWeight: 600 }}>
            Quản lý Liên hệ & Hỗ trợ
          </span>
        }
        extra={
          <Input.Search
            placeholder="Tìm theo tên, email, số điện thoại..."
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={contacts}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.page + 1,
            pageSize: pagination.size,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} liên hệ`,
            onChange: (page) => setPagination((prev) => ({ ...prev, page: page - 1 })),
          }}
        />
      </Card>

      {/* View Detail Modal */}
      <Modal
        title="Chi tiết liên hệ"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedContact && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{selectedContact.id}</Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {selectedContact.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{selectedContact.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedContact.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Chủ đề">
              {selectedContact.subject}
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              <div style={{ whiteSpace: "pre-wrap" }}>{selectedContact.message}</div>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedContact.status)}
            </Descriptions.Item>
        
            <Descriptions.Item label="Ngày gửi">
              {new Date(selectedContact.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Xử lý liên hệ"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="Họ và tên" name="fullName">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Chủ đề" name="subject">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Nội dung" name="message">
            <TextArea rows={4} disabled />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="NEW">Mới</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="REJECTED">Từ chối</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
