import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Tag,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const API = "/api/rooms";

export default function OwnerRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0,
  });

  const [query, setQuery] = useState({
    q: "",
    sort: "asc",
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
  };

  const loadRooms = async () => {
    try {
      setLoading(true);

      const params = {
        q: query.q,
        page: pagination.page,
        size: pagination.size,
        sort: query.sort,
      };

      const res = await axiosClient.get(API, { params });

      setRooms(res.data.data || []);

      setPagination({
        ...pagination,
        total: res.data.totalElements,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      logAxiosError(err, "Không tải được danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [pagination.page, query]);

  const openCreate = () => {
    setEditData(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    form.setFieldsValue({
      ...record,
      images: record.images?.join(", ") || "",
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

    const payload = {
      ...values,
      images: values.images
        ? values.images.split(",").map((i) => i.trim())
        : [],
    };

    try {
      if (editData) {
        const editReq = await axiosClient.put(`${API}/${editData.id}`, payload);

        if (editReq.data.status >= 400) {
          toast.error(editReq.data.message);
          return;
        }

        message.success("Cập nhật phòng thành công");
      } else {
        const createReq = await axiosClient.post(API, payload);

        if (createReq.data.status >= 400) {
          toast.error(createReq.data.message);
          return;
        }

        message.success("Thêm phòng thành công");
      }

      setModalOpen(false);
      loadRooms();
    } catch (err) {
      logAxiosError(err, "Lỗi khi lưu phòng");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`${API}/${deleteData.id}`);
      message.success("Xóa thành công");
      setModalDeleteOpen(false);
      loadRooms();
    } catch (err) {
      logAxiosError(err, "Không thể xoá phòng");
    }
  };

  const columns = [
    {
      title: "Tên phòng",
      dataIndex: "name",
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (v) => v.toLocaleString("vi-VN") + "₫",
    },
    {
      title: "Diện tích",
      dataIndex: "area",
      render: (v) => `${v} m²`,
    },
    {
      title: "Số người",
      dataIndex: "capacity",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => (
        <Tag
          color={
            s === "AVAILABLE" ? "green" : s === "RENTED" ? "blue" : "orange"
          }
        >
          {s}
        </Tag>
      ),
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
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <Input
          placeholder="Tìm phòng..."
          value={query.q}
          prefix={<SearchOutlined />}
          onChange={(e) => setQuery({ ...query, q: e.target.value })}
          style={{ width: 260 }}
        />

        <Select
          value={query.sort}
          onChange={(v) => setQuery({ ...query, sort: v })}
          style={{ width: 130 }}
        >
          <Select.Option value="asc">ASC</Select.Option>
          <Select.Option value="desc">DESC</Select.Option>
        </Select>

        <div style={{ flex: 1 }} />

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm phòng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="id"
        bordered
        loading={loading}
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
        width={700}
        title={editData ? "Cập nhật phòng" : "Thêm phòng"}
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
              label="Tên phòng"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="images" label="Ảnh (dấu phẩy)">
              <Input />
            </Form.Item>

            <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item name="deposit" label="Đặt cọc">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item name="area" label="Diện tích">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item name="capacity" label="Số người">
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>

            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Select.Option value="AVAILABLE">AVAILABLE</Select.Option>
                <Select.Option value="RENTED">RENTED</Select.Option>
                <Select.Option value="MAINTENANCE">MAINTENANCE</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={modalDeleteOpen}
        onCancel={() => setModalDeleteOpen(false)}
        onOk={handleDelete}
        okText="Xoá"
        okType="danger"
        title="Xoá phòng"
      >
        <p>Bạn có chắc muốn xoá phòng:</p>
        <p style={{ fontWeight: "bold" }}>{deleteData?.name}</p>
      </Modal>
    </div>
  );
}
