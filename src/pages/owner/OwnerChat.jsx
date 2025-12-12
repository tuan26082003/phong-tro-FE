import { useEffect, useState, useRef } from "react";
import {
  Input,
  Button,
  List,
  Avatar,
  message,
  Spin,
  Empty,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

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
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const bottomRef = useRef(null);
  const stompClientRef = useRef(null);
  const currentConvRef = useRef(null);

  // Lấy user ID từ localStorage
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        return userData.user?.id || null;
      }
    } catch (e) {
      console.error("Parse user error:", e);
    }
    return null;
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    currentConvRef.current = currentConv;
  }, [currentConv]);

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
  // WEBSOCKET SETUP (chỉ phụ thuộc currentUserId)
  // =====================================================
  useEffect(() => {
    if (!currentUserId) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("WebSocket Connected as userId:", currentUserId);

        // subscribe topic riêng cho user hiện tại
        // BE gửi vào /topic/user.{receiverId}
        client.subscribe(`/topic/user.${currentUserId}`, (messageFrame) => {
          const newMessage = JSON.parse(messageFrame.body);
          console.log("Received message:", newMessage);

          const conv = currentConvRef.current;

          // Nếu đang mở một cuộc trò chuyện, thì reload tin nhắn từ server
          if (conv) {
            // gọi lại API để đảm bảo đồng bộ với DB
            loadMessages(conv.id, 0);
          }

          // Reload list hội thoại để update lastMessage
          loadConversations();
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // =====================================================
  // SEARCH USERS
  // =====================================================
  const handleSearchUser = async () => {
    if (!searchUser.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await axiosClient.get("/api/user", {
        params: {
          page: 0,
          size: 12,
          search: searchUser.trim(),
        },
      });
      setSearchResults(res.data.data || []);
    } catch (err) {
      logErr(err, "Không tìm được người dùng");
    } finally {
      setSearching(false);
    }
  };

  // =====================================================
  // LOAD CONVERSATIONS
  // =====================================================
  const loadConversations = async () => {
    if (!currentUserId) {
      message.warning("Vui lòng đăng nhập để sử dụng chat");
      return;
    }

    try {
      setLoadingConv(true);
      const res = await axiosClient.get("/api/chat/conversations");
      setConversations(res.data.data || []);
    } catch (err) {
      logErr(err, "Không tải hội thoại");
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // =====================================================
  // CREATE CONVERSATION
  // =====================================================
  const createConversation = async (receiverId) => {
    if (!currentUserId) {
      message.warning("Vui lòng đăng nhập để chat");
      return;
    }

    if (receiverId === currentUserId) {
      message.warning("Không thể chat với chính mình");
      return;
    }

    try {
      const res = await axiosClient.post("/api/chat/conversation", {
        user1Id: currentUserId,
        user2Id: receiverId,
      });

      message.success("Bắt đầu cuộc trò chuyện");

      await loadConversations();

      if (res.data && res.data.data) {
        const newConv = res.data.data;
        openConversation(newConv);
      }
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
    currentConvRef.current = conv;
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
  // SEND MESSAGE VIA WEBSOCKET
  // =====================================================
  const sendMessage = async () => {
    if (!inputMsg.trim() || !currentConv || !currentUserId) return;
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      message.error("WebSocket chưa kết nối");
      return;
    }

    const receiverId =
      currentConv.user1Id === currentUserId
        ? currentConv.user2Id
        : currentConv.user1Id;

    const messageContent = inputMsg.trim();
    setInputMsg("");

    const tempMessage = {
      id: Date.now(),
      conversationId: currentConv.id,
      senderId: currentUserId,
      receiverId: receiverId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      seen: false,
    };

    // optimistic update (cho mình thấy luôn)
    setMessagesList((prev) => [...prev, tempMessage]);

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const payload = {
        conversationId: currentConv.id,
        senderId: currentUserId,
        receiverId: receiverId,
        content: messageContent,
      };

      stompClientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      logErr(err, "Không thể gửi tin nhắn");
      setMessagesList((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
  };

  const loadMore = () => {
    if (!currentConv) return;
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
      <div
        style={{
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            padding: 15,
            borderBottom: "1px solid #eee",
            margin: 0,
          }}
        >
          Hội thoại
        </h3>

        {/* SEARCH USER TO START CHAT */}
        <div
          style={{
            padding: 10,
            borderBottom: "1px solid #eee",
          }}
        >
          <Input.Search
            placeholder="Tìm người dùng để chat..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            onSearch={handleSearchUser}
            loading={searching}
            prefix={<SearchOutlined />}
            enterButton="Tìm"
          />

          {searchResults.length > 0 && (
            <List
              size="small"
              style={{
                marginTop: 8,
                maxHeight: 200,
                overflowY: "auto",
                border: "1px solid #f0f0f0",
                borderRadius: 4,
              }}
              dataSource={searchResults}
              renderItem={(user) => (
                <List.Item
                  style={{
                    cursor: "pointer",
                    padding: "8px 12px",
                    fontSize: 13,
                  }}
                  onClick={() => {
                    createConversation(user.id);
                    setSearchResults([]);
                    setSearchUser("");
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar size="small">
                        {user.fullName ? user.fullName[0] : "U"}
                      </Avatar>
                    }
                    title={
                      <span style={{ fontSize: 13 }}>{user.fullName}</span>
                    }
                    description={
                      <span style={{ fontSize: 12 }}>{user.email}</span>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        {/* CONVERSATIONS LIST */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingConv ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <Spin />
            </div>
          ) : conversations.length === 0 ? (
            <Empty description="Chưa có hội thoại" style={{ marginTop: 40 }} />
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
                      avatar={<Avatar>{partner ? partner[0] : "U"}</Avatar>}
                      title={<b>{partner}</b>}
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </div>

      {/* RIGHT CHAT PANEL */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: 15,
            borderBottom: "1px solid #ddd",
            fontWeight: "bold",
            flexShrink: 0,
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
            minHeight: 0,
          }}
        >
          {currentConv && msgTotal > messagesList.length && (
            <Button size="small" onClick={loadMore}>
              Tải thêm
            </Button>
          )}

          {loadingMsg && messagesList.length === 0 && (
            <div style={{ textAlign: "center", padding: 20 }}>
              <Spin />
            </div>
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
              flexShrink: 0,
              background: "white",
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
