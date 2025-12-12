import { Layout, Menu, Avatar, Dropdown, Badge } from "antd";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  ApartmentOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  DollarOutlined,
  BarChartOutlined,
  CalendarOutlined,
  MessageOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  DatabaseOutlined,
  ClusterOutlined,
} from "@ant-design/icons";

const { Sider, Header, Content } = Layout;

const ownerMenu = [
  // DASHBOARD
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: <Link to="/owner/dashboard">Tổng quan</Link>,
  },

  // PHÒNG & DỊCH VỤ
  {
    type: "group",
    label: <span className="menu-group">Phòng & Dịch vụ</span>,
  },
  {
    key: "rooms",
    icon: <ApartmentOutlined />,
    label: <Link to="/owner/rooms">Quản lý phòng</Link>,
  },
  {
    key: "services",
    icon: <ThunderboltOutlined />,
    label: <Link to="/owner/services">Quản lý dịch vụ</Link>,
  },
  {
    key: "room-service-usages",
    icon: <ClusterOutlined />,
    label: <Link to="/owner/room-service-usages">Số liệu sử dụng</Link>,
  },
{
    key: "confirm-payments-monthly",
    icon: <ClusterOutlined />,
    label: <Link to="/owner/confirm-payments-monthly">Thanh toán theo tháng</Link>,
  },
  // HÓA ĐƠN & THANH TOÁN
  {
    type: "group",
    label: <span className="menu-group">Hóa đơn & Thanh toán</span>,
  },
  {
    key: "invoices",
    icon: <FileTextOutlined />,
    label: <Link to="/owner/invoices">Hóa đơn</Link>,
  },
  {
    key: "payments",
    icon: <DollarOutlined />,
    label: <Link to="/owner/payments">Thanh toán</Link>,
  },

  // KHÁCH THUÊ
  {
    type: "group",
    label: <span className="menu-group">Khách thuê</span>,
  },
  {
    key: "bookings",
    icon: <CalendarOutlined />,
    label: <Link to="/owner/bookings">Đặt phòng</Link>,
  },
  {
    key: "contracts",
    icon: <BarChartOutlined />,
    label: <Link to="/owner/contracts">Hợp đồng</Link>,
  },

  // HỆ THỐNG
  {
    type: "group",
    label: <span className="menu-group">Hệ thống</span>,
  },
  {
    key: "banks",
    icon: <DatabaseOutlined />,
    label: <Link to="/owner/banks">Ngân hàng</Link>,
  },

  {
    key: "users",
    icon: <UserOutlined />,
    label: <Link to="/owner/users">Người dùng</Link>,
  },
];

const userMenu = {
  items: [
    {
      key: "change-password",
      label: <Link to="/owner/change-password">Đổi mật khẩu</Link>,
    },
    { key: "logout", danger: true, label: "Đăng xuất" },
  ],
};

const chatMenu = {
  items: [{ key: "chats", label: <Link to="/owner/chats">Tin nhắn</Link> }],
};

export default function OwnerLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        style={{
          background: "linear-gradient(to bottom, #001529, #003865)",
          paddingTop: 20,
        }}
      >
        <Menu
          theme="dark"
          mode="inline"
          items={ownerMenu}
          style={{
            background: "transparent",
            paddingLeft: 10,
            paddingRight: 10,
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            height: 70,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            Bảng điều khiển chủ trọ
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Dropdown menu={chatMenu} trigger={["click"]}>
              <Badge dot>
                <MessageOutlined
                  style={{ fontSize: 24, cursor: "pointer", color: "#1677ff" }}
                />
              </Badge>
            </Dropdown>

            <Dropdown
              menu={{
                items: userMenu.items,
                onClick: ({ key }) => key === "logout" && handleLogout(),
              }}
              trigger={["click"]}
            >
              <Avatar
                size="large"
                style={{
                  cursor: "pointer",
                  background: "#1890ff",
                  border: "2px solid #e6f4ff",
                }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            padding: 24,
            margin: 20,
            background: "#fff",
            borderRadius: 12,
            minHeight: "calc(100vh - 140px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
