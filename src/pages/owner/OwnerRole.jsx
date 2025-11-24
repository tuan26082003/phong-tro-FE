import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message } from "antd";

import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import axiosClient from "../../api/axiosClient";

const API = "/api/role";

export default function OwnerRole() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  // =========================================
  // LOG AXIOS ERROR FULL DETAIL
  // =========================================
  const logAxiosError = (err, customMsg) => {
    console.error("========= AXIOS ERROR =========");

    console.error("REQUEST URL:", err.config?.url);
    console.error("REQUEST METHOD:", err.config?.method);
    console.error("REQUEST HEADERS:", err.config?.headers);
    console.error("REQUEST BODY:", err.config?.data);

    if (err.response) {
      console.error("RESPONSE STATUS:", err.response.status);
      console.error("RESPONSE HEADERS:", err.response.headers);
      console.error("RESPONSE DATA:", err.response.data);

      message.error(
        customMsg || err.response.data.message || `Lỗi ${err.response.status}`
      );
    } else if (err.request) {
      console.error("NO RESPONSE RECEIVED:", err.request);
      message.error("Không nhận được phản hồi từ server");
    } else {
      console.error("REQUEST SETUP ERROR:", err.message);
      message.error(err.message || "Lỗi request FE");
    }

    console.error("FULL ERROR OBJECT:", err);
  };

  // =========================================
  // LOAD ROLES
  // =========================================
  const loadRoles = async () => {
    try {
      setLoading(true);

      const res = await axiosClient.get(API);
      setRoles(res.data.data || []);
    } catch (err) {
      logAxiosError(err, "Không tải được danh sách vai trò");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // =========================================
  // CREATE
  // =========================================
  const openCreate = () => {
    setEditData(null);
    form.resetFields();
    setModalOpen(true);
  };

  // =========================================
  // EDIT
  // =========================================
  const openEdit = (record) => {
    form.setFieldsValue(record);
    setEditData(record);
    setModalOpen(true);
  };

  // =========================================
  // DELETE POPUP
  // =========================================
  const openDelete = (record) => {
    setDeleteData(record);
    setModalDeleteOpen(true);
  };

  // =========================================
  // SUBMIT CREATE/UPDATE
  // =========================================
  const submitForm = async () => {
    const values = await form.validateFields();

    try {
      if (editData) {
        await axiosClient.put(`${API}/${editData.id}`, values);
        message.success("Cập nhật thành công");
      } else {
        await axiosClient.post(API, values);
        message.success("Tạo mới thành công");
      }

      setModalOpen(false);
      loadRoles();
    } catch (err) {
      logAxiosError(err, "Lỗi khi lưu vai trò");
    }
  };

  // =========================================
  // DELETE ROLE
  // =========================================
  const handleDelete = async () => {
    try {
      await axiosClient.delete(`${API}/${deleteData.id}`);
      message.success("Đã xoá");
      setModalDeleteOpen(false);
      loadRoles();
    } catch (err) {
      logAxiosError(err, "Không thể xoá vai trò");
    }
  };

  // =========================================
  // TABLE COLUMNS
  // =========================================
  const columns = [
    {
      title: "Tên vai trò",
      dataIndex: "name",
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
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

  // =========================================
  // RENDER UI
  // =========================================
  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm vai trò
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitForm}
        title={editData ? "Cập nhật vai trò" : "Thêm vai trò"}
        width={600}
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
              name="name"
              label="Tên vai trò"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
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
        title="Xoá vai trò"
      >
        <p>Bạn chắc chắn muốn xoá vai trò:</p>
        <p style={{ fontWeight: "bold" }}>{deleteData?.name}</p>
      </Modal>
    </div>
  );
}
