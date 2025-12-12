import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Select, DatePicker, Table } from "antd";
import {
  HomeOutlined,
  DollarOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/plots";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalTenants: 0,
    totalRevenue: 0,
  });

  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(6); // 3, 6, 9, 12
  const [rooms, setRooms] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [roomRevenue, setRoomRevenue] = useState([]);

  useEffect(() => {
    loadStats();
    loadRooms();
  }, []);

  useEffect(() => {
    loadMonthlyRevenue();
  }, [selectedMonths]);

  useEffect(() => {
    if (selectedMonth && rooms.length > 0) {
      loadRoomRevenue();
    }
  }, [selectedMonth, selectedRoom, rooms]);

  const loadStats = async () => {
    try {
      // Load thống kê tổng quan
      const roomsRes = await axiosClient.get("/api/rooms", {
        params: { page: 0, size: 999 },
      });
      const tenantsRes = await axiosClient.get("/api/contracts/user/current-tenants", {
        params: { page: 0, size: 999 },
      });

      const allRooms = roomsRes.data.data || [];
      const available = allRooms.filter((r) => r.status === "AVAILABLE").length;
      const occupied = allRooms.filter((r) => r.status === "RENTED").length;

      setStats({
        totalRooms: allRooms.length,
        availableRooms: available,
        occupiedRooms: occupied,
        totalTenants: tenantsRes.data.totalElements || 0,
      });
    } catch (err) {
      console.error("Load stats error:", err);
    }
  };

  const loadRooms = async () => {
    try {
      const res = await axiosClient.get("/api/rooms", {
        params: { page: 0, size: 999 },
      });
      setRooms(res.data.data || []);
    } catch (err) {
      console.error("Load rooms error:", err);
    }
  };

  const loadMonthlyRevenue = async () => {
    try {
      // Gọi API lấy doanh thu chi tiết theo từng tháng
      const res = await axiosClient.get("/api/reports/revenue/monthly");
      const data = res.data.data || [];
      
      // Tạo N tháng gần nhất
      const months = [];
      for (let i = selectedMonths - 1; i >= 0; i--) {
        const date = dayjs().subtract(i, 'month');
        months.push(date.format('YYYY-MM'));
      }
      
      // Map data với N tháng, tháng nào không có data thì set 0
      const formattedData = months.map(month => {
        const found = data.find(item => item.period === month);
        return {
          month: month,
          revenue: found ? Number(found.totalAmount) : 0,
        };
      });
      
      // Tính tổng doanh thu từ N tháng
      const totalRevenue = formattedData.reduce((sum, item) => sum + item.revenue, 0);
      setStats(prev => ({ ...prev, totalRevenue }));
      
      setMonthlyRevenue(formattedData);
    } catch (err) {
      console.error("Load monthly revenue error:", err);
      toast.error("Không thể tải doanh thu theo tháng");
    }
  };

  const loadRoomRevenue = async () => {
    try {
      // Nếu chọn 1 phòng cụ thể
      if (selectedRoom) {
        const res = await axiosClient.get("/api/reports/revenue/monthly", {
          params: { roomId: selectedRoom }
        });
        const data = res.data.data || [];
        
        // Tìm dữ liệu của tháng được chọn
        const monthData = data.find(item => item.period === selectedMonth);
        const roomInfo = rooms.find(r => r.id === selectedRoom);
        
        setRoomRevenue([{
          roomId: selectedRoom,
          roomName: roomInfo?.name || `Phòng ${selectedRoom}`,
          revenue: monthData ? Number(monthData.totalAmount) : 0,
        }]);
      } else {
        // Lấy doanh thu tất cả các phòng
        const revenuePromises = rooms.map(async (room) => {
          try {
            const res = await axiosClient.get("/api/reports/revenue/monthly", {
              params: { roomId: room.id }
            });
            const data = res.data.data || [];
            const monthData = data.find(item => item.period === selectedMonth);
            
            return {
              roomId: room.id,
              roomName: room.name,
              revenue: monthData ? Number(monthData.totalAmount) : 0,
            };
          } catch (err) {
            return {
              roomId: room.id,
              roomName: room.name,
              revenue: 0,
            };
          }
        });
        
        const results = await Promise.all(revenuePromises);
        setRoomRevenue(results);
      }
    } catch (err) {
      console.error("Load room revenue error:", err);
      setRoomRevenue([]);
    }
  };

  // Biểu đồ tròn - tỷ lệ phòng trống
 // Tạo data riêng, bỏ bớt nếu value = 0 để tránh bug hiển thị
