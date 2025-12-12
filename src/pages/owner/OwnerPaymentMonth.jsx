import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Input,
  Button,
  Space,
  Table,
  Tag,
  Modal,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

export default function OwnerCreateMonthlyPayment() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [form] = Form.useForm();

  // =====================================================
  // LOAD ROOMS WITH PAYMENT INFO
  // =====================================================
  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/api/rooms", {
        params: { page: 0, size: 999 },
      });
      const allRooms = res.data.data || [];
      // Chỉ lấy phòng đã thuê (có hợp đồng)
      const rentedRooms = allRooms.filter((r) => r.status === "RENTED");
      
      // Lấy thông tin thanh toán cho từng phòng
      const roomsWithPayment = await Promise.all(
        rentedRooms.map(async (room) => {
          try {
            const paymentRes = await axiosClient.get(`/api/payments/room/${room.id}`);
            return {
              ...room,
              paymentInfo: paymentRes.data.data || null,
            };
          } catch (err) {
            console.error(`Error loading payment for room ${room.id}:`, err);
            return {
              ...room,
              paymentInfo: null,
            };
          }
        })
      );
      
      setRooms(roomsWithPayment);
    } catch (err) {
      console.error("Load rooms error:", err);
      toast.error("Không tải được danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // =====================================================
  // OPEN CREATE MODAL FOR SINGLE ROOM
  // =====================================================
  const handleOpenCreate = (room) => {
    setSelectedRoom(room);
    form.setFieldsValue({
      paymentPeriod: dayjs(),
      amount: room.price || 0,
      paymentMethod: "CASH",
    });
    setModalOpen(true);
  };

  // =====================================================
  // CREATE PAYMENT FOR SINGLE ROOM
  // =====================================================
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        roomId: selectedRoom.id,
        bookingId: values.bookingId || null,
        paymentPeriod: values.paymentPeriod.format("YYYY-MM"),
        description: values.description || `Tiền phòng tháng ${values.paymentPeriod.format("MM/YYYY")} - ${selectedRoom.name}`,
        paymentType: "MONTHLY",
        amount: values.amount,
        paymentMethod: values.paymentMethod,
      };

      console.log("Creating payment with payload:", payload);
      const response = await axiosClient.post("/api/payments", payload);
      console.log("Response:", response);

      // Kiểm tra nếu response có error hoặc status >= 400
      if (response.data?.error || response.data.status >= 400) {
        toast.error(response.data.message || "Tạo thanh toán thất bại");
        return;
      }

      // Chỉ hiển thị success khi response thành công
      toast.success("Tạo thanh toán thành công");
      setModalOpen(false);
      form.resetFields();
      loadRooms();
    } catch (err) {
      console.error("Create payment error:", err);
      console.error("Error response:", err.response);
      // Hiển thị message từ backend hoặc message mặc định
      const errorMessage = err.response?.data?.message || "Tạo thanh toán thất bại";
      toast.error(errorMessage);
      // Không đóng modal và không reset form để user có thể sửa
    }
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Tên phòng",
      dataIndex: "name",
      width: 150,
    },
    {
      title: "Giá phòng",
      dataIndex: "price",
      width: 120,
      render: (val) => (val ? `${val.toLocaleString("vi-VN")}₫` : "—"),
    },
    {
      title: "Diện tích",
      dataIndex: "area",
      width: 100,
      render: (val) => (val ? `${val}m²` : "—"),
    },
    {
      title: "Trạng thái phòng",
      dataIndex: "status",
      width: 120,
      render: (val) => {
        if (val === "RENTED") return <Tag color="red">Đã thuê</Tag>;
        if (val === "AVAILABLE") return <Tag color="green">Trống</Tag>;
        return <Tag>{val}</Tag>;
      },
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentInfo",
      width: 150,
      render: (paymentInfo) => {
        if (!paymentInfo) return <Tag color="default">Chưa có</Tag>;
        const { paymentStatus } = paymentInfo;
        if (paymentStatus === "PAID") return <Tag color="green">Đã thanh toán</Tag>;
        if (paymentStatus === "PENDING") return <Tag color="orange">Chờ thanh toán</Tag>;
        if (paymentStatus === "OVERDUE") return <Tag color="red">Quá hạn</Tag>;
        return <Tag>{paymentStatus}</Tag>;
      },
    },
    {
      title: "Tổng tiền thanh toán",
      dataIndex: "paymentInfo",
      width: 150,
      render: (paymentInfo) => {
        if (!paymentInfo || !paymentInfo.amount) return "—";
        return `${paymentInfo.amount.toLocaleString("vi-VN")}₫`;
      },
    },
    {
      title: "Hành động",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleOpenCreate(record)}
        >
          Tạo thanh toán
        </Button>
      ),
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div style={{ padding: 24 }}>
      <h2>Tạo thanh toán hàng tháng</h2>
     <br></br>

      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 12 }}
        scroll={{ x: 900 }}
      />

      {/* MODAL CREATE PAYMENT */}
      <Modal
        title={`Tạo thanh toán - ${selectedRoom?.name}`}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        okText="Tạo thanh toán"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Tháng thanh toán"
            name="paymentPeriod"
            rules={[{ required: true, message: "Vui lòng chọn tháng" }]}
          >
            <DatePicker picker="month" format="MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              {
                type: "number",
                min: 0,
                message: "Số tiền phải lớn hơn hoặc bằng 0",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              addonAfter="₫"
            />
          </Form.Item>

          <Form.Item
            label="Phương thức thanh toán"
            name="paymentMethod"
            rules={[{ required: true, message: "Vui lòng chọn phương thức" }]}
          >
            <Select>
              <Select.Option value="CASH">Tiền mặt</Select.Option>
              <Select.Option value="BANKING">Chuyển khoản</Select.Option>
              <Select.Option value="MOMO">MoMo</Select.Option>
              <Select.Option value="CREDIT_CASH">Thẻ tín dụng</Select.Option>
        
            </Select>
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả về khoản thanh toán" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
