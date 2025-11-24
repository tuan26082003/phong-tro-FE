import { useEffect, useState, useRef } from "react";
import {
  Input,
  Button,
  List,
  Avatar,
  message,
  Spin,
  Empty,
  Select,
} from "antd";

import axiosClient from "../../api/axiosClient";

const API = "/api/chat";

export default function OwnerChat() {
  const [conversations, setConversations] = useState([]);
  const [currentConv, setCurrentConv] = useState(null);

  const [messagesList, setMessagesList] = useState([]);
  const [msgPage, setMsgPage] = useState(0);
  const [msgTotal, setMsgTotal] = useState(0);

  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const [inputMsg, setInputMsg] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  const bottomRef = useRef(null);

  // CHỦ TRỌ ID (login)
  const currentUserId = 1;

  // =====================================================
  // LOG ERROR
  // =====================================================
  const logErr = (err, msgText) => {
    console.error("=== CHAT ERROR ===");
    console.error("URL:", err.config?.url);
    console.error("METHOD:", err.config?.method);
    console.error("REQUEST DATA:", err.config?.data);

    if (err.response) {
      console.error("STATUS:", err.response.status);
      console.error("DATA:", err.response.data);
      message.error(msgText || err.response.data.message || "Lỗi server");
    } else if (err.request) {
      console.error("NO RESPONSE", err.request);
      message.error("Không nhận được phản hồi từ server");
    } else {
      console.error("REQUEST ERROR", err.message);
      message.error(err.message);
    }
  };

  // =====================================================
  // LOAD USERS
  // =====================================================
  const loadUsers = async () => {
    try {
      const res = await axiosClient.get("/api/user?page=0&size=9999");
      setAllUsers(res.data.data || []);
    } catch (err) {
      logErr(err, "Không tải được danh sách người dùng");
    }
  };

  // =====================================================
  // LOAD CONVERSATIONS
  // =====================================================
  const loadConversations = async () => {
    try {
      setLoadingConv(true);
      const res = await axiosClient.get(
        `/api/chat/conversations?userId=${currentUserId}`
      );

      setConversations(res.data.data || []);
    } catch (err) {
      logErr(err, "Không tải hội thoại");
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadConversations();
  }, []);

  // =====================================================
  // CREATE CONVERSATION
  // =====================================================
  const createConversation = async (receiverId) => {
    try {
      await axiosClient.post("/api/chat/conversation", {
        user1Id: currentUserId,
        user2Id: receiverId,
      });

      message.success("Bắt đầu cuộc trò chuyện");
      loadConversations();
    } catch (err) {
      logErr(err, "Không thể tạo cuộc trò chuyện");
    }
  };

  // =====================================================
  // LOAD MESSAGES
  // =====================================================
  const loadMessages = async (convId, page = 0) => {
    try {
      setLoadingMsg(true);

      const res = await axiosClient.get(`${API}/messages`, {
        params: {
          conversationId: convId,
          page,
          size: 20,
        },
      });

      const list = res.data.data || [];

      if (page === 0) {
        setMessagesList(list.reverse());
      } else {
        setMessagesList((prev) => [...list.reverse(), ...prev]);
      }

      setMsgTotal(res.data.totalElements);
      setMsgPage(page);

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      }, 150);
    } catch (err) {
      logErr(err, "Không tải tin nhắn");
    } finally {
      setLoadingMsg(false);
    }
  };

  // =====================================================
  // ON SELECT CONVERSATION
  // =====================================================
  const openConversation = (conv) => {
    setCurrentConv(conv);
    setMessagesList([]);
    setMsgPage(0);
    loadMessages(conv.id, 0);
    markSeen(conv.id);
  };

  // =====================================================
  // MARK SEEN
  // =====================================================
  const markSeen = async (conversationId) => {
    try {
      await axiosClient.post("/api/chat/seen", {
        conversationId,
        userId: currentUserId,
      });
    } catch (err) {
      logErr(err, "Không thể đánh dấu xem");
    }
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================
  const sendMessage = async () => {
    if (!inputMsg.trim() || !currentConv) return;

    try {
      await axiosClient.post("/api/chat/send", {
        senderId: currentUserId,
        receiverId:
          currentConv.user1Id === currentUserId
            ? currentConv.user2Id
            : currentConv.user1Id,
        content: inputMsg,
      });

      setInputMsg("");
      loadMessages(currentConv.id, 0);
    } catch (err) {
      logErr(err, "Không thể gửi tin nhắn");
    }
  };

  const loadMore = () => {
    if ((msgPage + 1) * 20 >= msgTotal) return;
    loadMessages(currentConv.id, msgPage + 1);
  };

  // =====================================================
  // RENDER UI
  // =====================================================
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        height: "80vh",
        border: "1px solid #ddd",
      }}
    >
      {/* LEFT SIDEBAR */}
      <div style={{ borderRight: "1px solid #ddd", overflowY: "auto" }}>
        <h3 style={{ padding: 15, borderBottom: "1px solid #eee" }}>
          Hội thoại
        </h3>

        {/* SELECT USER TO START CHAT */}
        <div style={{ padding: 10, borderBottom: "1px solid #eee" }}>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn người dùng để chat"
            onChange={(id) => createConversation(id)}
          >
            {allUsers.map((u) => (
              <Select.Option key={u.id} value={u.id}>
                {u.fullName} – {u.email}
              </Select.Option>
            ))}
          </Select>
        </div>

        {loadingConv ? (
          <Spin />
        ) : conversations.length === 0 ? (
          <Empty description="Không có hội thoại" style={{ marginTop: 40 }} />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={conversations}
            renderItem={(item) => {
              const partner =
                item.user1Id === currentUserId
                  ? item.user2Name
                  : item.user1Name;

              return (
                <List.Item
                  onClick={() => openConversation(item)}
                  style={{
                    cursor: "pointer",
                    padding: "12px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    background:
                      currentConv?.id === item.id ? "#f5f5f5" : "white",
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{partner[0]}</Avatar>}
                    title={<b>{partner}</b>}
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>

      {/* RIGHT CHAT PANEL */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: 15,
            borderBottom: "1px solid #ddd",
            fontWeight: "bold",
          }}
        >
          {currentConv ? (
            currentConv.user1Id === currentUserId ? (
              currentConv.user2Name
            ) : (
              currentConv.user1Name
            )
          ) : (
            <>Chọn cuộc trò chuyện</>
          )}
        </div>

        {/* MESSAGE LIST */}
        <div
          style={{
            padding: 20,
            flex: 1,
            overflowY: "auto",
            background: "#fafafa",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {currentConv && msgTotal > messagesList.length && (
            <Button size="small" onClick={loadMore}>
              Tải thêm
            </Button>
          )}

          {messagesList.map((m) => {
            const mine = m.senderId === currentUserId;

            return (
              <div
                key={m.id}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  background: mine ? "#1677ff" : "#e4e6eb",
                  color: mine ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: 10,
                  maxWidth: "60%",
                  marginBottom: 12,
                }}
              >
                {m.content}

                <div
                  style={{
                    fontSize: 11,
                    marginTop: 4,
                    opacity: 0.7,
                    textAlign: mine ? "right" : "left",
                  }}
                >
                  {new Date(m.createdAt).toLocaleString()}
                  {m.seen && mine && (
                    <span style={{ marginLeft: 6 }}>(đã xem)</span>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* MESSAGE INPUT */}
        {currentConv && (
          <div
            style={{
              padding: 10,
              borderTop: "1px solid #ddd",
              display: "flex",
              gap: 10,
            }}
          >
            <Input
              placeholder="Nhập tin nhắn..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onPressEnter={sendMessage}
            />
            <Button type="primary" onClick={sendMessage}>
              Gửi
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
