import { useState, useEffect, useRef } from "react";
import { HermesClient } from "./sdk/index";
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

// ── Config ────────────────────────────────────────────────────────────────────
// Replace these with real values from your Project dashboard
const CONFIG = {
  endpoint: "http://localhost:8080",
  apiKey: "800627BD692EC003DD0CA114AD72FD10875DB343",
  secret: "teA9gQUouAtHAckqisyC3o4oVqySXg",
  userId: "6999493feb9558b700ef170a",
};

// ── Singleton client ──────────────────────────────────────────────────────────
const client = new HermesClient(CONFIG);

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<HermesUser | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // ── Connect on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    setConnecting(true);
    client
      .connect()
      .then((user) => {
        setCurrentUser(user);
        setConnected(true);
      })
      .catch((err) => setConnError(err.message))
      .finally(() => setConnecting(false));

    return () => {
      client.disconnect();
    };
  }, []);

  if (connecting) return <Splash label="Connecting to Hermes..." />;
  if (connError)
    return <Splash label={`Connection failed: ${connError}`} error />;
  if (!connected || !currentUser) return <Splash label="Initializing..." />;

  return (
    <ChatApp
      client={client}
      currentUser={currentUser}
      activeRoom={activeRoom}
      setActiveRoom={setActiveRoom}
      replyingTo={replyingTo}
      setReplyingTo={setReplyingTo}
    />
  );
}

// ── Chat App ──────────────────────────────────────────────────────────────────
function ChatApp({
  client,
  currentUser,
  activeRoom,
  setActiveRoom,
  replyingTo,
  setReplyingTo,
}: {
  client: HermesClient;
  currentUser: HermesUser;
  activeRoom: Room | null;
  setActiveRoom: (room: Room) => void;
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
}) {
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

  // Mark seen when messages load
  useEffect(() => {
    if (!activeRoom || messages.length === 0) return;
    const last = messages[messages.length - 1];
    markSeen(last._id);
  }, [messages, activeRoom]);

  const handleSendText = async (text: string) => {
    await sendMessage({
      type: "text",
      text,
      replyTo: replyingTo?._id,
    });
    setReplyingTo(null);
    stopTyping();
  };

  const handleSendFile = async (file: File) => {
    if (!activeRoom) return;
    await sendFile(activeRoom._id, file, replyingTo?._id);
    setReplyingTo(null);
  };

  const handleCreateDirect = async () => {
    const targetId = window.prompt("Enter target user ID:");
    if (!targetId?.trim()) return;
    const room = await createDirect({ targetUserId: targetId.trim() });
    setActiveRoom(room);
  };

  const handleCreateGroup = async () => {
    const name = window.prompt("Group name:");
    if (!name?.trim()) return;
    const ids = window.prompt("Member IDs (comma separated):");
    const memberIds =
      ids
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? [];
    const room = await createGroup({ name: name.trim(), memberIds });
    setActiveRoom(room);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar ── */}
      <div
        style={{
          width: 300,
          borderRight: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* User header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#0084ff",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {currentUser.displayName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0 }}>
              <OnlineBadge isOnline={true} size={10} />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {currentUser.displayName}
            </div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>Online</div>
          </div>
        </div>

        {/* Room list */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <RoomList
            rooms={rooms}
            activeRoomId={activeRoom?._id}
            currentUserId={currentUser.userId}
            loading={roomsLoading}
            onSelectRoom={setActiveRoom}
            onCreateDirect={handleCreateDirect}
            onCreateGroup={handleCreateGroup}
            renderAvatar={(room) => (
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: room.type === "group" ? "#7c3aed" : "#0084ff",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {room.type === "group"
                  ? (room.name?.[0]?.toUpperCase() ?? "G")
                  : "D"}
              </div>
            )}
          />
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {activeRoom ? (
          <>
            {/* Room header */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    activeRoom.type === "group" ? "#7c3aed" : "#0084ff",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  position: "relative",
                }}
              >
                {activeRoom.type === "group"
                  ? (activeRoom.name?.[0]?.toUpperCase() ?? "G")
                  : "D"}
                {activeRoom.type === "direct" && (
                  <div style={{ position: "absolute", bottom: -1, right: -1 }}>
                    <OnlineBadge
                      isOnline={isOnline(
                        activeRoom.members.find(
                          (m) => m !== currentUser.userId,
                        ) ?? "",
                      )}
                      size={10}
                    />
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {activeRoom.type === "group"
                    ? activeRoom.name
                    : "Direct Message"}
                </div>
                <div style={{ fontSize: 11, opacity: 0.5 }}>
                  {activeRoom.type === "group"
                    ? `${activeRoom.members.length} members`
                    : isOnline(
                          activeRoom.members.find(
                            (m) => m !== currentUser.userId,
                          ) ?? "",
                        )
                      ? "Online"
                      : "Offline"}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: "hidden" }}>
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

            {/* Typing indicator */}
            <TypingIndicator typingText={typingText} />

            {/* Chat input */}
            <ChatInput
              onSendText={handleSendText}
              onSendFile={handleSendFile}
              onTypingStart={startTyping}
              onTypingStop={stopTyping}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              disabled={uploading}
              placeholder={uploading ? "Uploading..." : "Type a message..."}
            />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.4,
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 40 }}>💬</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              Select a conversation
            </div>
            <div style={{ fontSize: 13 }}>
              or start a new one from the sidebar
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Splash screen ─────────────────────────────────────────────────────────────
function Splash({ label, error }: { label: string; error?: boolean }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        fontFamily: "sans-serif",
      }}
    >
      {!error && (
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #0084ff",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      )}
      {error && <div style={{ fontSize: 32 }}>⚠️</div>}
      <div
        style={{
          fontSize: 14,
          opacity: 0.6,
          color: error ? "#ef4444" : "inherit",
        }}
      >
        {label}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
