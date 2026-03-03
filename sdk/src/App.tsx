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

const ENDPOINT = "http://localhost:8080";
const API_KEY = "800627BD692EC003DD0CA114AD72FD10875DB343";
const SECRET = "teA9gQUouAtHAckqisyC3o4oVqySXg";

const C = {
  bg: "#07090d",
  bgPanel: "#0b0e14",
  bgCard: "#0f1520",
  border: "#161f2e",
  cyan: "#00ffe7",
  cyanDim: "rgba(0,255,231,0.08)",
  cyanGlow: "0 0 20px rgba(0,255,231,0.4), 0 0 40px rgba(0,255,231,0.15)",
  pink: "#ff2d7a",
  pinkDim: "rgba(255,45,122,0.08)",
  pinkGlow: "0 0 20px rgba(255,45,122,0.4)",
  text: "#b8ccd8",
  textDim: "#3a5060",
  textMid: "#6a8090",
};

const cyberClip =
  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))";
const cyberClipS =
  "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; }

  @keyframes flicker {
    0%,89%,91%,93%,100% { opacity: 1; }
    90% { opacity: 0.5; } 92% { opacity: 0.9; }
  }
  @keyframes glow-pulse {
    0%,100% { box-shadow: 0 0 8px rgba(0,255,231,0.4); }
    50%      { box-shadow: 0 0 22px rgba(0,255,231,0.9), 0 0 40px rgba(0,255,231,0.3); }
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes loader { 0%{width:0%} 100%{width:100%} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(0,255,231,0.25); }

  .h-room:hover  { background: rgba(0,255,231,0.03) !important; }
  .h-btn:hover   { filter: brightness(1.4); }

  /* ── MessageList overrides ── */
  .hermes-message-list { background: ${C.bg} !important; padding: 16px 20px !important; }
  .hermes-message--own .hermes-message__bubble {
    background: rgba(0,255,231,0.07) !important;
    border: 1px solid rgba(0,255,231,0.22) !important;
    border-radius: 0 !important; color: ${C.text} !important;
    clip-path: polygon(0 0, calc(100%-10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100%-10px));
  }
  .hermes-message--other .hermes-message__bubble {
    background: ${C.bgCard} !important;
    border: 1px solid ${C.border} !important;
    border-radius: 0 !important; color: ${C.text} !important;
    clip-path: polygon(10px 0, 100% 0, 100% calc(100%-10px), calc(100%-10px) 100%, 0 100%, 0 10px);
  }
  .hermes-message__text  { font-family:'Share Tech Mono',monospace !important; font-size:13px !important; line-height:1.6 !important; }
  .hermes-message__time  { color:${C.textDim} !important; font-size:9px !important; letter-spacing:0.15em !important; font-family:'Share Tech Mono',monospace !important; }
  .hermes-message-list__empty { color:${C.textDim} !important; font-family:'Share Tech Mono',monospace !important; letter-spacing:0.2em !important; font-size:11px !important; }
  .hermes-load-more {
    background:${C.bgCard} !important; border:1px solid ${C.border} !important;
    color:${C.textMid} !important; font-family:'Share Tech Mono',monospace !important;
    letter-spacing:0.15em !important; border-radius:0 !important;
  }
  .hermes-message__reply-preview { border-left:2px solid rgba(0,255,231,0.4) !important; }

  /* ── ChatInput overrides ── */
  .hermes-chat-input { background:transparent !important; border-top:none !important; }
  .hermes-chat-input textarea, .hermes-chat-input input {
    background:${C.bgCard} !important; border:1px solid ${C.border} !important;
    border-radius:0 !important; color:${C.text} !important;
    font-family:'Share Tech Mono',monospace !important; font-size:13px !important;
    caret-color:${C.cyan};
  }
  .hermes-chat-input textarea:focus, .hermes-chat-input input:focus {
    border-color:rgba(0,255,231,0.35) !important;
    box-shadow:inset 0 0 30px rgba(0,255,231,0.04) !important;
    outline:none !important;
  }
  .hermes-chat-input textarea::placeholder { color:${C.textDim} !important; letter-spacing:0.1em; }
  .hermes-chat-input button {
    background:rgba(0,255,231,0.08) !important; border:1px solid rgba(0,255,231,0.4) !important;
    border-radius:0 !important; color:${C.cyan} !important;
    font-family:'Share Tech Mono',monospace !important;
    clip-path:${cyberClipS};
  }
  .hermes-chat-input button:hover { background:rgba(0,255,231,0.18) !important; box-shadow:0 0 12px rgba(0,255,231,0.35) !important; }
  .hermes-reply-preview {
    background:${C.bgCard} !important; border-left:2px solid ${C.cyan} !important;
    color:${C.textMid} !important; font-family:'Share Tech Mono',monospace !important; font-size:11px !important;
  }

  /* ── TypingIndicator override ── */
  .hermes-typing-indicator { font-family:'Share Tech Mono',monospace !important; color:${C.cyan} !important; font-size:10px !important; letter-spacing:0.2em !important; }
`;

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({
  name,
  color = C.cyan,
  size = 38,
  online = false,
}: {
  name: string;
  color?: string;
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
          background: `${color}18`,
          border: `1px solid ${color}60`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: size * 0.38,
          fontFamily: "'Orbitron', monospace",
          boxShadow: `0 0 12px ${color}30`,
          clipPath: cyberClipS,
        }}
      >
        {name?.[0]?.toUpperCase() ?? "?"}
      </div>
      {online && (
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 7,
            height: 7,
            background: C.cyan,
            boxShadow: `0 0 6px ${C.cyan}`,
            border: `1px solid ${C.bg}`,
          }}
        />
      )}
    </div>
  );
}

// ── Splash ────────────────────────────────────────────────────────────────────
function Splash({ label, error }: { label: string; error?: boolean }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 24,
        background: C.bg,
        fontFamily: "'Share Tech Mono', monospace",
        color: C.text,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{GLOBAL_CSS}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(0,255,231,0.025) 1px, transparent 1px),linear-gradient(90deg,rgba(0,255,231,0.025) 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,231,0.012) 2px,rgba(0,255,231,0.012) 4px)",
        }}
      />
      <div style={{ position: "relative", textAlign: "center" }}>
        <div
          style={{
            fontSize: 52,
            fontFamily: "'Orbitron', monospace",
            fontWeight: 900,
            color: C.cyan,
            letterSpacing: "0.3em",
            textShadow: `0 0 30px ${C.cyan}, 0 0 60px rgba(0,255,231,0.4)`,
            animation: "flicker 5s infinite",
          }}
        >
          HERMES
        </div>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.5em",
            color: C.textDim,
            marginTop: 4,
            textTransform: "uppercase",
          }}
        >
          SECURE MESH PROTOCOL v2.4
        </div>
      </div>
      {!error ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            width: 240,
          }}
        >
          <div
            style={{
              width: "100%",
              height: 2,
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                background: `linear-gradient(90deg, transparent, ${C.cyan}, ${C.cyan})`,
                animation: "loader 2s ease-in-out infinite",
              }}
            />
          </div>
          <div
            style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.25em" }}
          >
            {label}
          </div>
        </div>
      ) : (
        <div
          style={{
            color: C.pink,
            fontSize: 12,
            letterSpacing: "0.15em",
            textShadow: "0 0 20px rgba(255,45,122,0.6)",
            border: `1px solid rgba(255,45,122,0.3)`,
            padding: "10px 20px",
            background: "rgba(255,45,122,0.05)",
          }}
        >
          ✕ {label}
        </div>
      )}
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
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
      const name = window.prompt("HERMES PROTOCOL\nEnter your callsign:");
      displayName = name?.trim() || `GHOST_${Math.floor(Math.random() * 9999)}`;
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

  if (connecting) return <Splash label="ESTABLISHING SECURE CHANNEL..." />;
  if (connError)
    return <Splash label={`TRANSMISSION FAILED: ${connError}`} error />;
  if (!connected || !currentUser || !client)
    return <Splash label="INITIALIZING..." />;

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

// ── Chat Shell ────────────────────────────────────────────────────────────────
function ChatShell({
  client,
  currentUser,
  allUsers,
  activeRoom,
  setActiveRoom,
  replyingTo,
  setReplyingTo,
}: {
  client: HermesClient;
  currentUser: HermesUser;
  allUsers: any[];
  activeRoom: Room | null;
  setActiveRoom: (r: Room) => void;
  replyingTo: Message | null;
  setReplyingTo: (m: Message | null) => void;
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

  useEffect(() => {
    if (!activeRoom || messages.length === 0) return;
    markSeen(messages[messages.length - 1]._id);
  }, [messages, activeRoom]);

  const getRoomName = (room: Room) => {
    if (room.type === "group") return room.name ?? "SQUAD";
    const otherId = room.members.find((m) => m !== currentUser.userId);
    const other = allUsers.find((u) => u._id === otherId);
    return other?.displayName ?? "DIRECT";
  };

  const getRoomColor = (room: Room) =>
    room.type === "group" ? C.pink : C.cyan;

  const handleCreateDirect = async () => {
    const others = allUsers.filter((u) => u._id !== currentUser.userId);
    if (!others.length) return alert("NO OTHER AGENTS REGISTERED");
    const list = others.map((u, i) => `[${i + 1}] ${u.displayName}`).join("\n");
    const input = window.prompt(
      `OPEN DIRECT CHANNEL TO:\n\n${list}\n\nENTER NUMBER:`,
    );
    const idx = parseInt(input ?? "") - 1;
    if (isNaN(idx) || !others[idx]) return;
    try {
      const room = await createDirect({ targetUserId: others[idx]._id });
      setActiveRoom(room);
    } catch (err: any) {
      alert(`CHANNEL OPEN FAILED: ${err.message}`);
    }
  };

  const handleCreateGroup = async () => {
    const name = window.prompt("SQUAD DESIGNATION:");
    if (!name?.trim()) return;
    const others = allUsers.filter((u) => u._id !== currentUser.userId);
    if (!others.length) return alert("NO OTHER AGENTS REGISTERED");
    const list = others.map((u, i) => `[${i + 1}] ${u.displayName}`).join("\n");
    const input = window.prompt(
      `ADD SQUAD MEMBERS (comma-separated):\n\n${list}`,
    );
    const ids = input?.split(",").map((s) => parseInt(s.trim()) - 1) ?? [];
    const memberIds = ids.filter((i) => others[i]).map((i) => others[i]._id);
    if (!memberIds.length) return;
    try {
      const room = await createGroup({ name: name.trim(), memberIds });
      setActiveRoom(room);
    } catch (err: any) {
      alert(`SQUAD CREATE FAILED: ${err.message}`);
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
        fontFamily: "'Share Tech Mono', 'Courier New', monospace",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Grid BG */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `linear-gradient(rgba(0,255,231,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,231,0.025) 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Scanlines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999,
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,231,0.01) 2px,rgba(0,255,231,0.01) 4px)",
        }}
      />

      {/* ── SIDEBAR ── */}
      <div
        style={{
          width: 278,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: C.bgPanel,
          borderRight: `1px solid ${C.border}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo + user chip */}
        <div
          style={{
            padding: "18px 14px 14px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                background: C.cyanDim,
                border: `1px solid ${C.cyan}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontFamily: "'Orbitron', monospace",
                fontWeight: 900,
                color: C.cyan,
                boxShadow: C.cyanGlow,
                clipPath: cyberClipS,
                animation: "glow-pulse 3s ease-in-out infinite",
              }}
            >
              H
            </div>
            <div>
              <div
                style={{
                  fontSize: 17,
                  fontFamily: "'Orbitron', monospace",
                  fontWeight: 900,
                  color: C.cyan,
                  letterSpacing: "0.25em",
                  textShadow: `0 0 20px ${C.cyan}`,
                  animation: "flicker 6s infinite",
                }}
              >
                HERMES
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: C.textDim,
                  letterSpacing: "0.35em",
                  marginTop: 1,
                }}
              >
                SECURE MESH v2.4
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              clipPath: cyberClipS,
            }}
          >
            <Avatar
              name={currentUser.displayName}
              color={C.cyan}
              size={32}
              online
            />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.cyan,
                  letterSpacing: "0.1em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser.displayName.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: C.textDim,
                  letterSpacing: "0.2em",
                }}
              >
                ● ONLINE
              </div>
            </div>
            <div style={{ fontSize: 8, color: C.textDim }}>
              {allUsers.length} AGENTS
            </div>
          </div>
        </div>

        {/* New channel buttons */}
        <div style={{ display: "flex", gap: 6, padding: "10px 12px 4px" }}>
          {(
            [
              { label: "+ DM", color: C.cyan, fn: handleCreateDirect },
              { label: "+ SQUAD", color: C.pink, fn: handleCreateGroup },
            ] as const
          ).map(({ label, color, fn }) => (
            <button
              key={label}
              className="h-btn"
              onClick={fn}
              style={{
                flex: 1,
                padding: "7px 0",
                background: `${color}10`,
                border: `1px solid ${color}50`,
                color,
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "inherit",
                clipPath: cyberClipS,
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Section label */}
        <div
          style={{
            padding: "8px 14px 4px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{ fontSize: 8, color: C.textDim, letterSpacing: "0.35em" }}
          >
            // CHANNELS
          </span>
          <span
            style={{
              fontSize: 8,
              padding: "1px 5px",
              border: `1px solid ${C.border}`,
              color: C.textDim,
              letterSpacing: "0.1em",
            }}
          >
            {rooms.length}
          </span>
        </div>

        {/* Room items */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {roomsLoading ? (
            <div
              style={{
                padding: 16,
                fontSize: 10,
                color: C.textDim,
                letterSpacing: "0.2em",
              }}
            >
              SCANNING CHANNELS...
              <span style={{ animation: "blink 1s infinite", marginLeft: 4 }}>
                █
              </span>
            </div>
          ) : rooms.length === 0 ? (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                fontSize: 10,
                color: C.textDim,
                letterSpacing: "0.15em",
                lineHeight: 2.2,
              }}
            >
              NO CHANNELS FOUND
              <br />
              <span style={{ color: C.border }}>OPEN ONE ABOVE</span>
            </div>
          ) : (
            rooms.map((room) => {
              const isActive = room._id === activeRoom?._id;
              const color = getRoomColor(room);
              const name = getRoomName(room);
              const otherId =
                room.type === "direct"
                  ? room.members.find((m) => m !== currentUser.userId)
                  : null;

              return (
                <div
                  key={room._id}
                  className="h-room"
                  onClick={() => setActiveRoom(room)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px 9px 12px",
                    cursor: "pointer",
                    background: isActive ? `${color}07` : "transparent",
                    borderLeft: `2px solid ${isActive ? color : "transparent"}`,
                    transition: "all 0.12s",
                    position: "relative",
                  }}
                >
                  <Avatar
                    name={name}
                    color={color}
                    size={36}
                    online={otherId ? isOnline(otherId) : false}
                  />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isActive ? color : C.text,
                          letterSpacing: "0.06em",
                          textShadow: isActive ? `0 0 10px ${color}50` : "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {name.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: 7,
                          padding: "1px 4px",
                          flexShrink: 0,
                          border: `1px solid ${color}40`,
                          color: `${color}70`,
                          letterSpacing: "0.2em",
                        }}
                      >
                        {room.type === "group" ? "SQ" : "DM"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.textDim,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(room.lastMessage as any)?.text ??
                        "NO TRANSMISSIONS YET"}
                    </div>
                  </div>
                  {room.unreadCount > 0 && (
                    <span
                      style={{
                        background: C.pink,
                        color: "#000",
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "1px 5px",
                        flexShrink: 0,
                        boxShadow: "0 0 8px rgba(255,45,122,0.6)",
                      }}
                    >
                      {room.unreadCount > 99 ? "99+" : room.unreadCount}
                    </span>
                  )}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 2,
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "8px 14px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              background: C.cyan,
              boxShadow: `0 0 6px ${C.cyan}`,
              animation: "glow-pulse 2s infinite",
            }}
          />
          <span
            style={{ fontSize: 8, color: C.textDim, letterSpacing: "0.3em" }}
          >
            SYS NOMINAL
          </span>
          <span style={{ marginLeft: "auto", fontSize: 8, color: C.border }}>
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {activeRoom ? (
          <>
            {/* Topbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 20px",
                background: C.bgPanel,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  background: `${getRoomColor(activeRoom)}18`,
                  border: `1px solid ${getRoomColor(activeRoom)}60`,
                  color: getRoomColor(activeRoom),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 15,
                  fontFamily: "'Orbitron', monospace",
                  boxShadow: `0 0 14px ${getRoomColor(activeRoom)}30`,
                  clipPath: cyberClipS,
                }}
              >
                {getRoomName(activeRoom)[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Orbitron', monospace",
                      color: getRoomColor(activeRoom),
                      letterSpacing: "0.15em",
                      textShadow: `0 0 15px ${getRoomColor(activeRoom)}60`,
                    }}
                  >
                    {getRoomName(activeRoom).toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: 7,
                      padding: "2px 6px",
                      border: `1px solid ${getRoomColor(activeRoom)}50`,
                      color: `${getRoomColor(activeRoom)}80`,
                      letterSpacing: "0.25em",
                    }}
                  >
                    {activeRoom.type === "group" ? "SQUAD" : "DIRECT"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: C.textDim,
                    letterSpacing: "0.2em",
                    marginTop: 2,
                  }}
                >
                  {activeRoom.type === "group"
                    ? `${activeRoom.members.length} AGENTS ASSIGNED`
                    : isOnline(
                          activeRoom.members.find(
                            (m) => m !== currentUser.userId,
                          ) ?? "",
                        )
                      ? "● AGENT ONLINE"
                      : "○ AGENT OFFLINE"}
                </div>
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  clipPath: cyberClipS,
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontSize: 7,
                    color: C.textDim,
                    letterSpacing: "0.3em",
                  }}
                >
                  CHANNEL ID
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: C.textMid,
                    letterSpacing: "0.1em",
                  }}
                >
                  {activeRoom._id.slice(-10).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: "hidden", background: C.bg }}>
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

            {/* Input */}
            <div
              style={{
                background: C.bgPanel,
                borderTop: `1px solid ${C.border}`,
                padding: "10px 14px",
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
                placeholder={
                  uploading ? "UPLOADING FILE..." : "TRANSMIT MESSAGE..."
                }
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
              gap: 20,
            }}
          >
            <div
              style={{
                fontSize: 58,
                fontFamily: "'Orbitron', monospace",
                fontWeight: 900,
                color: C.cyan,
                letterSpacing: "0.3em",
                opacity: 0.4,
                textShadow: `0 0 30px ${C.cyan}, 0 0 60px rgba(0,255,231,0.3)`,
                animation: "flicker 5s infinite",
              }}
            >
              HERMES
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.textDim,
                letterSpacing: "0.4em",
                opacity: 0.6,
              }}
            >
              SELECT A CHANNEL TO BEGIN TRANSMISSION
            </div>
            <div
              style={{
                padding: "12px 28px",
                border: `1px solid ${C.border}`,
                background: C.bgCard,
                fontSize: 10,
                color: C.textDim,
                letterSpacing: "0.2em",
                textAlign: "center",
                lineHeight: 2.2,
                clipPath: cyberClip,
                opacity: 0.6,
              }}
            >
              {rooms.length} CHANNEL{rooms.length !== 1 ? "S" : ""} ACTIVE
              <span style={{ color: C.border, margin: "0 10px" }}>|</span>
              {allUsers.length} AGENT{allUsers.length !== 1 ? "S" : ""}{" "}
              REGISTERED
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
