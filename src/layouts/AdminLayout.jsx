import { Layout, Menu, Avatar, Dropdown, Badge } from "antd";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  ApartmentOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LockOutlined,
  MessageOutlined,
  SettingOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Sider, Header, Content } = Layout;

// MENU ADMIN
const adminMenu = [
  // DASHBOARD
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: <Link to="/admin/dashboard">Tổng quan</Link>,
  },

  // QUẢN LÝ PHÒNG
  {
    type: "group",
    label: <span className="menu-group">Quản lý phòng</span>,
  },
  {
    key: "rooms",
    icon: <ApartmentOutlined />,
    label: <Link to="/admin/rooms">Danh sách phòng</Link>,
  },

  // QUẢN LÝ NGƯỜI DÙNG
  {
    type: "group",
    label: <span className="menu-group">Quản lý người dùng</span>,
  },
  {
    key: "owners",
    icon: <UserOutlined />,
    label: <Link to="/admin/owners">Chủ trọ (Owner)</Link>,
  },
  {
    key: "renters",
    icon: <TeamOutlined />,
    label: <Link to="/admin/renters">Người dùng (Renter)</Link>,
  },
  {
    key: "user-approval",
    icon: <CheckCircleOutlined />,
    label: <Link to="/admin/user-approval">Duyệt tài khoản </Link>,
  },

  // QUẢN LÝ ĐƠN THUÊ & HỢP ĐỒNG
  {
    type: "group",
    label: <span className="menu-group">Đơn thuê & Hợp đồng</span>,
  },
  {
    key: "bookings",
    icon: <FileTextOutlined />,
    label: <Link to="/admin/bookings">Đơn đặt phòng</Link>,
  },
  {
    key: "contracts",
    icon: <BarChartOutlined />,
    label: <Link to="/admin/contracts">Hợp đồng thuê</Link>,
  },

  // BÁO CÁO & KHIẾU NẠI
  {
    type: "group",
    label: <span className="menu-group">Hỗ trợ</span>,
  },
  {
    key: "helps",
    icon: <MessageOutlined />,
    label: <Link to="/admin/helps">Giải quyết hỗ trợ</Link>,
  },

  // THANH TOÁN & DOANH THU
  {
    type: "group",
    label: <span className="menu-group">Thanh toán & Doanh thu</span>,
  },
  {
    key: "payments",
    icon: <DollarOutlined />,
    label: <Link to="/admin/payments">Giao dịch</Link>,
  },
  {
    key: "revenue",
    icon: <BarChartOutlined />,
    label: <Link to="/admin/revenue">Doanh thu </Link>,
  },

  // HỆ THỐNG
  {
    type: "group",
    label: <span className="menu-group">Hệ thống</span>,
  },
  {
    key: "role",
    icon: <LockOutlined />,
    label: <Link to="/admin/role">Phân quyền</Link>,
  },
];

const userMenu = {
  items: [
    {
      key: "change-password",
      label: <Link to="/change-password">Đổi mật khẩu</Link>,
    },
    { key: "logout", danger: true, label: "Đăng xuất" },
  ],
};

const chatMenu = {
  items: [{ key: "chats", label: <Link to="/admin/chats">Tin nhắn</Link> }],
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  // Lấy key menu từ URL hiện tại để highlight
  const path = location.pathname;
  const selectedKey =
    adminMenu
      ?.filter((item) => item && "key" in item && item.key) // bỏ group
      .find((item) => {
        if (!item || !("key" in item)) return false;
        const key = item.key;
        return path.startsWith(`/admin/${key}`) || path === "/admin" || path === "/admin/";
      })?.key || "dashboard";

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
          items={adminMenu}
          selectedKeys={[selectedKey]}
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
            Bảng điều khiển quản trị
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
