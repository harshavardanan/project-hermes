import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";

// ── Config ─────────────────────────────────────────────────────────────────────
const ENGINE = import.meta.env.VITE_SERVER_ENDPOINT;
const API_KEY = import.meta.env.VITE_HERMES_API_KEY;
const SECRET = import.meta.env.VITE_HERMES_SECRET;
const DEMO_ROOM_ID = import.meta.env.VITE_DEMO_ROOM_ID;

// ── Bad word filter ────────────────────────────────────────────────────────────
// Add/remove words as needed
const BAD_WORDS = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "bastard",
  "cunt",
  "dick",
  "pussy",
  "cock",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "whore",
  "slut",
  "piss",
  "crap",
  "damn",
  "hell",
  "asshole",
  "bullshit",
  "motherfucker",
  "fucker",
  "idiot",
];
const BAD_WORD_RE = new RegExp(`\\b(${BAD_WORDS.join("|")})\\b`, "gi");

function filterText(text: string): { clean: string; hasBad: boolean } {
  let hasBad = false;
  const clean = text.replace(BAD_WORD_RE, (match) => {
    hasBad = true;
    return "█".repeat(match.length);
  });
  return { clean, hasBad };
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isSelf?: boolean;
  optimistic?: boolean; // temp flag for UI-only messages
}
interface TypingUser {
  userId: string;
  displayName: string;
}
interface LiveDemoChatProps {
  user: {
    name: string;
    email: string;
    _id?: string;
    displayName?: string;
    username?: string;
  } | null;
  onSignInClick: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ── Component ──────────────────────────────────────────────────────────────────
export default function LiveDemoChat({
  user,
  onSignInClick,
}: LiveDemoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [reactions, setReactions] = useState<
    Record<string, { emoji: string; users: string[] }[]>
  >({});

  // Track optimistic message temp IDs so we can replace them
  const optimisticIds = useRef<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hermesUserRef = useRef<string | null>(null);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // ── Connect ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setStatus("connecting");

    let socket: Socket;

    (async () => {
      try {
        const res = await fetch(`${ENGINE}/hermes/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: API_KEY,
            secret: SECRET,
            userId: user.email || user._id || `demo-${Date.now()}`,
            displayName:
              user.name || user.displayName || user.username || "Developer",
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message ?? "Auth failed");

        const token = data.token as string;
        const hermesUserId = data.user.hermesUserId as string;
        setMyUserId(hermesUserId);
        hermesUserRef.current = hermesUserId;

        socket = io(`${ENGINE}/hermes`, {
          auth: { token },
          transports: ["websocket"],
          reconnection: true,
        });
        socketRef.current = socket;

        socket.once("connect", () => {
          setStatus("connected");

          // ✅ Join the room — without this, io.to(roomId) on the server
          // won't include this socket and messages won't be received
          socket.emit("room:join", { roomId: DEMO_ROOM_ID }, (joinRes: any) => {
            if (joinRes && !joinRes.success) {
              console.error("Failed to join demo room:", joinRes.error);
            }
          });

          // Load history
          socket.emit(
            "message:history",
            { roomId: DEMO_ROOM_ID, limit: 50 },
            (res: any) => {
              if (res?.messages) {
                setMessages(
                  res.messages.map((m: any) => ({
                    _id: m._id,
                    senderId: m.senderId,
                    senderName: m.senderName ?? m.senderId.slice(-6),
                    text: m.text ?? "",
                    createdAt: m.createdAt,
                    isSelf: m.senderId === hermesUserId,
                  })),
                );
                const rxMap: Record<
                  string,
                  { emoji: string; users: string[] }[]
                > = {};
                res.messages.forEach((m: any) => {
                  if (m.reactions?.length) rxMap[m._id] = m.reactions;
                });
                setReactions(rxMap);
              }
            },
          );
        });

        // ── INCOMING MESSAGES (from ALL users including self from server) ──
        socket.on("message:receive", (msg: any) => {
          if (msg.roomId !== DEMO_ROOM_ID) return;

          setMessages((prev) => {
            // If we have an optimistic version of this message, replace it
            const optimisticIndex = prev.findIndex(
              (m) =>
                m.optimistic &&
                m.isSelf &&
                m.text === msg.text &&
                m.senderId === hermesUserRef.current,
            );
            const incoming: ChatMessage = {
              _id: msg._id,
              senderId: msg.senderId,
              senderName: msg.senderName ?? msg.senderId.slice(-6),
              text: msg.text ?? "",
              createdAt: msg.createdAt,
              isSelf: msg.senderId === hermesUserRef.current,
            };

            if (optimisticIndex !== -1) {
              // Replace optimistic message with confirmed server message
              const next = [...prev];
              next[optimisticIndex] = incoming;
              return next;
            }

            // Deduplicate by real _id
            if (prev.find((m) => m._id === msg._id)) return prev;
            return [...prev, incoming];
          });
        });

        // Reactions
        socket.on("reaction:updated", ({ messageId, reactions: rx }: any) => {
          setReactions((prev) => ({ ...prev, [messageId]: rx }));
        });

        // Typing
        socket.on("typing:started", ({ userId, displayName, roomId }: any) => {
          if (roomId !== DEMO_ROOM_ID || userId === hermesUserRef.current)
            return;
          setTypingUsers((p) => [
            ...p.filter((u) => u.userId !== userId),
            { userId, displayName },
          ]);
        });
        socket.on("typing:stopped", ({ userId, roomId }: any) => {
          if (roomId !== DEMO_ROOM_ID) return;
          setTypingUsers((p) => p.filter((u) => u.userId !== userId));
        });

        socket.on("disconnect", () => setStatus("error"));
        socket.on("connect_error", () => setStatus("error"));
      } catch (err) {
        console.error("Hermes connect error:", err);
        setStatus("error");
      }
    })();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("room:leave", { roomId: DEMO_ROOM_ID });
        socketRef.current.disconnect();
      }
      socketRef.current = null;
      hermesUserRef.current = null;
      setMyUserId(null);
      setStatus("idle");
      optimisticIds.current.clear();
    };
  }, [user?.email, user?.name]);

  // ── Send ──────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const text = input.trim();
      if (!text || status !== "connected" || !socketRef.current) return;

      // Optimistic update with a temp ID
      const tempId = `optimistic-${Date.now()}`;
      const optimistic: ChatMessage = {
        _id: tempId,
        senderId: myUserId || "local-user",
        senderName: user?.name || "Developer",
        text,
        createdAt: new Date().toISOString(),
        isSelf: true,
        optimistic: true,
      };
      optimisticIds.current.add(tempId);
      setMessages((prev) => [...prev, optimistic]);

      // Emit to server — server will broadcast back via message:receive to ALL clients
      socketRef.current.emit(
        "message:send",
        { roomId: DEMO_ROOM_ID, type: "text", text },
        () => {},
      );
      socketRef.current.emit("typing:stop", { roomId: DEMO_ROOM_ID });
      if (typingTimer.current) clearTimeout(typingTimer.current);
      setInput("");
    },
    [input, status, myUserId, user],
  );

  // ── Typing ────────────────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socketRef.current || status !== "connected") return;
    socketRef.current.emit("typing:start", { roomId: DEMO_ROOM_ID });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", { roomId: DEMO_ROOM_ID });
    }, 2500);
  };

  // ── React ─────────────────────────────────────────────────────────────────────
  const handleReact = useCallback(
    (messageId: string, emoji: string) => {
      if (!socketRef.current || status !== "connected") return;
      socketRef.current.emit(
        "reaction:add",
        { messageId, roomId: DEMO_ROOM_ID, emoji },
        () => {},
      );
      setPickerFor(null);
    },
    [status],
  );

  // ── Typing label ──────────────────────────────────────────────────────────────
  const typingText =
    typingUsers.length === 0
      ? null
      : typingUsers.length === 1
        ? `${typingUsers[0].displayName} is typing`
        : typingUsers.length === 2
          ? `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing`
          : `${typingUsers[0].displayName} and ${typingUsers.length - 1} others are typing`;

  const dotColor =
    status === "connected"
      ? "#39FF14"
      : status === "connecting"
        ? "#fbbf24"
        : status === "error"
          ? "#ef4444"
          : "#64748b";

  const connected = status === "connected";

  return (
    <section
      className="py-20 px-4 md:px-8 lg:px-16 max-w-[1280px] mx-auto w-full"
      onClick={() => setPickerFor(null)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* ── Left: Marketing ── */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Experience the{" "}
              <span className="text-brand-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                speed
              </span>{" "}
              yourself.
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              This global chat room is powered entirely by the Hermes SDK.
              Experience ultra-low latency message delivery across 45 edge
              regions with zero cold starts.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              "WebSockets via Socket.IO",
              "Edge-Routed globally",
              "React SDK powered",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 size={20} className="text-brand-primary" />
                <span className="font-medium tracking-wide">{f}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-6 flex-wrap">
            {[
              { label: "Messages", value: messages.length },
              { label: "Typing", value: typingUsers.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-3"
              >
                <div className="font-mono text-2xl font-black text-brand-primary">
                  {value}
                </div>
                <div className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Chat UI ── */}
        <div className="relative group">
          <div
            aria-hidden
            className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] transition duration-1000 group-hover:bg-brand-primary/20"
          />
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />

          <div className="relative bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Header */}
            <div className="border-b border-white/10 p-4 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                    style={{ background: dotColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2.5 w-2.5"
                    style={{ background: dotColor }}
                  />
                </span>
                <h3 className="font-semibold text-slate-100 tracking-wide">
                  Global Dev Chat
                </h3>
              </div>
              <div
                className="text-[10px] font-mono uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5"
                style={{ color: dotColor }}
              >
                {status === "connected"
                  ? "Live"
                  : status === "connecting"
                    ? "Connecting..."
                    : status === "error"
                      ? "Offline"
                      : "—"}
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
              onClick={() => setPickerFor(null)}
            >
              {messages.length === 0 && connected && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-slate-600 font-medium">
                    No messages yet — say hello 👋
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const isOwn = msg.isSelf;
                const msgReactions = (reactions[msg._id] ?? []).filter(
                  (r) => r.users.length > 0,
                );
                const { clean, hasBad } = filterText(msg.text);

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col gap-0.5 group/msg ${isOwn ? "items-end" : "items-start"}`}
                  >
                    {/* Sender + time */}
                    <div
                      className={`flex items-baseline gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                    >
                      <span className="text-[11px] font-bold text-slate-300">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">
                        {fmtTime(msg.createdAt)}
                      </span>
                      {msg.optimistic && (
                        <span className="text-[9px] text-slate-600 font-mono italic">
                          sending…
                        </span>
                      )}
                    </div>

                    {/* Bubble + react */}
                    <div
                      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`px-3 py-2 text-sm max-w-[80%] leading-relaxed
                          ${
                            isOwn
                              ? "bg-brand-primary text-black rounded-tl-2xl rounded-tr-sm rounded-bl-2xl font-medium"
                              : "bg-white/8 border border-white/8 text-slate-200 rounded-tr-2xl rounded-tl-sm rounded-br-2xl"
                          }
                          ${msg.optimistic ? "opacity-60" : "opacity-100"}
                        `}
                        style={{
                          wordBreak: "break-word",
                          transition: "opacity 0.2s",
                        }}
                      >
                        {hasBad ? (
                          <span title="Message contains filtered content">
                            {clean.split(/(█+)/g).map((part, i) =>
                              /^█+$/.test(part) ? (
                                <span
                                  key={i}
                                  className="inline-block rounded px-0.5 select-none"
                                  style={{
                                    background: isOwn
                                      ? "rgba(0,0,0,0.25)"
                                      : "rgba(255,255,255,0.15)",
                                    color: "transparent",
                                    letterSpacing: "0.05em",
                                    filter: "blur(4px)",
                                    userSelect: "none",
                                  }}
                                >
                                  {part}
                                </span>
                              ) : (
                                part
                              ),
                            )}
                          </span>
                        ) : (
                          clean
                        )}
                      </div>

                      {/* React trigger — only on confirmed messages */}
                      {!msg.optimistic && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPickerFor((p) =>
                                p === msg._id ? null : msg._id,
                              );
                            }}
                            className="opacity-0 group-hover/msg:opacity-100 transition-opacity text-base leading-none p-1 text-slate-500 hover:text-slate-300"
                          >
                            😊
                          </button>

                          {pickerFor === msg._id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                bottom: "calc(100% + 6px)",
                                [isOwn ? "right" : "left"]: 0,
                                zIndex: 50,
                                animation: "hermes-pop 0.15s ease",
                              }}
                            >
                              <EmojiPicker
                                theme={Theme.DARK}
                                onEmojiClick={(emojiData: EmojiClickData) =>
                                  handleReact(msg._id, emojiData.emoji)
                                }
                                height={380}
                                width={320}
                                searchPlaceHolder="Search emoji..."
                                lazyLoadEmojis
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reaction pills */}
                    {msgReactions.length > 0 && (
                      <div
                        className={`flex gap-1 flex-wrap mt-0.5 ${isOwn ? "justify-end" : ""}`}
                      >
                        {msgReactions.map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => handleReact(msg._id, r.emoji)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-transform hover:scale-110 active:scale-95"
                            style={{
                              background: "rgba(255,255,255,0.07)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "#e2e8f0",
                            }}
                          >
                            <span>{r.emoji}</span>
                            <span className="font-bold text-[10px] font-mono">
                              {r.users.length}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingText && (
                <div className="flex items-center gap-2 pt-1 pl-1">
                  <div className="flex gap-1 bg-white/5 border border-white/5 rounded-full px-3 py-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#64748b",
                          display: "block",
                          animation: `hermes-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {typingText}
                  </span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="relative p-4 bg-black/40 border-t border-white/10 shrink-0">
              {user ? (
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-brand-primary/40 transition-colors"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    disabled={!connected}
                    className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-200 placeholder-slate-600 outline-none disabled:opacity-40"
                    placeholder={
                      connected
                        ? "Type a message..."
                        : status === "connecting"
                          ? "Connecting..."
                          : "Offline"
                    }
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || !connected}
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                      ${
                        input.trim() && connected
                          ? "bg-brand-primary text-black hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(57,255,20,0.3)]"
                          : "bg-white/10 text-slate-500"
                      }`}
                  >
                    <Send
                      size={15}
                      className={
                        input.trim() ? "translate-x-px -translate-y-px" : ""
                      }
                    />
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex gap-2 opacity-30 blur-sm pointer-events-none px-4 py-2">
                    <div className="flex-1 bg-white/10 rounded-lg h-10" />
                    <div className="w-10 bg-white/10 rounded-lg h-10" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <button
                      onClick={onSignInClick}
                      className="bg-brand-primary text-black font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      Sign in to join the chat
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes hermes-bounce {
          0%,80%,100% { transform: translateY(0); }
          40%          { transform: translateY(-4px); }
        }
        @keyframes hermes-pop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
