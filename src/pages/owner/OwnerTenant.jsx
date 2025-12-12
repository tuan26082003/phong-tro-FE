import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const API = "/api/contracts/user/current-tenants";

export default function OwnerTenant() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0,
  });

  const [detailModal, setDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const logErr = (err, msg) => {
    console.error("=== TENANT ERROR ===");
    console.error(err);
    if (err.response) {
      toast.error(msg || err.response.data.message || "Lỗi");
    } else {
      toast.error("Không kết nối được server");
    }
  };

  const loadTenants = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        size: pagination.size,
      };

      const res = await axiosClient.get(API, { params });

      setTenants(res.data.data || []);
      setPagination({
        ...pagination,
        total: res.data.totalElements || 0,
      });
    } catch (err) {
      logErr(err, "Không tải được danh sách người thuê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [pagination.page]);

  const viewDetail = async (renterId) => {
    try {
      const res = await axiosClient.get(`/api/user/${renterId}`);
      setDetailData(res.data.data);
      setDetailModal(true);
    } catch (err) {
      logErr(err, "Không tải được thông tin người dùng");
    }
  };

  const columns = [
    {
      title: "Tên người thuê",
      dataIndex: "renterName",
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: "Email",
      dataIndex: "renterEmail",
    },
    {
      title: "Số điện thoại",
      dataIndex: "renterPhone",
    },
    {
      title: "Phòng",
      dataIndex: "roomName",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Địa chỉ phòng",
      dataIndex: "roomAddress",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "contractStartDate",
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "contractEndDate",
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái phòng",
      dataIndex: "roomStatus",
      render: (s) => {
        let color = "blue";
        if (s === "AVAILABLE") color = "green";
        if (s === "OCCUPIED") color = "orange";
        if (s === "MAINTENANCE") color = "red";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Hành động",
      render: (record) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: "blue" }} />}
          onClick={() => viewDetail(record.renterId)}
        />
      ),
    },
  ];

  return (
    <div>
      <h2>Danh sách người đang thuê trọ</h2>

      <Table
        columns={columns}
        dataSource={tenants}
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

      {/* CHI TIẾT NGƯỜI THUÊ */}
      <Modal
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={700}
        title="Chi tiết người thuê"
      >
        {detailData && (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Họ tên">
              {detailData.fullName}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {detailData.email}
            </Descriptions.Item>

            <Descriptions.Item label="Số điện thoại">
              {detailData.phone || "Chưa cập nhật"}
            </Descriptions.Item>

            <Descriptions.Item label="Giới tính">
              {detailData.gender || "Chưa cập nhật"}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày sinh">
              {detailData.dateOfBirth
                ? dayjs(detailData.dateOfBirth).format("DD/MM/YYYY")
                : "Chưa cập nhật"}
            </Descriptions.Item>

            <Descriptions.Item label="CCCD">
              {detailData.citizenId || "Chưa cập nhật"}
            </Descriptions.Item>

            <Descriptions.Item label="Địa chỉ" span={2}>
              {detailData.address || "Chưa cập nhật"}
            </Descriptions.Item>

            <Descriptions.Item label="Vai trò">
              <Tag color="blue">{detailData.roleName}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái tài khoản">
              <Tag color={detailData.enabled ? "green" : "red"}>
                {detailData.enabled ? "Hoạt động" : "Bị khóa"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
