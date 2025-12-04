import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Tag,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
} from "@ant-design/icons";

import axiosClient from "../../api/axiosClient";

const API = "/api/room-services";

export default function OwnerRoomServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0,
    totalPages: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const [modalAssignOpen, setModalAssignOpen] = useState(false);
  const [assignRoomId, setAssignRoomId] = useState(null);
  const [assignList, setAssignList] = useState([]);
  const [allRooms, setAllRooms] = useState([]);

  const loadServices = async () => {
    try {
      setLoading(true);

      const res = await axiosClient.get(
        `${API}?page=${pagination.page}&size=${pagination.size}`
      );

      const d = res.data;

      setServices(d.data || []);

      setPagination({
        ...pagination,
        page: d.pageNumber,
        size: d.pageSize,
        total: d.totalElements,
        totalPages: d.totalPages,
      });
    } catch {
      message.error("Không tải được danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignList = async (roomId) => {
    try {
      const res = await axiosClient.get(
        `/api/room-services/assign/room/${roomId}`
      );
      setAssignList(res.data.data || []);
    } catch {
      message.error("Không tải được danh sách dịch vụ của phòng");
    }
  };

  const loadRooms = async () => {
    try {
      const res = await axiosClient.get("/api/rooms?page=0&size=999");
      setAllRooms(res.data.data || []);
    } catch {
      message.error("Không tải được danh sách phòng");
    }
  };

  useEffect(() => {
    loadServices();
    loadRooms();
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

  const openAssignModal = () => {
    setAssignRoomId(null);
    setAssignList([]);
    setModalAssignOpen(true);
  };

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
      loadServices();
    } catch {
      message.error("Lỗi khi lưu dịch vụ");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`${API}/${deleteData.id}`);
      message.success("Đã xoá");
      setModalDeleteOpen(false);
      loadServices();
    } catch {
      message.error("Không thể xoá");
    }
  };

  const assignService = async (serviceId) => {
    try {
      await axiosClient.post(`/api/room-services/assign`, {
        serviceId,
        roomId: assignRoomId,
      });

      message.success("Đã gán dịch vụ");

      loadAssignList(assignRoomId);
    } catch {
      message.error("Không thể gán dịch vụ");
    }
  };

  const unassignService = async (assignId) => {
    try {
      await axiosClient.delete(`/api/room-services/assign/${assignId}`);
      message.success("Đã gỡ dịch vụ");
      loadAssignList(assignRoomId);
    } catch {
      message.error("Không thể gỡ dịch vụ");
    }
  };

  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (v) => v.toLocaleString("vi-VN") + "₫",
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

          <Button
            type="text"
            icon={<LinkOutlined style={{ color: "orange" }} />}
            onClick={() => openAssignModal(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm dịch vụ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={services}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (p) => setPagination({ ...pagination, page: p - 1 }),
        }}
        bordered
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitForm}
        title={editData ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
        width={600}
      >
        <Form layout="vertical" form={form}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <Form.Item
              name="name"
              label="Tên dịch vụ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
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
        title="Xoá dịch vụ"
      >
        <p>Bạn chắc chắn muốn xoá dịch vụ:</p>
        <p style={{ fontWeight: "bold" }}>{deleteData?.name}</p>
      </Modal>

      <Modal
        open={modalAssignOpen}
        onCancel={() => setModalAssignOpen(false)}
        title="Gán dịch vụ cho phòng"
        footer={null}
        width={650}
      >
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Chọn phòng"
            style={{ width: "100%" }}
            onChange={(v) => {
              setAssignRoomId(v);
              loadAssignList(v);
            }}
          >
            {allRooms.map((r) => (
              <Select.Option key={r.id} value={r.id}>
                {r.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {assignRoomId && (
          <>
            <h4>Dịch vụ đang gán:</h4>

            {assignList.length === 0 && <p>Không có dịch vụ nào</p>}

            {assignList.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: 8,
                  border: "1px solid #ddd",
                  marginBottom: 10,
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {s.serviceName} – {s.price.toLocaleString("vi-VN")}₫
                </span>

                <Button danger onClick={() => unassignService(s.id)}>
                  Xoá
                </Button>
              </div>
            ))}

            <h4>Gán thêm dịch vụ:</h4>

            <div>
              {services.map((svc) => (
                <Tag
                  key={svc.id}
                  color="blue"
                  style={{ cursor: "pointer", marginBottom: 8 }}
                  onClick={() => assignService(svc.id)}
                >
                  {svc.name}
                </Tag>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
