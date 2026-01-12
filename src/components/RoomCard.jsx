import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "antd";
import { EnvironmentOutlined, HomeOutlined, TeamOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { getImageUrl } from "../utils/imageHelper";
import { AuthContext } from "../context/AuthContext";

export default function RoomCard({ room = {}, loading = false }) {
  const nav = useNavigate();
  const auth = useContext(AuthContext);

  const imageUrl =
    room.images && room.images.length > 0
      ? getImageUrl(room.images[0])
      : "https://placehold.co/900x600?text=No+Image";

  return (
    <Card
      hoverable
      className="room-card"
      loading={loading}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.3s",
      }}
      bodyStyle={{ padding: 12 }}
      cover={
        <div className="room-image-wrapper">
          <img
            src={imageUrl}
            alt={room.name}
            className="room-image"
            style={{ height: 140, objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/900x600?text=Error";
            }}
          />
        </div>
      }
      onClick={() => nav(`/rooms/${room.id}`)}
    >
      <div className="room-card-body">
        <div
          style={{
            marginBottom: 8,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 15, color: "#333" }}>{room.name}</span>
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#666",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <EnvironmentOutlined style={{ fontSize: 14, flexShrink: 0 }} />
            <span
              style={{
                fontSize: 12,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {room.address}
            </span>
          </div>

          <span style={{ color: "#d9d9d9", flexShrink: 0 }}>|</span>

          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <HomeOutlined style={{ fontSize: 14 }} />
            <span>{room.area}m²</span>
          </div>

          <span style={{ color: "#d9d9d9", flexShrink: 0 }}>|</span>

          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <TeamOutlined style={{ fontSize: 14 }} />
            <span>{room.capacity} người</span>
          </div>
        </div>

        <div
          className="room-price-section"
          style={{ marginBottom: 10, paddingTop: 8, borderTop: "1px solid #f0f0f0" }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: "#d4380d" }}>
            {room.price?.toLocaleString("vi-VN") || "0"}₫
          </span>
          <span style={{ fontSize: 14, color: "#999", marginLeft: 4 }}>/tháng</span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="primary"
            style={{
              flex: 1,
              background: "#1890ff",
              borderColor: "#1890ff",
              height: 32,
              fontWeight: 500,
              borderRadius: 6,
              fontSize: 13,
            }}
            onClick={(e) => {
              e.stopPropagation();
              nav(`/rooms/${room.id}`);
            }}
          >
            Xem chi tiết
          </Button>

          <Button
            style={{
              flex: 1,
              height: 32,
              fontWeight: 500,
              borderRadius: 6,
              fontSize: 13,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!room.ownerId) {
                toast.warning("Không tìm thấy thông tin chủ trọ");
                return;
              }

              // If not logged in, open the global LoginModal managed by layout
              const isLoggedIn = !!(auth && auth.user && (auth.user.accessToken || auth.user.token || auth.user.user));
              localStorage.setItem("chatWithUserId", room.ownerId);

              if (!isLoggedIn) {
                // dispatch event that layouts listen to
                try {
                  window.dispatchEvent(new CustomEvent("open-login-modal", { detail: { action: "chat", initialMode: "login" } }));
                } catch (e) {
                  // fallback: open /login route
                  nav("/login");
                }
                return;
              }

              nav("/chat");
            }}
          >
            Nhắn tin
          </Button>
        </div>
      </div>
    </Card>
  );
}
