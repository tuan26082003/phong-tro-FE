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
  const [services, setServices] = useState([]);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageForm] = Form.useForm();
  const [usageList, setUsageList] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(null);
  const [usageType, setUsageType] = useState(null);

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

  useEffect(() => {
    // load available services for adding usage
    const loadServices = async () => {
      try {
        const res = await axiosClient.get("/api/room-services", {
          params: { page: 0, size: 9999 },
        });
        setServices(res.data.data || []);
      } catch (err) {
        console.error("Load services error", err);
      }
    };

    loadServices();
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
  // ADD SERVICE USAGE FOR ROOM
  // =====================================================
  const openAddUsage = (room) => {
    setSelectedRoom(room);
    usageForm.resetFields();
    usageForm.setFieldsValue({
      month: dayjs(),
      pricePerUnit: 0,
    });
    setUsageModalOpen(true);
  };

  const submitUsage = async () => {
    try {
      const vals = await usageForm.validateFields();
      // Compute quantityUsed for METERED services if not provided
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
        // FIXED: default to provided or 1
        quantityUsed = vals.quantityUsed ?? 1;
      }

      const payload = {
        roomId: selectedRoom.id,
        roomServiceId: vals.roomServiceId,
        type: vals.type || undefined,
        month: vals.month ? vals.month.format("YYYY-MM") : null,
        quantityOld: vals.quantityOld ?? null,
        quantityNew: vals.quantityNew ?? null,
        quantityUsed: quantityUsed,
        // if price not provided in form (we removed the input), try service default
        pricePerUnit: (vals.pricePerUnit ?? (services.find(s => String(s.id) === String(vals.roomServiceId))?.pricePerUnit) ?? (services.find(s => String(s.id) === String(vals.roomServiceId))?.price) ?? 0),
        name: vals.name || undefined,
      };

      const res = await axiosClient.post("/api/room-service-usages", payload);
      if (res.data?.status >= 400) {
        toast.error(res.data.message || "Không thể thêm số liệu dịch vụ");
        return;
      }

      toast.success("Thêm số liệu dịch vụ thành công");
      setUsageModalOpen(false);
      // reload usages and rooms for the month we just created
      await loadUsagesForRoom(selectedRoom.id, payload.month);
      loadRooms();
    } catch (err) {
      console.error("Submit usage error", err);
      toast.error(err?.response?.data?.message || "Lỗi khi thêm số liệu dịch vụ");
    }
  };

  const loadUsagesForRoom = async (roomId, month) => {
    try {
      // If month not provided, try to infer from selectedRoom.paymentInfo.paymentPeriod, else use current month
      const m = month || selectedRoom?.paymentInfo?.paymentPeriod || dayjs().format('YYYY-MM');
      const res = await axiosClient.get(`/api/room-service-usages/room/${roomId}`, {
        params: { month: m },
      });
      const data = res.data?.data || [];
      const normalized = (data || []).map((it) => ({
        id: it.id,
        name: it.name,
        type: it.type,
        quantityOld: it.quantityOld,
        quantityNew: it.quantityNew,
        quantityUsed: it.quantityUsed,
        pricePerUnit: it.pricePerUnit != null ? Number(it.pricePerUnit) : null,
        totalPrice: it.totalPrice != null ? Number(it.totalPrice) : null,
        month: it.month,
        usedAt: it.usedAt,
        roomId: it.roomId,
        roomName: it.roomName,
        roomServiceId: it.roomServiceId,
        roomServiceName: it.roomServiceName,
      }));

      setUsageList(normalized);
    } catch (err) {
      console.error("Load usages error", err);
      setUsageList([]);
    }
  };

  const openViewDetails = async (room) => {
    setSelectedRoom(room);
    // prefer payment period from room if available
    const month = room?.paymentInfo?.paymentPeriod || dayjs().format('YYYY-MM');
    setViewMonth(dayjs(month));
    await loadUsagesForRoom(room.id, month);
    setViewModalOpen(true);
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
        <Space>
          <Button type="default" size="small" onClick={() => openAddUsage(record)}>
            Thêm số liệu dịch vụ
          </Button>

          <Button type="link" size="small" onClick={() => openViewDetails(record)}>
            Xem chi tiết
          </Button>

          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleOpenCreate(record)}
          >
            Tạo thanh toán
          </Button>
        </Space>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {rooms.length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#888' }}>
              Không có phòng đã thuê để tạo thanh toán.
            </div>
          )}

          {rooms.map((room) => (
            <Card
              key={room.id}
              hoverable
              bodyStyle={{ padding: 16 }}
              style={{ borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#222', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</div>
                  <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>{room.address || '—'}</div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ color: '#d4380d', fontWeight: 700, fontSize: 16 }}>{room.price?.toLocaleString('vi-VN')}₫</div>
                    <div style={{ color: '#999', fontSize: 12 }}>/tháng</div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                    <Tag color={room.status === 'RENTED' ? 'red' : room.status === 'AVAILABLE' ? 'green' : 'default'}>{room.status === 'RENTED' ? 'Đã thuê' : room.status}</Tag>
                    {room.paymentInfo ? (
                      <Tag color={room.paymentInfo.paymentStatus === 'PAID' ? 'green' : room.paymentInfo.paymentStatus === 'OVERDUE' ? 'red' : 'orange'}>
                        {room.paymentInfo.paymentStatus}
                      </Tag>
                    ) : (
                      <Tag color="default">Chưa có thanh toán</Tag>
                    )}
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button style={{ flex: 1 }} onClick={() => handleOpenCreate(room)} type="primary">Tạo thanh toán</Button>
                <Button style={{ flex: 1 }} onClick={() => openAddUsage(room)}>Thêm số liệu</Button>
                <Button style={{ flex: 1 }} onClick={() => openViewDetails(room)} type="link">Xem chi tiết</Button>
              </div>
            </Card>
          ))}
        </div>

      {/* MODAL ADD USAGE */}
      <Modal
        title={`Thêm số liệu dịch vụ - ${selectedRoom?.name || ""}`}
        open={usageModalOpen}
        onOk={submitUsage}
        onCancel={() => {
          setUsageModalOpen(false);
          usageForm.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        width={720}
      >
        <Form form={usageForm} layout="vertical">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item name="roomServiceId" label="Dịch vụ" rules={[{ required: true }]}> 
            <Select
              placeholder="Chọn dịch vụ"
              onChange={(val) => {
                const svc = services.find((s) => String(s.id) === String(val));
                if (svc) {
                  usageForm.setFieldsValue({ name: svc.name, type: svc.type, pricePerUnit: svc.pricePerUnit ?? svc.price ?? 0 });
                  setUsageType(svc.type || null);
                }
              }}
            >
              {services.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="type" label="Loại" rules={[{ required: true }]}> 
            <Select onChange={(v) => setUsageType(v)}>
              <Select.Option value="METERED">Theo công tơ</Select.Option>
              <Select.Option value="FIXED">Cố định</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>

          <Form.Item name="month" label="Tháng" rules={[{ required: true }]}> 
            <DatePicker picker="month" style={{ width: "100%" }} />
          </Form.Item>

          {usageType === 'METERED' ? (
            <>
              <Form.Item name="quantityOld" label="Chỉ số cũ"> 
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>

              <Form.Item name="quantityNew" label="Chỉ số mới"> 
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </>
          ) : (
            <Form.Item name="quantityUsed" label="Số lượng" initialValue={1}> 
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          )}

          {/* Removed price input — use service default price when submitting */}
          </div>
        </Form>
      </Modal>

      {/* MODAL VIEW DETAILS */}
      <Modal
        title={`Chi tiết phòng - ${selectedRoom?.name || ""}`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 12, display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedRoom?.name || '—'}</div>
            <div style={{ color: '#666', marginTop: 6 }}>Giá phòng: <strong>{selectedRoom?.price ? `${selectedRoom.price.toLocaleString('vi-VN')}₫` : '—'}</strong></div>
            <div style={{ color: '#666', marginTop: 6 }}>Địa chỉ: {selectedRoom?.address || '—'}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div>
              <strong>Thông tin thanh toán</strong>
              <div style={{ marginTop: 6 }}>
                {selectedRoom?.paymentInfo ? (
                  <div>
                    <div>Trạng thái: {selectedRoom.paymentInfo.paymentStatus}</div>
                    <div>Số tiền: {selectedRoom.paymentInfo.amount?.toLocaleString('vi-VN')}₫</div>
                  </div>
                ) : (
                  <div>Chưa có thông tin thanh toán</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ color: '#666', fontSize: 13 }}>Chọn tháng:</div>
              <DatePicker
                picker="month"
                format="MM/YYYY"
                value={viewMonth}
                onChange={(d) => {
                  setViewMonth(d);
                  const m = d ? d.format('YYYY-MM') : undefined;
                  if (selectedRoom?.id) loadUsagesForRoom(selectedRoom.id, m);
                }}
              />
            </div>
          </div>
        </div>

        <Table
          dataSource={usageList}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: "Dịch vụ", dataIndex: "roomServiceName", render: (t, r) => t || r.name || '—' },
            { title: "Loại", dataIndex: "type", render: (t) => {
                if (!t) return '—';
                return (t || '').toUpperCase() === 'METERED' ? 'Theo công tơ' : 'Cố định';
              }
            },
            { title: "Đơn giá", dataIndex: "pricePerUnit", render: (v) => (v ? `${v.toLocaleString('vi-VN')}₫` : '—') },
            { title: "Số lượng", key: 'qty', render: (_, r) => {
                // compute qty consistently: prefer explicit quantityUsed, otherwise derive for metered
                if (!r) return 0;
                const type = (r.type || '').toUpperCase();
                if (type === 'METERED') {
                  if (r.quantityUsed != null) return r.quantityUsed;
                  if (r.quantityNew != null && r.quantityOld != null) return (r.quantityNew - r.quantityOld);
                  return 0;
                }
                // FIXED
                return r.quantityUsed != null ? r.quantityUsed : 1;
              }
            },
            { title: "Tiền", dataIndex: "totalPrice", render: (v, r) => {
                const unit = r.pricePerUnit || 0;
                // reuse same quantity logic
                let qty = 0;
                const type = (r.type || '').toUpperCase();
                if (type === 'METERED') {
                  qty = r.quantityUsed != null ? r.quantityUsed : ((r.quantityNew != null && r.quantityOld != null) ? (r.quantityNew - r.quantityOld) : 0);
                } else {
                  qty = r.quantityUsed != null ? r.quantityUsed : 1;
                }
                const total = (v != null) ? v : (unit * qty || 0);
                
                return total ? `${total.toLocaleString('vi-VN')}₫` : '—';
              }
            },
          ]}
        />

        <div style={{ marginTop: 12, textAlign: 'right', fontSize: 16, fontWeight: 700 }}>
          Tổng: {((Number(selectedRoom?.price || 0) + usageList.reduce((s, r) => {
            const unit = r.pricePerUnit || 0;
            const type = (r.type || '').toUpperCase();
            let qty = 0;
            if (type === 'METERED') {
              qty = r.quantityUsed != null ? r.quantityUsed : ((r.quantityNew != null && r.quantityOld != null) ? (r.quantityNew - r.quantityOld) : 0);
            } else {
              qty = r.quantityUsed != null ? r.quantityUsed : 1;
            }
            const total = (r.totalPrice != null) ? r.totalPrice : (unit * qty || 0);
            return s + (total || 0);
          }, 0))).toLocaleString('vi-VN')}₫
        </div>
      </Modal>

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
