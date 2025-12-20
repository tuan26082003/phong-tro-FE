// src/pages/owner/OwnerBooking.jsx

import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Tag, Select, message, DatePicker, TimePicker } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const API = "/api/bookings";

export default function OwnerBooking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);

  const [form] = Form.useForm();

  // LOG ERROR
  const logAxiosError = (err, msg) => {
    console.error("=== ERROR ===", err);
    toast.error(msg || err.response?.data?.message || "Lỗi không xác định");
  };

  // LOAD BOOKINGS
  const loadBookings = async () => {
    try {
      setLoading(true);

      const res = await axiosClient.get(API, {
        params: {
          page: pagination.page,
          size: pagination.size,
        },
      });

      setBookings(res.data.data || []);
      setPagination((prev) => ({ ...prev, total: res.data.totalElements }));
    } catch (err) {
      logAxiosError(err, "Không tải được danh sách booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [pagination.page]);

  // OPEN EDIT
  const openEdit = async (record) => {
    try {
      const res = await axiosClient.get(`${API}/${record.id}`);
      const data = res.data.data;

      setEditData(data);
      form.setFieldsValue({
        status: data.status,
        visitDate: data.appointmentDate ? dayjs(data.appointmentDate) : null,
        visitTime: data.hourDate ? dayjs(data.hourDate, "HH:mm") : null,
      });

      setModalOpen(true);
    } catch (err) {
      logAxiosError(err, "Không tải được chi tiết booking");
    }
  };

  // SUBMIT EDIT
  const submitEdit = async () => {
    try {
      const values = await form.validateFields();

      // Prepare payload; include visit date/time when confirming
      const payload = {
        status: values.status,
      };

      if (values.status === "CONFIRMED") {
        payload.appointmentDate = values.visitDate ? values.visitDate.format("YYYY-MM-DD") : null;
        payload.hourDate = values.visitTime ? values.visitTime.format("HH:mm") : null;
      }

      const edit = await axiosClient.put(`${API}/${editData.id}`, payload);

      if (edit.data.status >= 400) {
        toast.success(edit.data.message);
        setModalOpen(false);
        return;
      }

      message.success("Cập nhật trạng thái thành công");
      // Show toast notification on screen as well
      toast.success(edit.data?.message || "Cập nhật trạng thái thành công");
      setModalOpen(false);
      loadBookings();
    } catch (err) {
      // Validation errors from AntD Form have `errorFields`; ignore them silently
      if (err && err.errorFields) return;

      logAxiosError(err, "Không thể cập nhật trạng thái");
    }
  };

  // OPEN DELETE CONFIRM
  const openDelete = (record) => {
    setDeleteData(record);
    setModalDeleteOpen(true);
  };

  // DELETE BOOKING
  const handleDelete = async () => {
    try {
      await axiosClient.delete(`${API}/${deleteData.id}`);
      toast.success("Xóa booking thành công");

      setModalDeleteOpen(false);
      loadBookings();
    } catch (err) {
      logAxiosError(err, "Không thể xoá booking");
    }
  };

  // STATUS TAG — MATCH BACKEND ENUM
  const statusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="gold">Chờ duyệt</Tag>;

      case "CONFIRMED":
        return <Tag color="blue">Đã xác nhận</Tag>;

      case "COMPLETED":
        return <Tag color="green">Hoàn thành</Tag>;

      case "CANCELLED":
        return <Tag color="red">Đã hủy</Tag>;

      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: "Phòng",
      dataIndex: "roomName",
      render: (t) => <span>{t}</span>,
    },
    {
      title: "Người đặt",
      dataIndex: "nameUser",
      render: (t) => <span>{t}</span>,
    },
 
    {
      title: "Giá",
      dataIndex: "totalPrice",
      render: (t) => <strong>{t.toLocaleString("vi-VN")}₫</strong>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: statusTag,
    },
    {
      title: "Hành động",
      render: (record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
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
      <h2 style={{ marginBottom: 16 }}>Quản lý Booking</h2>

      <Table
        bordered
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={bookings}
        pagination={{
          current: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (p) => setPagination({ ...pagination, page: p - 1 }),
          style: { textAlign: "center", marginTop: 16 },
        }}
      />

      {/* MODAL EDIT */}
      <Modal
        title={`Booking #${editData?.id}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitEdit}
      >
        <p>
          <strong>Phòng:</strong> {editData?.roomName}
        </p>
        <p>
          <strong>Người đặt:</strong> {editData?.nameUser} 
        </p>
       

        <Form form={form} layout="vertical" style={{ marginTop: 18 }}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="PENDING">Chờ duyệt</Select.Option>
              <Select.Option value="CONFIRMED">Xác nhận</Select.Option>
              <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
              <Select.Option value="CANCELLED">Hủy</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="visitDate"
            label="Ngày đến xem"
            rules={[
              {
                validator: (_, value) => {
                  if (form.getFieldValue("status") === "CONFIRMED" && !value) {
                    return Promise.reject(new Error("Vui lòng chọn ngày đến xem"));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="visitTime"
            label="Giờ đến (h)"
            rules={[
              {
                validator: (_, value) => {
                  if (form.getFieldValue("status") === "CONFIRMED" && !value) {
                    return Promise.reject(new Error("Vui lòng chọn giờ đến"));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL DELETE */}
      <Modal
        open={modalDeleteOpen}
        onCancel={() => setModalDeleteOpen(false)}
        onOk={handleDelete}
        okType="danger"
        okText="Xóa"
        title="Xóa booking"
      >
        <p>Bạn chắc chắn muốn xóa booking?</p>
        <p>
          <strong>Booking #{deleteData?.id}</strong>
        </p>
      </Modal>
    </div>
  );
}
