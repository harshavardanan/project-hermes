import { useState, useEffect } from "react";
import { HermesClient } from "./sdk/core/HermesClient";
import { useMessages } from "./sdk/react/hooks/useMessages";
import { useRooms } from "./sdk/react/hooks/useRooms";
import { useTyping } from "./sdk/react/hooks/useTyping";
import { usePresence } from "./sdk/react/hooks/usePresence";
import { useReadReceipts } from "./sdk/react/hooks/useReadReceipts";
import { useUpload } from "./sdk/react/hooks/useUpload";
import { MessageList } from "./sdk/react/components/MessageList";
import { ChatInput } from "./sdk/react/components/ChatInput";
import { RoomList } from "./sdk/react/components/RoomList";
import { TypingIndicator } from "./sdk/react/components/TypingIndicator";
import { OnlineBadge } from "./sdk/react/components/OnlineBadge";
import type { Room, HermesUser, Message } from "./sdk/types/index";

const ENDPOINT = import.meta.env.VITE_ENDPOINT;
const API_KEY = "EA279B99DAC56FA1EDC180B121BD816AE303E1E8";
const SECRET = "PGjvKe3yj2PB9bX5TkdVBtShDG1shQ";

const C = {
  bg: "#000000",
  bgPanel: "#0a0a0a",
  bgCard: "#0f0f0f",
  border: "#1a2e05", 
  primary: "#39ff14", 
  primaryDim: "rgba(57, 255, 20, 0.1)",
  primaryGlow: "0 0 25px rgba(57,255,20,0.25)",
  danger: "#ef4444",
  dangerDim: "rgba(239, 68, 68, 0.1)",
  text: "#ffffff",
  textMuted: "#94a3b8",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', sans-serif; }

  @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
  .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(57,255,20,0.3); }

  .h-btn { transition: all 0.2s; }
  .h-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .h-btn:active { transform: scale(0.98); }

  .glass {
    background: rgba(10, 10, 10, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(57, 255, 20, 0.1);
  }

  /* ── MessageList overrides ── */
  .hermes-message-list { background: transparent !important; padding: 20px !important; }
  .hermes-message--own .hermes-message__bubble {
    background: rgba(57, 255, 20, 0.05) !important;
    border: 1px solid rgba(57, 255, 20, 0.2) !important;
    border-radius: 12px 12px 4px 12px !important; color: ${C.text} !important;
  }
  .hermes-message--other .hermes-message__bubble {
    background: ${C.bgCard} !important;
    border: 1px solid ${C.border} !important;
    border-radius: 12px 12px 12px 4px !important; color: ${C.text} !important;
  }
  .hermes-message__text { font-family: 'Inter', sans-serif !important; font-size: 14px !important; line-height: 1.6 !important; font-weight: 400 !important; }
  .hermes-message__time { color: ${C.textMuted} !important; font-size: 10px !important; font-weight: 500 !important; letter-spacing: 0.05em !important; }
  .hermes-message-list__empty { color: ${C.textMuted} !important; font-weight: 500 !important; font-family: 'Inter', sans-serif !important; }
  .hermes-load-more {
    background: ${C.bgCard} !important; border: 1px solid ${C.border} !important;
    color: ${C.textMuted} !important; border-radius: 12px !important; font-family: 'Inter', sans-serif !important;
  }
  .hermes-message__reply-preview { border-left: 2px solid rgba(57,255,20,0.4) !important; }

  /* ── ChatInput overrides ── */
  .hermes-chat-input { background: transparent !important; border-top: none !important; }
  .hermes-chat-input textarea, .hermes-chat-input input {
    background: ${C.bgCard} !important; border: 1px solid ${C.border} !important;
    border-radius: 12px !important; color: ${C.text} !important;
    font-family: 'Inter', sans-serif !important; font-size: 14px !important;
    padding: 12px 16px !important;
  }
  .hermes-chat-input textarea:focus, .hermes-chat-input input:focus {
    border-color: rgba(57,255,20,0.4) !important;
    outline: none !important;
    box-shadow: 0 0 15px rgba(57,255,20,0.1) !important;
  }
  .hermes-chat-input textarea::placeholder { color: ${C.textMuted} !important; letter-spacing: normal !important; }
  .hermes-chat-input button {
    background: ${C.primary} !important; border: none !important;
    border-radius: 12px !important; color: #000 !important;
    font-weight: 700 !important; transition: all 0.2s !important; font-family: 'Inter', sans-serif !important;
  }
  .hermes-chat-input button:hover { box-shadow: ${C.primaryGlow} !important; filter: brightness(1.1) !important; }
  
  /* ── TypingIndicator override ── */
  .hermes-typing-indicator { font-family: 'Inter', sans-serif !important; color: ${C.primary} !important; font-size: 11px !important; font-weight: 500 !important; letter-spacing: normal !important; }
`;

function Avatar({
  name,
  size = 40,
  online = false,
}: {
  name: string;
  size?: number;
  online?: boolean;
}) {
  return (
    <div
      style={{ position: "relative", flexShrink: 0, width: size, height: size }}
    >
      <div
        style={{
          width: size,
          height: size,
          background: C.primaryDim,
          border: `1px solid rgba(57,255,20,0.2)`,
          color: C.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: size * 0.4,
          borderRadius: "12px",
        }}
      >
        {name?.[0]?.toUpperCase() ?? "?"}
      </div>
      {online && (
        <span
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            display: "flex",
            height: 12,
            width: 12,
          }}
        >
          <span
            className="animate-ping"
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              borderRadius: "50%",
              background: C.primary,
              opacity: 0.75,
            }}
          ></span>
          <span
            style={{
              position: "relative",
              height: 12,
              width: 12,
              borderRadius: "50%",
              background: C.primary,
              border: `2px solid ${C.bgCard}`,
            }}
          ></span>
        </span>
      )}
    </div>
  );
}

function Splash({ label, error }: { label: string; error?: boolean }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: C.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 500,
          background: "rgba(57,255,20,0.05)",
          filter: "blur(120px)",
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div style={{ zIndex: 1, textAlign: "center" }}>
        {}
        {!error && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              background: C.primaryDim,
              border: `1px solid rgba(57,255,20,0.2)`,
              color: C.primary,
              fontSize: 10,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 32,
            }}
          >
            <span
              style={{
                position: "relative",
                display: "flex",
                height: 8,
                width: 8,
              }}
            >
              <span
                className="animate-ping"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  borderRadius: "50%",
                  background: C.primary,
                  opacity: 0.75,
                }}
              ></span>
              <span
                style={{
                  position: "relative",
                  height: 8,
                  width: 8,
                  borderRadius: "50%",
                  background: C.primary,
                }}
              ></span>
            </span>
            System Status: Optimal
          </div>
        )}

        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: C.text,
            letterSpacing: "-0.02em",
          }}
        >
          Project{" "}
          <span style={{ color: C.primary, textShadow: C.primaryGlow }}>
            Hermes
          </span>
        </div>

        <div
          style={{
            fontSize: 16,
            color: C.textMuted,
            marginTop: 16,
            fontWeight: 500,
          }}
        >
          {error ? <span style={{ color: C.danger }}>{label}</span> : label}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [client, setClient] = useState<HermesClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<HermesUser | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    let activeClient: HermesClient | null = null;
    let userId = sessionStorage.getItem("hermes_userId");
    let displayName = sessionStorage.getItem("hermes_displayName");

    if (!userId || !displayName) {
      const name = window.prompt("Project Hermes\nEnter Developer Name:");
      displayName = name?.trim() || `Dev_${Math.floor(Math.random() * 9999)}`;
      userId = displayName.toLowerCase().replace(/\s+/g, "_");
      sessionStorage.setItem("hermes_userId", userId);
      sessionStorage.setItem("hermes_displayName", displayName);
    }

    const init = async () => {
      setConnecting(true);
      try {
        const res = await fetch(`${ENDPOINT}/hermes/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: API_KEY,
            secret: SECRET,
            userId,
            displayName,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Auth failed");

        const user: HermesUser = {
          userId: data.user.hermesUserId,
          displayName: data.user.displayName,
          avatar: data.user.avatar,
          email: data.user.email,
        };

        activeClient = new HermesClient({
          endpoint: ENDPOINT,
          token: data.token,
        });
        activeClient.user = user;
        await activeClient.connect();

        try {
          const ur = await fetch(`${ENDPOINT}/hermes/users`, {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const ud = await ur.json();
          if (ud.success) setAllUsers(ud.users || []);
        } catch (e) {
          console.warn("users fetch failed", e);
        }

        setCurrentUser(user);
        setClient(activeClient);
        setConnected(true);
      } catch (err: any) {
        setConnError(err.message);
      } finally {
        setConnecting(false);
      }
    };

    init();
    return () => {
      activeClient?.disconnect();
    };
  }, []);

  if (connecting) return <Splash label="Authenticating session..." />;
  if (connError)
    return <Splash label={`Failed to connect: ${connError}`} error />;
  if (!connected || !currentUser || !client)
    return <Splash label="Initializing..." />;

  return (
    <ChatShell
      client={client}
      currentUser={currentUser}
      allUsers={allUsers}
      activeRoom={activeRoom}
      setActiveRoom={setActiveRoom}
      replyingTo={replyingTo}
      setReplyingTo={setReplyingTo}
    />
  );
}

