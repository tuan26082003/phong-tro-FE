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
  Upload,
  Tag,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import axiosClient from "../../api/axiosClient";

const API = "/api/rooms";

export default function AdminRoom() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0,
    totalPages: 0,
  });

  const [query, setQuery] = useState({ q: "", sort: "asc", type: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const [fileList, setFileList] = useState([]);

  const logAxiosError = (err, msg) => {
    if (err?.response) {
      message.error(msg || err.response.data.message || "Lỗi");
    } else {
      message.error("Không thể kết nối server");
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

      // Thêm type vào params nếu có
      if (query.type) {
        params.type = query.type;
      }

      const res = await axiosClient.get(API, { params });

      console.log("API Response:", res.data);
      console.log("First room:", res.data.data?.[0]);

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
    setFileList([]);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditData(record);
    setFileList([]); // luôn yêu cầu upload lại file vì backend yêu cầu files bắt buộc
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      price: record.price,
      deposit: record.deposit,
      area: record.area,
      capacity: record.capacity,
      address: record.address,
      description: record.description,
      facilities: record.facilities || [],
    });
    setModalOpen(true);
  };

  const openDelete = (record) => {
    setDeleteData(record);
    setModalDeleteOpen(true);
  };

  const buildMultipart = (values) => {
    const fd = new FormData();

    // remove status (backend không cho phép)
    delete values.status;

    fd.append("data", JSON.stringify(values));

    fileList.forEach((f) => {
      fd.append("files", f.originFileObj);
    });

    return fd;
  };

  const submitForm = async () => {
    const values = await form.validateFields();
    const payload = buildMultipart(values);

    try {
      if (editData) {
        await axiosClient.put(`${API}/${editData.id}`, payload);
        message.success("Cập nhật phòng thành công");
      } else {
        await axiosClient.post(API, payload);
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
      title: "ID Chủ trọ",
      dataIndex: "ownerId",
      render: (id) => id || <span style={{ color: "#999" }}>N/A</span>,
    },
    {
      title: "Tên Chủ trọ",
      dataIndex: "ownerName",
      render: (name) => name || <span style={{ color: "#999" }}>N/A</span>,
    },
    {
      title: "Loại phòng",
      dataIndex: "type",
      render: (v, record) => {
        console.log("Type value:", v, "Full record:", record);
        const typeMap = {
          ROOM: "Phòng trọ",
          HOUSE: "Nhà nguyên căn",
          APARTMENT: "Căn hộ",
        };
        
        // Xử lý cả trường hợp v là string hoặc object
        const typeValue = typeof v === 'object' && v !== null ? v.name || v.value : v;
        
        return typeValue ? (
          typeMap[typeValue] || typeValue
        ) : (
          <span style={{ color: "#999" }}>Chưa set</span>
        );
      },
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
      title: "Tiện ích",
      dataIndex: "facilities",
      render: (facilities) => (
        <>
          {facilities && facilities.length > 0 ? (
            facilities.map((f, idx) => (
              <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
                {f}
              </Tag>
            ))
          ) : (
            <span style={{ color: "#999" }}>Chưa có</span>
          )}
        </>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
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
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Input
          placeholder="Tìm phòng..."
          value={query.q}
          prefix={<SearchOutlined />}
          onChange={(e) => setQuery({ ...query, q: e.target.value })}
          style={{ width: 260 }}
        />

        <Select
          placeholder="Loại phòng"
          allowClear
          value={query.type || undefined}
          onChange={(v) => setQuery({ ...query, type: v || "" })}
          style={{ width: 180 }}
        >
          <Select.Option value="ROOM">Phòng trọ</Select.Option>
          <Select.Option value="HOUSE">Nhà nguyên căn</Select.Option>
          <Select.Option value="APARTMENT">Căn hộ</Select.Option>
        </Select>

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
          style: { textAlign: "center", marginTop: 16 },
        }}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitForm}
        width={750}
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

            <Form.Item
              name="type"
              label="Loại phòng"
              rules={[{ required: true, message: "Vui lòng chọn loại phòng" }]}
            >
              <Select placeholder="Chọn loại phòng">
                <Select.Option value="ROOM">Phòng trọ</Select.Option>
                <Select.Option value="HOUSE">Nhà nguyên căn</Select.Option>
                <Select.Option value="APARTMENT">Căn hộ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Ảnh (bắt buộc)">
              <Upload
                multiple
                beforeUpload={() => false}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>

            <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="deposit" label="Đặt cọc">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="area" label="Diện tích">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="capacity" label="Số người">
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="facilities"
            label="Tiện ích"
            tooltip="Nhấn Enter sau mỗi tiện ích"
          >
            <Select
              mode="tags"
              placeholder="Nhập tiện ích (VD: Wifi, Điều hòa, Nóng lạnh...)"
              style={{ width: "100%" }}
              tokenSeparators={[',']}
            />
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
