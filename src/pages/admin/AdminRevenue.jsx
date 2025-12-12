import { useState, useEffect } from "react";
import { Card, Select, DatePicker, Row, Col, Statistic, Table, Tag, Spin } from "antd";
import { DollarOutlined, UserOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

export default function AdminRevenue() {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs());
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(false);

  // =====================================================
  // LOAD OWNERS
  // =====================================================
  const loadOwners = async () => {
    try {
      setLoadingOwners(true);
      // API lấy danh sách users với role OWNER
      const res = await axiosClient.get("/api/user/role/OWNER", {
        params: { page: 0, size: 999 },
      });
      
      console.log("Response from API:", res);
      console.log("Response data:", res.data);
      
      // Backend có thể trả về res.data.data hoặc res.data trực tiếp là array
      let ownerList = [];
      if (Array.isArray(res.data)) {
        ownerList = res.data;
      } else if (Array.isArray(res.data.data)) {
        ownerList = res.data.data;
      } else if (res.data.content && Array.isArray(res.data.content)) {
        ownerList = res.data.content;
      }
      
      console.log("Owner list:", ownerList);
      setOwners(ownerList);
      
      // Tự động chọn owner đầu tiên
      if (ownerList.length > 0) {
        setSelectedOwner(ownerList[0].id);
      }
    } catch (err) {
      console.error("Load owners error:", err);
      console.error("Error response:", err.response);
      toast.error("Không tải được danh sách chủ trọ");
      setOwners([]);
    } finally {
      setLoadingOwners(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  // =====================================================
  // LOAD REVENUE
  // =====================================================
  const loadRevenue = async () => {
    if (!selectedOwner || !selectedPeriod) return;

    try {
      setLoading(true);
      const period = selectedPeriod.format("YYYY-MM");
      const res = await axiosClient.get("/api/payments/revenue/owner/month", {
        params: {
          ownerId: selectedOwner,
          period: period,
        },
      });
      
      setRevenue(res.data.data || res.data || 0);
    } catch (err) {
      console.error("Load revenue error:", err);
      toast.error("Không tải được doanh thu");
      setRevenue(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, [selectedOwner, selectedPeriod]);

  // =====================================================
  // GET SELECTED OWNER INFO
  // =====================================================
  const getSelectedOwnerInfo = () => {
    if (!selectedOwner) return null;
    return owners.find((o) => o.id === selectedOwner);
  };

  const ownerInfo = getSelectedOwnerInfo();

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Doanh thu chủ trọ</h2>

      {/* FILTERS */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <strong>Chọn chủ trọ:</strong>
            </div>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn chủ trọ"
              value={selectedOwner}
              onChange={setSelectedOwner}
              loading={loadingOwners}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {owners.map((owner) => (
                <Select.Option key={owner.id} value={owner.id}>
                  {owner.fullName || owner.username || `Owner #${owner.id}`}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <strong>Chọn tháng:</strong>
            </div>
            <DatePicker
              picker="month"
              format="MM/YYYY"
              value={selectedPeriod}
              onChange={(date) => setSelectedPeriod(date || dayjs())}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      </Card>

      {/* OWNER INFO & REVENUE */}
      {loading ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {/* OWNER INFO */}
          <Col xs={24} md={12}>
            <Card>
              <Statistic
                title="Thông tin chủ trọ"
                value={ownerInfo?.fullName || ownerInfo?.username || "—"}
                prefix={<UserOutlined />}
                valueStyle={{ fontSize: 20 }}
              />
              {ownerInfo && (
                <div style={{ marginTop: 16 }}>
                  <div><strong>Email:</strong> {ownerInfo.email || "—"}</div>
                  <div><strong>SĐT:</strong> {ownerInfo.phone || "—"}</div>
                
                </div>
              )}
            </Card>
          </Col>

          {/* REVENUE */}
          <Col xs={24} md={12}>
            <Card>
              <Statistic
                title={`Doanh thu tháng ${selectedPeriod.format("MM/YYYY")}`}
                value={revenue !== null && revenue !== undefined ? revenue : 0}
                prefix={<DollarOutlined />}
                suffix="₫"
                valueStyle={{ color: "#3f8600", fontSize: 28 }}
                formatter={(value) => {
                  const num = Number(value);
                  return isNaN(num) ? "0" : num.toLocaleString("vi-VN");
                }}
              />
            </Card>
          </Col>

      
         
        </Row>
      )}

      {/* SUMMARY TABLE */}
      {revenue !== null && (
        <Card style={{ marginTop: 24 }}>
          <h3>Tổng kết</h3>
          <Table
            dataSource={[
              {
                key: 1,
                label: "Chủ trọ",
                value: ownerInfo?.fullName || ownerInfo?.username || "—",
              },
              {
                key: 2,
                label: "Kỳ thanh toán",
                value: selectedPeriod.format("MM/YYYY"),
              },
              {
                key: 3,
                label: "Tổng doanh thu",
                value: (() => {
                  const num = Number(revenue);
                  return `${isNaN(num) ? 0 : num.toLocaleString("vi-VN")}₫`;
                })(),
              },
            ]}
            columns={[
              {
                title: "Thông tin",
                dataIndex: "label",
                key: "label",
                width: "40%",
              },
              {
                title: "Giá trị",
                dataIndex: "value",
                key: "value",
              },
            ]}
            pagination={false}
            bordered
          />
        </Card>
      )}
    </div>
  );
}