function ChatShell({
  client,
  currentUser,
  allUsers,
  activeRoom,
  setActiveRoom,
  replyingTo,
  setReplyingTo,
}: any) {
  const {
    rooms,
    loading: roomsLoading,
    createDirect,
    createGroup,
  } = useRooms(client);
  const { isOnline } = usePresence(client);
  const {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
  } = useMessages(client, activeRoom?._id ?? null);
  const { typingText, startTyping, stopTyping } = useTyping(
    client,
    activeRoom?._id ?? null,
  );
  const { markSeen } = useReadReceipts(client, activeRoom?._id ?? null);
  const { sendFile, uploading } = useUpload(client);

  useEffect(() => {
    if (!activeRoom || messages.length === 0) return;
    markSeen(messages[messages.length - 1]._id);
  }, [messages, activeRoom]);

  const getRoomName = (room: Room) => {
    if (room.type === "group") return room.name ?? "Channel";
    const otherId = room.members.find((m) => m !== currentUser.userId);
    const other = allUsers.find((u) => u._id === otherId);
    return other?.displayName ?? "Direct Message";
  };

  const handleCreateDirect = async () => {
    const others = allUsers.filter((u) => u._id !== currentUser.userId);
    if (!others.length) return alert("No other users found.");
    const list = others.map((u, i) => `[${i + 1}] ${u.displayName}`).join("\n");
    const input = window.prompt(`Start DM with:\n\n${list}\n\nEnter number:`);
    const idx = parseInt(input ?? "") - 1;
    if (isNaN(idx) || !others[idx]) return;
    try {
      const room = await createDirect({ targetUserId: others[idx]._id });
      setActiveRoom(room);
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    }
  };

  const handleCreateGroup = async () => {
    const name = window.prompt("Group Name:");
    if (!name?.trim()) return;
    const others = allUsers.filter((u) => u._id !== currentUser.userId);
    const list = others.map((u, i) => `[${i + 1}] ${u.displayName}`).join("\n");
    const input = window.prompt(`Add members (comma-separated):\n\n${list}`);
    const ids = input?.split(",").map((s) => parseInt(s.trim()) - 1) ?? [];
    const memberIds = ids.filter((i) => others[i]).map((i) => others[i]._id);
    if (!memberIds.length) return;
    try {
      const room = await createGroup({ name: name.trim(), memberIds });
      setActiveRoom(room);
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: C.bg,
        color: C.text,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "30%",
          width: 800,
          height: 600,
          background: "rgba(57,255,20,0.03)",
          filter: "blur(120px)",
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {}
      <div
        className="glass"
        style={{
          width: 280,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: `1px solid ${C.border}`,
          zIndex: 10,
        }}
      >
        {}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}
          >
            Project{" "}
            <span style={{ color: C.primary, textShadow: C.primaryGlow }}>
              Hermes
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px",
              background: C.bgCard,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
            }}
          >
            <Avatar name={currentUser.displayName} size={36} online />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentUser.displayName}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                {allUsers.length} Team Members
              </div>
            </div>
          </div>
        </div>

        {}
        <div style={{ display: "flex", gap: 8, padding: "16px 20px 8px" }}>
          <button
            className="h-btn"
            onClick={handleCreateDirect}
            style={{
              flex: 1,
              padding: "8px",
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.text,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            New DM
          </button>
          <button
            className="h-btn"
            onClick={handleCreateGroup}
            style={{
              flex: 1,
              padding: "8px",
              background: C.primaryDim,
              border: `1px solid rgba(57,255,20,0.2)`,
              borderRadius: 8,
              color: C.primary,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            New Group
          </button>
        </div>

        {}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          <div
            style={{
              padding: "8px",
              fontSize: 11,
              fontWeight: 600,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Channels
          </div>

          {roomsLoading ? (
            <div style={{ padding: 16, fontSize: 12, color: C.textMuted }}>
              Loading...
            </div>
          ) : rooms.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                fontSize: 12,
                color: C.textMuted,
              }}
            >
              No channels yet.
            </div>
          ) : (
            rooms.map((room) => {
              const isActive = room._id === activeRoom?._id;
              const name = getRoomName(room);
              const otherId =
                room.type === "direct"
                  ? room.members.find((m) => m !== currentUser.userId)
                  : null;

              return (
                <div
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: isActive ? C.primaryDim : "transparent",
                    borderRadius: 8,
                    transition: "all 0.15s",
                    marginBottom: 2,
                  }}
                >
                  <Avatar
                    name={name}
                    size={36}
                    online={otherId ? isOnline(otherId) : false}
                  />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? C.primary : C.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginTop: 2,
                      }}
                    >
                      {(room.lastMessage as any)?.text ?? "Say hello..."}
                    </div>
                  </div>
                  {room.unreadCount > 0 && (
                    <span
                      style={{
                        background: C.primary,
                        color: "#000",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 999,
                      }}
                    >
                      {room.unreadCount > 99 ? "99+" : room.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {}
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", zIndex: 1 }}
      >
        {activeRoom ? (
          <>
            {}
            <div
              className="glass"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <Avatar name={getRoomName(activeRoom)} size={44} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {getRoomName(activeRoom)}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                  {activeRoom.type === "group"
                    ? `${activeRoom.members.length} members`
                    : isOnline(
                          activeRoom.members.find(
                            (m) => m !== currentUser.userId,
                          ) ?? "",
                        )
                      ? "Active now"
                      : "Offline"}
                </div>
              </div>
            </div>

            {}
            <div
              style={{ flex: 1, overflow: "hidden", background: "transparent" }}
            >
              <MessageList
                messages={messages}
                currentUser={currentUser}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={loadMore}
                onEdit={editMessage}
                onDelete={deleteMessage}
                onReact={addReaction}
                onReply={setReplyingTo}
                autoScroll
              />
            </div>

            <TypingIndicator typingText={typingText} />

            {}
            <div
              className="glass"
              style={{
                padding: "16px 24px",
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <ChatInput
                onSendText={async (text) => {
                  await sendMessage({
                    type: "text",
                    text,
                    replyTo: replyingTo?._id,
                  });
                  setReplyingTo(null);
                  stopTyping();
                }}
                onSendFile={async (file) => {
                  if (!activeRoom) return;
                  await sendFile(activeRoom._id, file, replyingTo?._id);
                  setReplyingTo(null);
                }}
                onTypingStart={startTyping}
                onTypingStop={stopTyping}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                disabled={uploading}
                placeholder={uploading ? "Uploading..." : "Message channel..."}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                background: C.primaryDim,
                border: `1px solid rgba(57,255,20,0.2)`,
                color: C.primary,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span
                style={{
                  position: "relative",
                  display: "flex",
                  height: 8,
                  width: 8,
                }}
              >
                <span
                  className="animate-ping"
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    borderRadius: "50%",
                    background: C.primary,
                    opacity: 0.75,
                  }}
                ></span>
                <span
                  style={{
                    position: "relative",
                    height: 8,
                    width: 8,
                    borderRadius: "50%",
                    background: C.primary,
                  }}
                ></span>
              </span>
              Connected
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>
              Select a channel
            </div>
            <div style={{ fontSize: 14, color: C.textMuted }}>
              Choose from the sidebar or start a new conversation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
