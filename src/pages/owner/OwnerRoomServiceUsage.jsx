import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

import { toast } from "react-toastify";

const API = "/api/room-service-usages";

export default function OwnerRoomServiceUsage() {
  const [items, setItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0,
  });

  const [query, setQuery] = useState({
    month: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const loadItems = async () => {
    try {
      setLoading(true);

      const params = {
        month: query.month || "",
        page: pagination.page,
        size: pagination.size,
      };

      const res = await axiosClient.get(API, { params });
      const data = res.data;

      setItems(data.data || []);
      setPagination({
        ...pagination,
        total: data.totalElements,
        totalPages: data.totalPages,
      });
    } catch {
      message.error("Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const res = await axiosClient.get("/api/rooms", {
        params: { page: 0, size: 9999 },
      });
      setRooms(res.data.data || []);
    } catch {}
  };

  const loadServices = async () => {
    try {
      const res = await axiosClient.get("/api/room-services", {
        params: { page: 0, size: 9999 },
      });
      setServices(res.data.data || []);
    } catch {}
  };

  useEffect(() => {
    loadItems();
  }, [pagination.page, query]);

  useEffect(() => {
    loadRooms();
    loadServices();
  }, []);

  const resetFilters = () => {
    setQuery({ month: "" });
    setPagination({ ...pagination, page: 0 });
  };

  const openCreate = () => {
    setEditData(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    form.setFieldsValue({
      ...record,
      month: record.month ? dayjs(record.month, "YYYY-MM") : null,
      roomId: record.roomId,
      roomServiceId: record.roomServiceId,
    });
    setEditData(record);
    setModalOpen(true);
  };

  const openDelete = (record) => {
    setDeleteData(record);
    setModalDeleteOpen(true);
  };

  const submitForm = async () => {
    const values = await form.validateFields();

    // normalize month and compute derived fields
    const vals = { ...values };
    vals.month = values.month ? values.month.format("YYYY-MM") : null;

    // compute quantityUsed for METERED if not provided
    let quantityUsed = vals.quantityUsed ?? null;
    if ((vals.type || '').toUpperCase() === 'METERED') {
      const oldV = vals.quantityOld ?? null;
      const newV = vals.quantityNew ?? null;
      if (oldV != null && newV != null) {
        quantityUsed = Number(newV) - Number(oldV);
      } else if (quantityUsed == null) {
        quantityUsed = 0;
      }
    } else {
      quantityUsed = vals.quantityUsed ?? 1;
    }

    // determine pricePerUnit from selected service if not provided
    const svc = services.find(s => String(s.id) === String(vals.roomServiceId));
    const pricePerUnit = vals.pricePerUnit != null ? vals.pricePerUnit : (svc?.pricePerUnit ?? svc?.price ?? 0);

    const payload = {
      ...vals,
      quantityUsed,
      pricePerUnit,
    };

    try {
      if (editData) {
        const editReq = await axiosClient.put(`${API}/${editData.id}`, payload);

        if (editReq.data.status >= 400) {
          toast.error(editReq.data.message);
          return;
        }

        message.success("Cập nhật thành công");
      } else {
        const createReq = await axiosClient.post(API, payload);
        if (createReq.data.status >= 400) {
          toast.error(createReq.data.message);
          return;
        }
        message.success("Thêm mới thành công");
      }

      setModalOpen(false);
      loadItems();
    } catch {
      message.error("Lỗi khi lưu dữ liệu");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`${API}/${deleteData.id}`);
      message.success("Đã xoá");
      setModalDeleteOpen(false);
      loadItems();
    } catch {
      message.error("Không thể xoá");
    }
  };

  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
    },
    {
        title: "Loại",
        dataIndex: "type",
        render: (t) => (
          <Tag color={t === "METERED" ? "blue" : "green"}>
            {(t || '').toUpperCase() === 'METERED' ? 'Theo công tơ' : 'Cố định'}
          </Tag>
        ),
    },
    {
      title: "Phòng",
      dataIndex: "roomName",
    },
    {
      title: "Dịch vụ",
      dataIndex: "roomServiceName",
    },
    {
      title: "Tháng",
      dataIndex: "month",
    },
    {
      title: "Cũ",
      dataIndex: "quantityOld",
    },
    {
      title: "Mới",
      dataIndex: "quantityNew",
    },
    {
      title: "Đã dùng",
      key: "quantityUsed",
      render: (v, r) => {
        if (v != null) return v;
        if (r?.quantityUsed != null) return Number(r.quantityUsed);
        return 0;
      }
    },
    
    {
      title: "Tiền",
      dataIndex: "totalPrice",
      render: (v) => {
        const n = v != null ? Number(v) : null;
        return n == null ? "—" : `${n.toLocaleString("vi-VN")}₫`;
      },
    },
    {
      title: "Hành động",
      render: (_, record) => (
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
      <div
        style={{
          marginBottom: 20,
          display: "grid",
          gridTemplateColumns: "200px 60px 140px",
          gap: 12,
        }}
      >
        <DatePicker
          picker="month"
          placeholder="Tháng..."
          style={{ width: "100%" }}
          value={query.month ? dayjs(query.month, "YYYY-MM") : null}
          onChange={(v) =>
            setQuery({ ...query, month: v ? v.format("YYYY-MM") : "" })
          }
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={resetFilters}
          style={{ width: "100%" }}
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ width: "100%" }}
          onClick={openCreate}
        >
          Thêm
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{
          current: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (p) => setPagination({ ...pagination, page: p - 1 }),
        }}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitForm}
        width={740}
        title={editData ? "Cập nhật sử dụng dịch vụ" : "Thêm sử dụng dịch vụ"}
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
              label="Tên dịch vụ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="METERED">Theo công tơ</Select.Option>
                <Select.Option value="FIXED">Cố định</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="quantityOld" label="Chỉ số cũ">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item name="quantityNew" label="Chỉ số mới">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            {/* Giá sẽ lấy từ cấu hình dịch vụ, không cần nhập tay */}

            <Form.Item name="month" label="Tháng">
              <DatePicker picker="month" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="roomId" label="Phòng" rules={[{ required: true }]}>
              <Select placeholder="Chọn phòng">
                {rooms.map((r) => (
                  <Select.Option key={r.id} value={r.id}>
                    {r.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="roomServiceId"
              label="Dịch vụ"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn dịch vụ">
                {services.map((s) => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.name}
                  </Select.Option>
                ))}
              </Select>
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
        title="Xoá bản ghi"
      >
        <p>Bạn có chắc muốn xoá bản ghi:</p>
        <p style={{ fontWeight: "bold", fontSize: 16 }}>{deleteData?.name}</p>
      </Modal>
    </div>
  );
}