const pieData = [
  { type: "Phòng trống", value: stats.availableRooms },
  { type: "Phòng đã thuê", value: stats.occupiedRooms },
].filter((item) => item.value > 0);

const pieConfig = {
  data: pieData,
  angleField: "value",
  colorField: "type",
  radius: 1,
  label: {
    text: (datum) => `${datum.type}\n${datum.value} phòng`,
    position: "outside",
    style: {
      fontSize: 14,
      fontWeight: "bold",
    },
  },
  legend: {
    color: {
      title: false,
      position: "bottom",
      itemName: {
        style: {
          fontSize: 14,
        },
      },
    },
  },

  // Sử dụng function để map màu chính xác
  color: (datum) => {
    if (datum.type === "Phòng trống") return "#00b96b";
    if (datum.type === "Phòng đã thuê") return "#ff4d4f";
    return "#1890ff";
  },

  tooltip: {
    formatter: (datum) => {
      const total = stats.totalRooms || 0;
      const percent = total > 0 ? ((datum.value / total) * 100).toFixed(1) : 0;
      return {
        name: datum.type,
        value: `${datum.value} phòng (${percent}%)`,
      };
    },
  },
  interactions: [
    {
      type: "element-active",
    },
  ],
};

  // Biểu đồ cột - doanh thu theo tháng
  const columnConfig = {
    data: monthlyRevenue,
    xField: "month",
    yField: "revenue",
    label: {
      position: "top",
      formatter: (datum) => {
        const value = datum?.revenue || 0;
        if (value === 0) {
          return "";
        }
        return `${value.toLocaleString("vi-VN")}`;
      },
    },
    meta: {
      revenue: {
        alias: "Doanh thu (VNĐ)",
        formatter: (v) => `${(v || 0).toLocaleString("vi-VN")}₫`,
      },
    },
    color: "#1890ff",
  };

  const revenueColumns = [
    {
      title: "Phòng",
      dataIndex: "roomName",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      render: (v) => v.toLocaleString("vi-VN") + "₫",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: 24 }}>Dashboard Chủ trọ</h2>

      {/* THỐNG KÊ TỔNG QUAN */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số phòng"
              value={stats.totalRooms}
              prefix={<HomeOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Phòng trống"
              value={stats.availableRooms}
              prefix={<HomeOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Phòng đã thuê"
              value={stats.occupiedRooms}
              prefix={<HomeOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người thuê"
              value={stats.totalTenants}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* TỔNG DOANH THU */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            extra={
              <Select
                value={selectedMonths}
                onChange={setSelectedMonths}
                style={{ width: 120 }}
              >
                <Select.Option value={3}>3 tháng</Select.Option>
                <Select.Option value={6}>6 tháng</Select.Option>
                <Select.Option value={9}>9 tháng</Select.Option>
                <Select.Option value={12}>12 tháng</Select.Option>
              </Select>
            }
          >
            <Statistic
              title={`Tổng doanh thu ${selectedMonths} tháng gần nhất`}
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: 32 }}
              suffix="₫"
              formatter={(value) => value.toLocaleString("vi-VN")}
            />
          </Card>
        </Col>
      </Row>

      {/* BIỂU ĐỒ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Tỷ lệ phòng trống">
            <Pie {...pieConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={`Doanh thu theo tháng (${selectedMonths} tháng gần nhất)`}>
            <Column {...columnConfig} />
          </Card>
        </Col>
      </Row>

      {/* DOANH THU CHI TIẾT THEO PHÒNG */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Doanh thu theo phòng"
            extra={
              <div style={{ display: "flex", gap: 12 }}>
                <DatePicker
                  picker="month"
                  placeholder="Chọn tháng"
                  value={dayjs(selectedMonth, "YYYY-MM")}
                  onChange={(date) =>
                    setSelectedMonth(date ? date.format("YYYY-MM") : null)
                  }
                />
                <Select
                  placeholder="Chọn phòng (tất cả)"
                  allowClear
                  style={{ width: 200 }}
                  value={selectedRoom}
                  onChange={setSelectedRoom}
                >
                  {rooms.map((room) => (
                    <Select.Option key={room.id} value={room.id}>
                      {room.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            }
          >
            <Table
              columns={revenueColumns}
              dataSource={roomRevenue}
              rowKey="roomId"
              pagination={false}
              summary={(data) => {
                const total = data.reduce((sum, item) => sum + item.revenue, 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell>
                      <strong>Tổng doanh thu</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <strong style={{ color: "#1890ff" }}>
                        {total.toLocaleString("vi-VN")}₫
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
