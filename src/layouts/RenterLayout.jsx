// src/layouts/RenterLayout.jsx
import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Button } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import "./layout.css";

export default function RenterLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="layout-wrapper">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <div className="logo">StayEase</div>
        </div>

        {/* DESKTOP NAV */}
        <nav className="nav nav-desktop">
          <Link to="/">Trang chủ</Link>
          <Link to="/rooms">Tìm phòng</Link>
          <Link to="/about">Giới thiệu</Link>
          <Link to="/contact">Hỗ trợ</Link>
        </nav>

        {/* DESKTOP AUTH */}
        <div className="auth auth-desktop">
          <Button type="default">Đăng nhập</Button>
          <Button type="primary">Đăng ký</Button>
        </div>

        {/* MOBILE BURGER */}
        <div className="burger" onClick={() => setMenuOpen(true)}>
          <MenuOutlined />
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <div className="mobile-menu-header">
          <span className="mobile-logo">StayEase</span>
          <CloseOutlined
            className="close-btn"
            onClick={() => setMenuOpen(false)}
          />
        </div>

        <nav className="mobile-nav">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Trang chủ
          </Link>
          <Link to="/rooms" onClick={() => setMenuOpen(false)}>
            Tìm phòng
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            Giới thiệu
          </Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>
            Hỗ trợ
          </Link>
        </nav>

        <div className="mobile-auth">
          <Button block type="default">
            Đăng nhập
          </Button>
          <Button block type="primary">
            Đăng ký
          </Button>
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
            <h3 className="footer-logo">StayEase</h3>
            <p className="footer-desc">
              Nền tảng tìm phòng trọ thông minh – minh bạch – an toàn – kết nối
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
            <Link>Tìm kiếm phòng trọ</Link>
            <Link>Phòng giá tốt</Link>
            <Link>Phòng gần trường học</Link>
            <Link>Phòng gần khu công nghiệp</Link>
            <Link>Kinh nghiệm thuê trọ</Link>
          </div>

          <div className="footer-col">
            <h4>Dành cho chủ trọ</h4>
            <Link>Đăng tin cho thuê</Link>
            <Link>Quản lý phòng trọ</Link>
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
            © 2025 StayEase – Nền tảng tìm phòng trọ thông minh tại Việt Nam.
          </p>
        </div>
      </footer>
    </div>
  );
}
