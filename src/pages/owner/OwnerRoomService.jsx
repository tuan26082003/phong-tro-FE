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
    size: 12,
    total: 0,
    totalPages: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const selectedService = services.find((s) => s.id === selectedServiceId) || null;
  const [pricePerUnit, setPricePerUnit] = useState(null);
  const [newServiceName, setNewServiceName] = useState("");
  const [serviceType, setServiceType] = useState("FIXED");

  const typeLabel = (t) => {
    if (!t) return "---";
    if (String(t).toUpperCase() === "FIXED") return "Cố định";
    if (String(t).toUpperCase() === "METERED") return "Tính theo công tơ";
    return t;
  };

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

  const openAssignModal = (room) => {
    if (room) {
      const id = room.id || room;
      setAssignRoomId(id);
      loadAssignList(id);
    } else {
      setAssignRoomId(null);
      setAssignList([]);
    }

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

  const assignService = async (service) => {
    try {
      await axiosClient.post(`/api/room-services/assign`, {
        serviceId: service.id,
        roomId: assignRoomId,
      });

      message.success("Đã gán dịch vụ");

      loadAssignList(assignRoomId);
    } catch (err) {
      console.error("Assign error:", err);
      message.error(err.response?.data?.message || "Không thể gán dịch vụ");
    }
  };

  const assignServiceById = async () => {
    // require room
    if (!assignRoomId) {
      message.error("Vui lòng chọn phòng trước");
      return;
    }

    // require price
    if (!pricePerUnit && pricePerUnit !== 0) {
      message.error("Vui lòng nhập giá dịch vụ");
      return;
    }

    try {
      const payload = { roomId: assignRoomId, pricePerUnit, type: serviceType };

      if (selectedServiceId === "new") {
        if (!newServiceName || !newServiceName.trim()) {
          message.error("Vui lòng nhập tên dịch vụ mới");
          return;
        }

        payload.serviceName = newServiceName.trim();
      } else {
        if (!selectedServiceId) {
          message.error("Vui lòng chọn dịch vụ");
          return;
        }

        payload.serviceId = selectedServiceId;
      }

      const res = await axiosClient.post(`/api/room-services/assign`, payload);

      message.success(res.data?.message || "Đã gán dịch vụ");
      setSelectedServiceId(null);
      setNewServiceName("");
      setPricePerUnit(null);
      setServiceType("FIXED");
      loadAssignList(assignRoomId);
    } catch (err) {
      console.error("Assign by id error:", err);
      message.error(err.response?.data?.message || "Không thể gán dịch vụ");
    }
  };

  const unassignService = async (assignId) => {
    try {
      console.log("Deleting assign ID:", assignId);
      await axiosClient.delete(`/api/room-services/assign/${assignId}`);
      message.success("Đã gỡ dịch vụ");
      loadAssignList(assignRoomId);
    } catch (err) {
      console.error("Unassign error:", err);
      console.error("Response:", err.response?.data);
      message.error(err.response?.data?.message || "Không thể gỡ dịch vụ");
    }
  };

  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
  
    
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm dịch vụ
        </Button>
      </div>

      {/* ROOMS LIST - quick manage per room */}
      <div style={{ marginBottom: 20 }}>
        <h3>Quản lý dịch vụ theo phòng</h3>
        <br></br>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
            alignItems: "start",
          }}
        >
          {allRooms.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #eee",
                padding: 10,
                borderRadius: 6,
                minWidth: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 88,
                background: "#fff",
              }}
            >
              <div style={{ fontWeight: 600 }}>{r.name || `Phòng #${r.id}`}</div>

              <div style={{ marginTop: 8, textAlign: "right" }}>
                <Button size="small" onClick={() => openAssignModal(r)}>
                  Quản lý dịch vụ
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
     <h3> Các dịch vụ đã có nếu chưa có bạn có thể thêm mới </h3>
     <br></br>
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
          style: { textAlign: "center", marginTop: 16 },
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
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input />
          </Form.Item>
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
            value={assignRoomId}
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
                <div>
                  <div style={{ fontWeight: 600 }}>{s.serviceName || s.name}</div>
                  <div style={{ color: "#666" }}>
                    Giá: {s.pricePerUnit ? (Number(s.pricePerUnit).toLocaleString("vi-VN") + "₫") : "---"}
                  </div>
                  <div style={{ color: "#666" }}>
                    Loại: {typeLabel(s.type || s.serviceType)}
                  </div>
                </div>

                <Button danger onClick={() => unassignService(s.id)}>
                  Xoá
                </Button>
              </div>
            ))}

            <h4>Gán thêm dịch vụ:</h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 100px", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <Select
                placeholder="Chọn dịch vụ hoặc 'Tạo mới'"
                style={{ width: "100%" }}
                value={selectedServiceId}
                onChange={(v) => {
                  setSelectedServiceId(v);
                  if (v === "new") {
                    setPricePerUnit(null);
                    setNewServiceName("");
                    setServiceType("FIXED");
                  } else {
                    const svc = services.find((s) => s.id === v);
                    setPricePerUnit(svc ? Number(svc.price ?? svc.defaultPrice ?? svc.pricePerUnit ?? null) : null);
                    setServiceType(svc ? (svc.type ?? svc.serviceType ?? "FIXED") : "FIXED");
                  }
                }}
                showSearch
                optionFilterProp="children"
              >
                {services.map((svc) => (
                  <Select.Option key={svc.id} value={svc.id}>
                    {svc.name} {svc.price ? ` - ${svc.price.toLocaleString("vi-VN")}₫` : ""}
                  </Select.Option>
                ))}
                <Select.Option key="__new" value="new">
                  Tạo dịch vụ mới...
                </Select.Option>
              </Select>

              <InputNumber
                placeholder="Giá"
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                value={pricePerUnit}
                onChange={(v) => setPricePerUnit(v)}
              />

              <Select value={serviceType} onChange={(v) => setServiceType(v)} style={{ width: "100%" }}>
                <Select.Option value="FIXED">Cố định</Select.Option>
                <Select.Option value="METERED">Tính theo công tơ</Select.Option>
              </Select>

              <Button type="primary" onClick={assignServiceById} disabled={!assignRoomId || (!selectedServiceId && !newServiceName) || (pricePerUnit === null || pricePerUnit === undefined)}>
                Gán
              </Button>
            </div>

            {selectedServiceId === "new" && (
              <div style={{ marginBottom: 12 }}>
                <Input
                  placeholder="Tên dịch vụ mới"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
