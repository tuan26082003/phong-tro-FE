import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, DatePicker, Select } from "antd";

import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

const API = "/api/contracts";

export default function AdminContract() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form] = Form.useForm();

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const logErr = (err) => {
    if (err.response) toast.error(err.response.data.message || "Lỗi");
    else toast.error("Lỗi không xác định");
  };

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API, {
        params: {
          page: pagination.page,
          size: pagination.size,
        },
      });

      if (res.data.status >= 400) {
        toast.error(res.data.message);
        return;
      }

      if (res.data.status && res.data.status !== 0)
        throw { response: { data: res.data } };

      setContracts(res.data.data || []);
      setPagination((p) => ({ ...p, total: res.data.totalElements }));
    } catch (err) {
      logErr(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, [pagination.page]);

  const openEdit = (record) => {
    setEditId(record.contractId);
    form.setFieldsValue({
      endDate: dayjs(record.endDate),
      status: record.status || "ACTIVE",
    });
    setModalOpen(true);
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setModalDeleteOpen(true);
  };

  const submitUpdate = async () => {
    const values = await form.validateFields();

    const payload = {
      endDate: values.endDate.format("YYYY-MM-DDT00:00:00"),
      status: values.status,
    };

    try {
      const res = await axiosClient.put(`${API}/${editId}`, payload);

      if (res.data.status && res.data.status !== 0)
        throw { response: { data: res.data } };

      toast.success("Cập nhật thành công");
      setModalOpen(false);
      loadContracts();
    } catch (err) {
      logErr(err);
    }
  };

  const submitDelete = async () => {
    try {
      const res = await axiosClient.delete(`${API}/${deleteId}`);

      if (res.data.status && res.data.status !== 0)
        throw { response: { data: res.data } };

      toast.success("Đã xoá");
      setModalDeleteOpen(false);
      loadContracts();
    } catch (err) {
      logErr(err);
    }
  };

  const downloadContract = async (id) => {
    try {
      const res = await axiosClient.get(`${API}/${id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      logErr(err);
    }
  };

  const columns = [
    {
      title: "Hợp đồng",
      dataIndex: "contractId",
    },
    {
      title: "Người thuê",
      dataIndex: "renterName",
    },
    {
      title: "Phòng",
      dataIndex: "roomName",
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (v) => v.toLocaleString("vi-VN") + "₫",
    },
    {
      title: "Bắt đầu",
      dataIndex: "startDate",
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Kết thúc",
      dataIndex: "endDate",
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "File",
      dataIndex: "contractUrl",
      render: (_, r) => (
        <Button
          type="text"
          icon={<DownloadOutlined />}
          onClick={() => downloadContract(r.contractId)}
        />
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
            onClick={() => openDelete(record.contractId)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý hợp đồng</h2>

      <Table
        columns={columns}
        dataSource={contracts}
        rowKey="contractId"
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
        onOk={submitUpdate}
        title="Cập nhật hợp đồng"
        width={600}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="ENDED">ENDED</Select.Option>
              <Select.Option value="CANCELLED">CANCELLED</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={modalDeleteOpen}
        onCancel={() => setModalDeleteOpen(false)}
        onOk={submitDelete}
        okType="danger"
        okText="Xoá"
        title="Xoá hợp đồng"
      >
        <p>Xác nhận xoá hợp đồng: {deleteId}</p>
      </Modal>
    </div>
  );
}
