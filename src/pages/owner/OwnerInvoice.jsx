import { useEffect, useState } from "react";
import { Table, Button, Modal, Space, Tag, Descriptions } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const API = "/api/invoices";

export default function OwnerInvoice() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0,
  });

  const [detailModal, setDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const logErr = (err, msg) => {
    console.error("=== INVOICE ERROR ===");

    console.error("URL:", err.config?.url);
    console.error("METHOD:", err.config?.method);
    console.error("DATA:", err.config?.data);

    if (err.response) {
      console.error("STATUS:", err.response.status);
      console.error("BODY:", err.response.data);
      toast.error(msg || err.response.data.message);
    } else if (err.request) {
      console.error("NO RESPONSE:", err.request);
      toast.error("Không nhận phản hồi từ server");
    } else {
      console.error("REQUEST ERROR:", err.message);
      toast.error(err.message);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
      };

      const res = await axiosClient.get(API, { params });

      setInvoices(res.data.data || []);
      setPagination({
        ...pagination,
        total: res.data.totalElements,
      });
    } catch (err) {
      logErr(err, "Không tải được danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [pagination.page]);

  const viewDetail = async (id) => {
    try {
      const res = await axiosClient.get(`${API}/${id}`);
      setDetailData(res.data.data);
      setDetailModal(true);
    } catch (err) {
      logErr(err, "Không tải được chi tiết hóa đơn");
    }
  };

  const sendInvoice = async (id) => {
    try {
      await axiosClient.post(`${API}/send/${id}`);
      toast.success("Đã gửi hóa đơn đến người thuê");
    } catch (err) {
      logErr(err, "Không gửi được hóa đơn");
    }
  };

  const downloadInvoice = async (id) => {
    try {
      const res = await axiosClient.get(`${API}/${id}/download`);

      // res.data là array string → link file
      const fileUrl = res.data[0];

      window.open(fileUrl, "_blank");
      toast.success("Đã tải hóa đơn");
    } catch (err) {
      logErr(err, "Không tải được file hóa đơn");
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await axiosClient.delete(`${API}/${id}`);
      toast.success("Đã xoá hóa đơn");
      loadInvoices();
    } catch (err) {
      logErr(err, "Không xoá được hóa đơn");
    }
  };

  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "invoiceNumber",
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "issueDate",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => v.toLocaleString("vi-VN") + "₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => {
        let color = "blue";
        if (s === "PAID") color = "green";
        if (s === "CREATED") color = "gold";
        if (s === "CANCELLED") color = "red";

        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Hành động",
      render: (record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "blue" }} />}
            onClick={() => viewDetail(record.id)}
          />

          <Button
            type="text"
            icon={<SendOutlined style={{ color: "orange" }} />}
            onClick={() => sendInvoice(record.id)}
          />

          <Button
            type="text"
            icon={<DownloadOutlined style={{ color: "green" }} />}
            onClick={() => downloadInvoice(record.id)}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteInvoice(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Hóa đơn</h2>

      <Table
        columns={columns}
        dataSource={invoices}
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

      {/* CHI TIẾT HÓA ĐƠN */}
      <Modal
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={750}
        title="Chi tiết hóa đơn"
      >
        {detailData && (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Mã hóa đơn">
              {detailData.invoiceNumber}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày tạo">
              {dayjs(detailData.issueDate).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>

            <Descriptions.Item label="Tổng tiền">
              {detailData.totalAmount.toLocaleString("vi-VN")}₫
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {detailData.status}
            </Descriptions.Item>

            <Descriptions.Item label="Loại thanh toán">
              {detailData.payment.paymentType}
            </Descriptions.Item>

            <Descriptions.Item label="Số tiền thanh toán">
              {detailData.payment.amount.toLocaleString("vi-VN")}₫
            </Descriptions.Item>

            <Descriptions.Item label="Người thuê">
              {detailData.user.fullName}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {detailData.user.email}
            </Descriptions.Item>

            <Descriptions.Item label="Hợp đồng">
              #{detailData.contract.id}
            </Descriptions.Item>

            <Descriptions.Item label="Phòng">
              {detailData.payment.roomId}
            </Descriptions.Item>

            <Descriptions.Item label="Tải hợp đồng">
              <Button
                icon={<DownloadOutlined />}
                onClick={() =>
                  window.open(detailData.contract.contractFile, "_blank")
                }
              >
                Tải file hợp đồng
              </Button>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
