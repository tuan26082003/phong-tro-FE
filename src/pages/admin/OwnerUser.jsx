import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Select,
} from "antd";

import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const API = "/api/user";

export default function OwnerUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const logAxiosError = (err, customMsg) => {
    console.error("========= AXIOS ERROR =========");

    console.error("REQUEST URL:", err.config?.url);
    console.error("REQUEST METHOD:", err.config?.method);
    console.error("REQUEST HEADERS:", err.config?.headers);
    console.error("REQUEST BODY:", err.config?.data);

    if (err.response) {
      console.error("RESPONSE STATUS:", err.response.status);
      console.error("RESPONSE DATA:", err.response.data);

      message.error(
        customMsg || err.response.data.message || `Lỗi ${err.response.status}`
      );
    } else if (err.request) {
      console.error("NO RESPONSE:", err.request);
      message.error("Không nhận được phản hồi từ server");
    } else {
      console.error("REQUEST ERROR:", err.message);
      message.error(err.message);
    }

    console.error("FULL ERROR:", err);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
      };

      // Gọi API mới: /api/user/role/OWNER
      const res = await axiosClient.get(`${API}/role/OWNER`, { params });

      setUsers(res.data.data || []);

      setPagination({
        ...pagination,
        total: res.data.totalElements,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      logAxiosError(err, "Không tải được danh sách chủ trọ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.page]);

  const openCreate = () => {
    setEditData(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    form.setFieldsValue(record);
    setEditData(record);
    setModalOpen(true);
  };

  const openDelete = (record) => {
    setDeleteData(record);
    setModalDeleteOpen(true);
  };

  const submitForm = async () => {
    const values = await form.validateFields();

    try {
      if (editData) {
        const editReq = await axiosClient.put(`${API}/${editData.id}`, values);

        if (editReq.data.status >= 400) {
          toast.error(editReq.data.message);
          return;
        }

        message.success("Cập nhật người dùng thành công");
      } else {
        const createReq = await axiosClient.post(API, values);

        if (createReq.data.status >= 400) {
          toast.error(createReq.data.message);
          return;
        }

        message.success("Tạo người dùng thành công");
      }

      setModalOpen(false);
      loadUsers();
    } catch (err) {
      logAxiosError(err, "Lỗi khi lưu người dùng");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`/api/owner-requests/${deleteData.id}`);
      message.success("Xoá người dùng thành công");
      setModalDeleteOpen(false);
      loadUsers();
    } catch (err) {
      logAxiosError(err, "Không thể xoá người dùng");
    }
  };



  const columns = [
    {
      title: "Tên",
      dataIndex: "fullName",
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (g) => <Tag color={g === "MALE" ? "blue" : "pink"}>{g}</Tag>,
    },

    {
      title: "Vai trò",
      dataIndex: "roleName",
      render: (r) => <Tag color={r === "OWNER" ? "green" : "blue"}>{r}</Tag>,
    },

    {
      title: "Hành động",
      render: (record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1677ff" }} />}
            onClick={() => openEdit(record)}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => openDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={users}
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
        onOk={submitForm}
        width={700}
        title={editData ? "Cập nhật chủ trọ" : "Thêm chủ trọ"}
      >
        <Form layout="vertical" form={form}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            <Form.Item
              name="fullName"
              label="Họ tên"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="SĐT">
              <Input />
            </Form.Item>

            <Form.Item name="password" label="Mật khẩu">
              <Input.Password />
            </Form.Item>

            <Form.Item name="gender" label="Giới tính">
              <Select>
                <Select.Option value="MALE">Nam</Select.Option>
                <Select.Option value="FEMALE">Nữ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="citizenId" label="CCCD">
              <Input />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
              style={{ gridColumn: "1 / 3" }}
            >
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={modalDeleteOpen}
        onCancel={() => setModalDeleteOpen(false)}
        onOk={handleDelete}
        okText="Xoá"
        okType="danger"
        title="Xoá chủ trọ"
      >
        <p>Bạn chắc chắn muốn xoá chủ trọ:</p>
        <p style={{ fontWeight: "bold" }}>{deleteData?.fullName}</p>
      </Modal>
    </div>
  );
}
