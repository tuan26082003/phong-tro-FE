// src/layouts/RenterLayout.jsx
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button, Avatar, Dropdown, Space, Typography } from "antd";
import { 
  MenuOutlined, 
  CloseOutlined, 
  UserOutlined,
  HeartOutlined,
  SearchOutlined,
  BellOutlined,
  HomeOutlined,
  MessageOutlined
} from "@ant-design/icons";
import "./layout.css";

const { Text } = Typography;

export default function RenterLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Đọc user từ localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user.user); // user là object chứa fullName, email, roleName...
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error("PARSE USER ERROR:", e);
      setCurrentUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setCurrentUser(null);
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  const userMenuItems = [
    {
      key: "info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 600 }}>{currentUser?.fullName}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {currentUser?.email}
          </div>
        </div>
      ),
      disabled: true,
    },

    { type: "divider" },

    {
      key: "booking-list",
      label: "Quản lý Đặt phòng",
      onClick: () => navigate("/booking-list", { replace: true }),
    },
    {
      key: "contract",
      label: "Quản lý Hợp đồng",
      onClick: () => navigate("/contract", { replace: true }),
    },
    {
      key: "change-password",
      label: "Đổi mật khẩu",
      onClick: () => navigate("/change-password", { replace: true }),
    },

    { type: "divider" },

    {
      key: "logout",
      label: <span style={{ color: "red" }}>Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="layout-wrapper">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={logo} alt="Logo" style={{ height: 56, width: 56, objectFit: 'contain' }} />
            <span className="logo-text" style={{ color: '#2196F3', fontWeight: 800, fontSize: 24 }}>Phòng trọ DHT</span>
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <nav className="nav nav-desktop">
          <Link to="/">Trang chủ</Link>
          <Link to="/rooms">Phòng Trọ</Link>
          <Link to="/about">Giới thiệu</Link>
          <Link to="/contact">Hỗ trợ</Link>
        </nav>

        {/* DESKTOP AUTH */}
        <div className="auth auth-desktop">
          <Space size="large">
            <MessageOutlined 
              className="header-icon" 
              onClick={() => navigate("/chat")}
              style={{ cursor: "pointer" }}
            />
            {currentUser ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Avatar
                  size={40}
                  style={{ 
                    backgroundColor: "#2196F3", 
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 600
                  }}
                  icon={!currentUser.fullName && <UserOutlined />}
                >
                  {currentUser.fullName && getInitials(currentUser.fullName)}
                </Avatar>
              </Dropdown>
            ) : (
              <Space size="middle">
                <Button 
                  size="large"
                  onClick={() => navigate("/login")}
                  className="btn-login"
                  style={{ 
                    borderRadius: 8,
                    padding: "0 24px",
                    backgroundColor: "#fff",
                    borderColor: "#2196F3",
                    color: "#666",
                    fontWeight: 600
                  }}
                >
                  Đăng nhập
                </Button>
                 <Button 
                  type="primary"
                  size="large"
                  onClick={() => navigate("/register")}
                  className="btn-register"
                  style={{ 
                    borderRadius: 8,
                    padding: "0 24px",
                    backgroundColor: "#2196F3",
                    borderColor: "#2196F3",
                    color: "#fff",
                    fontWeight: 600
                  }}
                >
                  Đăng ký
                </Button>
                <Button 
                  size="large"
                  onClick={() => navigate("/post-room")}
                  style={{ 
                    borderRadius: 8,
                    padding: "0 24px",
                    backgroundColor: "#fff",
                    borderColor: "#2196F3",
                    color: "#666",
                    fontWeight: 600
                  }}
                >
                  Đăng tin
                </Button>
               
              </Space>
            )}
          </Space>
        </div>

        {/* MOBILE BURGER */}
        <div className="burger" onClick={() => setMenuOpen(true)}>
          <MenuOutlined />
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <div className="mobile-menu-header">
          <span className="mobile-logo">
            <HomeOutlined style={{ marginRight: 8 }} />
            Phòng Trọ
          </span>
          <CloseOutlined
            className="close-btn"
            onClick={() => setMenuOpen(false)}
          />
        </div>

        {currentUser && (
          <div
            style={{
              padding: "12px 16px 4px",
              borderBottom: "1px solid #eee",
            }}
          >
            <Space align="center">
              <Avatar
                style={{ backgroundColor: "#1677ff" }}
                icon={!currentUser.fullName && <UserOutlined />}
              >
                {currentUser.fullName && getInitials(currentUser.fullName)}
              </Avatar>
              <div>
                <div style={{ fontWeight: 600 }}>{currentUser.fullName}</div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {currentUser.email}
                </div>
              </div>
            </Space>
          </div>
        )}

        <nav className="mobile-nav">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Trang chủ
          </Link>
          <Link to="/rooms" onClick={() => setMenuOpen(false)}>
            Phòng Trọ
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            Giới thiệu
          </Link>
          <Link to="/help" onClick={() => setMenuOpen(false)}>
            Hỗ trợ
          </Link>
        </nav>

        <div className="mobile-auth">
          {currentUser ? (
            <Button
              block
              danger
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              Đăng xuất
            </Button>
          ) : (
            <>
              <Button
                block
                type="default"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login");
                }}
              >
                Đăng nhập
              </Button>
              <Button
                block
                type="primary"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/register");
                }}
              >
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="content-area">
        <Outlet />
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col">
            <h3 className="footer-logo">
              <HomeOutlined style={{ marginRight: 8 }} />
              Phòng Trọ
            </h3>
            <p className="footer-desc">
              Nền tảng tìm Phòng Trọ thông minh – minh bạch – an toàn – kết nối
              nhanh giữa chủ trọ và người thuê.
            </p>

            <div className="footer-social">
              <img src="https://placehold.co/40x40?text=FB" />
              <img src="https://placehold.co/40x40?text=IG" />
              <img src="https://placehold.co/40x40?text=YT" />
              <img src="https://placehold.co/40x40?text=TT" />
            </div>
          </div>

          <div className="footer-col">
            <h4>Về StayEase</h4>
            <Link>Giới thiệu</Link>
            <Link>Tin tức</Link>
            <Link>Tuyển dụng</Link>
            <Link>Blog chia sẻ</Link>
            <Link>Liên hệ đối tác</Link>
          </div>

          <div className="footer-col">
            <h4>Dành cho người thuê</h4>
            <Link>Tìm kiếm Phòng Trọ</Link>
            <Link>Phòng giá tốt</Link>
            <Link>Phòng gần trường học</Link>
            <Link>Phòng gần khu công nghiệp</Link>
            <Link>Kinh nghiệm thuê trọ</Link>
          </div>

          <div className="footer-col">
            <h4>Dành cho chủ trọ</h4>
            <Link>Đăng tin cho thuê</Link>
            <Link>Quản lý Phòng Trọ</Link>
            <Link>Các gói dịch vụ</Link>
            <Link>Chính sách & hỗ trợ</Link>
            <Link>Bảng giá</Link>
          </div>

          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <Link>Trung tâm trợ giúp</Link>
            <Link>Câu hỏi thường gặp</Link>
            <Link>Điều khoản dịch vụ</Link>
            <Link>Chính sách bảo mật</Link>
            <Link>Báo cáo vi phạm</Link>

            <h4 style={{ marginTop: 20 }}>Liên hệ</h4>
            <p className="ft-contact">Hotline: 0988 123 456</p>
            <p className="ft-contact">Email: support@stayease.vn</p>
            <p className="ft-contact">Giờ làm việc: 8:00 – 21:00</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Trụ sở: 123 Nguyễn Văn Cừ, Long Biên, Hà Nội</p>
          <p>Giấy phép TMĐT số 01A-2025 / Bộ Công Thương</p>
          <hr />
          <p>
            © 2025 Phòng Trọ – Nền tảng tìm Phòng Trọ thông minh tại Việt Nam.
          </p>
        </div>
      </footer>
    </div>
  );
}
