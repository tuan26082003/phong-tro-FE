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
  DatePicker,
} from "antd";

import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

const API = "/api/payments";

export default function OwnerPayment() {
  const [payments, setPayments] = useState([]);
  const [bookingOptions, setBookingOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0,
  });

  const [query, setQuery] = useState({
    bookingId: "",
    paymentType: "",
    paymentMethod: "",
    paymentStatus: "",
    paymentDate: "",
    paymentPeriod: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalUpdateOpen, setModalUpdateOpen] = useState(false);
  const [updateId, setUpdateId] = useState(null);

  const [form] = Form.useForm();

  // =====================================================
  // LOG ERROR
  // =====================================================
  const logErr = (err, msgText) => {
    console.error("=== PAYMENT ERROR ===");
    console.error(err);
    toast.error(msgText || err.response?.data?.message || "Lỗi server");
  };

  // =====================================================
  // LOAD PAYMENT LIST
  // =====================================================
  const loadPayments = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
        bookingId: query.bookingId || "",
        paymentType: query.paymentType || "",
        paymentMethod: query.paymentMethod || "",
        paymentStatus: query.paymentStatus || "",
        paymentDate: query.paymentDate || "",
        paymentPeriod: query.paymentPeriod || "",
      };

      const res = await axiosClient.get(API, { params });

      setPayments(res.data.data || []);
      setPagination({ ...pagination, total: res.data.totalElements });
    } catch (err) {
      logErr(err, "Không tải được danh sách thanh toán");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [pagination.page, query]);

  // =====================================================
  // LOAD BOOKING OPTIONS
  // =====================================================
  const loadBookingOptions = async () => {
    try {
      const res = await axiosClient.get("/api/bookings", {
        params: { page: 0, size: 9999 },
      });
      setBookingOptions(res.data.data || []);
    } catch (err) {
      logErr(err, "Không tải được danh sách booking");
    }
  };

  useEffect(() => {
    loadBookingOptions();
  }, []);

  // =====================================================
  // RESET FILTERS
  // =====================================================
  const resetFilters = () => {
    setQuery({
      bookingId: "",
      paymentType: "",
      paymentMethod: "",
      paymentStatus: "",
      paymentDate: "",
      paymentPeriod: "",
    });
    setPagination({ ...pagination, page: 0 });
  };

  // =====================================================
  // OPEN CREATE
  // =====================================================
  const openCreate = () => {
    form.resetFields();
    setModalOpen(true);
  };

  // =====================================================
  // SUBMIT CREATE
  // =====================================================
  const submitCreate = async () => {
    const values = await form.validateFields();

    const payload = {
      bookingId: Number(values.bookingId),
      paymentPeriod: values.paymentPeriod
        ? values.paymentPeriod.format("YYYY-MM-DDT00:00:00")
        : null,
      description: values.description || "",
      paymentType: values.paymentType,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
    };

    try {
      const res = await axiosClient.post(API, payload);

      if (res.data.status >= 400) {
        toast.success(res.data.message);
        setModalOpen(false);
        return;
      }

      toast.success("Tạo khoản thanh toán thành công");
      setModalOpen(false);
      loadPayments();
    } catch (err) {
      logErr(err, "Không thể tạo khoản thanh toán");
    }
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================
  const openUpdateStatus = (id) => {
    setUpdateId(id);
    setModalUpdateOpen(true);
  };

  const submitUpdateStatus = async (status) => {
    try {
      const res = await axiosClient.put(`${API}/${updateId}`, {
        paymentStatus: status,
      });

      if (res.data.status !== 0) throw { response: { data: res.data } };

      toast.success("Cập nhật trạng thái thành công");
      setModalUpdateOpen(false);
      loadPayments();
    } catch (err) {
      logErr(err, "Không cập nhật trạng thái");
    }
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================
  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Booking", dataIndex: "bookingId" },
    { title: "Phòng", dataIndex: "roomId" },
    { title: "Loại", dataIndex: "paymentType" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (v) => v.toLocaleString("vi-VN") + "₫",
    },
    { title: "Phương thức", dataIndex: "paymentMethod" },
    { title: "Trạng thái", dataIndex: "paymentStatus" },
    {
      title: "Ngày thanh toán",
      dataIndex: "paymentDate",
      render: (v) => v && dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    { title: "Chu kỳ", dataIndex: "paymentPeriod", render: (v) => v || "---" },
    {
      title: "Hành động",
      render: (record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "orange" }} />}
            onClick={() => openUpdateStatus(record.id)}
          >
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div>
      <h2>Quản lý thanh toán</h2>

      {/* FILTER BAR */}
      <div
        style={{
          marginBottom: 20,
          display: "grid",
          gridTemplateColumns: "120px 150px 150px 150px 150px 150px auto",
          gap: 10,
        }}
      >
        <Input
          placeholder="Booking ID"
          value={query.bookingId}
          onChange={(e) => setQuery({ ...query, bookingId: e.target.value })}
        />

        <Select
          placeholder="Loại"
          allowClear
          value={query.paymentType || undefined}
          onChange={(v) => setQuery({ ...query, paymentType: v })}
        >
          <Select.Option value="DEPOSIT">DEPOSIT</Select.Option>
          <Select.Option value="MONTHLY">MONTHLY</Select.Option>
          <Select.Option value="ADVANCE">ADVANCE</Select.Option>
          <Select.Option value="OTHER">OTHER</Select.Option>
        </Select>

        <Select
          placeholder="Phương thức"
          allowClear
          value={query.paymentMethod || undefined}
          onChange={(v) => setQuery({ ...query, paymentMethod: v })}
        >
          <Select.Option value="CASH">CASH</Select.Option>
          <Select.Option value="BANKING">BANKING</Select.Option>
          <Select.Option value="MOMO">MOMO</Select.Option>
          <Select.Option value="CREDIT_CARD">CREDIT_CARD</Select.Option>
        </Select>

        <Select
          placeholder="Trạng thái"
          allowClear
          value={query.paymentStatus || undefined}
          onChange={(v) => setQuery({ ...query, paymentStatus: v })}
        >
          <Select.Option value="PENDING">PENDING</Select.Option>
          <Select.Option value="PAID">PAID</Select.Option>
          <Select.Option value="FAILED">FAILED</Select.Option>
          <Select.Option value="REFUND">REFUND</Select.Option>
        </Select>

        <DatePicker
          placeholder="Ngày thanh toán"
          onChange={(v) =>
            setQuery({ ...query, paymentDate: v ? v.toISOString() : "" })
          }
        />

        <DatePicker
          placeholder="Chu kỳ"
          onChange={(v) =>
            setQuery({
              ...query,
              paymentPeriod: v ? v.format("YYYY-MM-DD") : "",
            })
          }
        />

        <Button onClick={resetFilters}>Reset</Button>

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm khoản
        </Button>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={payments}
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

      {/* MODAL CREATE */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitCreate}
        title="Tạo khoản thanh toán"
        width={650}
      >
        <Form layout="vertical" form={form}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            {/* BOOKING SELECT */}
            <Form.Item
              name="bookingId"
              label="Booking"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Chọn booking"
                optionFilterProp="label"
                options={bookingOptions.map((b) => ({
                  value: b.id,
                  label: `#${b.id} - Phòng ${b.roomId} - ${b.startDate} → ${b.endDate}`,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="paymentType"
              label="Loại thanh toán"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="DEPOSIT">DEPOSIT</Select.Option>
                <Select.Option value="MONTHLY">MONTHLY</Select.Option>
                <Select.Option value="ADVANCE">ADVANCE</Select.Option>
                <Select.Option value="OTHER">OTHER</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="Số tiền"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item
              name="paymentMethod"
              label="Phương thức"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="CASH">CASH</Select.Option>
                <Select.Option value="BANKING">BANKING</Select.Option>
                <Select.Option value="MOMO">MOMO</Select.Option>
                <Select.Option value="CREDIT_CARD">CREDIT_CARD</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="paymentPeriod"
              label="Chu kỳ"
              style={{ gridColumn: "1 / 3" }}
            >
              <DatePicker style={{ width: "100%" }} />
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

      {/* MODAL UPDATE STATUS */}
      <Modal
        open={modalUpdateOpen}
        onCancel={() => setModalUpdateOpen(false)}
        title="Cập nhật trạng thái thanh toán"
        footer={null}
      >
        <p>Chọn trạng thái mới:</p>

        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            type="primary"
            onClick={() => submitUpdateStatus("PAID")}
            block
          >
            Đánh dấu đã thanh toán
          </Button>

          <Button danger onClick={() => submitUpdateStatus("FAILED")} block>
            Đánh dấu thất bại
          </Button>

          <Button onClick={() => submitUpdateStatus("REFUND")} block>
            Hoàn tiền
          </Button>

          <Button onClick={() => submitUpdateStatus("PENDING")} block>
            Chờ xử lý
          </Button>
        </Space>
      </Modal>
    </div>
  );
}
