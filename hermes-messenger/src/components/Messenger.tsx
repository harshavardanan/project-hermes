import React, { useState, useEffect, useMemo } from "react";
import { LogOut, MessageSquarePlus, ArrowLeft } from "lucide-react";
import { useHermes } from "../lib/hermes";
import { useAuthStore } from "../store/authStore";
import {
  Chat,
  Room,
  Window,
  RoomList,
  MessageList,
  ChatInput,
  Thread,
  Search,
  useRooms
} from "hermes-chat-react/react";
import type { Room as RoomType, Message, HermesClient, HermesUser } from "hermes-chat-react";
import { NewChatModal } from "./NewChatModal";

interface MessengerInnerProps {
  client: HermesClient;
  hermesUser: HermesUser;
  logout: () => void;
}

/* ──────────────────────────────────────────────────────────────── */
/*  Helper: relative timestamp                                     */
/* ──────────────────────────────────────────────────────────────── */
const relativeTime = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/* ──────────────────────────────────────────────────────────────── */
/*  Main Messenger Inner                                           */
/* ──────────────────────────────────────────────────────────────── */
const MessengerInner: React.FC<MessengerInnerProps> = ({ client, hermesUser, logout }) => {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userMap, setUserMap] = useState<Record<string, HermesUser>>({});

  const { rooms, loading: roomsLoading } = useRooms(client);

  // Fetch all users and index by BOTH `userId` and any composite key variants
  useEffect(() => {
    const hClient = client as any;
    if (typeof hClient.getUsers === "function") {
      hClient.getUsers().then((fetchedUsers: HermesUser[]) => {
        const map: Record<string, HermesUser> = {};
        fetchedUsers.forEach((u: HermesUser) => {
          map[u.userId] = u;
        });
        setUserMap(map);
      }).catch((err: any) => console.error("Failed to fetch users for sidebar", err));
    }
  }, [client]);

  /* ── Helpers ─────────────────────────────────────────────────── */

  const resolveUser = (id: string): HermesUser | undefined => {
    if (userMap[id]) return userMap[id];
    // Try partial match: some IDs may be stored as composites (projectId:externalId)
    const match = Object.values(userMap).find(u => id.includes(u.userId) || u.userId.includes(id));
    return match;
  };

  const getRoomName = (room: RoomType) => {
    if (room.type === "group") return room.name ?? "Group";
    const otherId = room.members.find((m) => m !== hermesUser.userId);
    if (!otherId) return "You";
    return resolveUser(otherId)?.displayName ?? "User";
  };

  const getRoomAvatar = (room: RoomType): string | undefined => {
    if (room.type === "group") return room.avatar;
    const otherId = room.members.find((m) => m !== hermesUser.userId);
    if (!otherId) return undefined;
    return resolveUser(otherId)?.avatar;
  };

  const getMessagePreview = (room: RoomType): string => {
    const msg = room.lastMessage as any;
    if (!msg) return "No messages yet";
    if (msg.isDeleted) return "Message deleted";
    if (msg.type === "text" && msg.text) return msg.text.slice(0, 60);
    if (msg.type === "image") return "📷 Image";
    if (msg.type === "video") return "🎥 Video";
    if (msg.type === "audio") return "🎵 Audio";
    if (msg.type === "document") return `📄 ${msg.fileName ?? "File"}`;
    if (msg.type === "link") return "🔗 Link";
    return "New message";
  };

  /* ── Event handlers ──────────────────────────────────────────── */

  const handleSearchResult = (msg: Message) => {
    if (msg.roomId) {
      setActiveRoomId(msg.roomId);
      if (window.innerWidth < 768) setShowSidebar(false);
    }
  };

  const handleSelectRoom = (r: RoomType) => {
    setActiveRoomId(r._id);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  /* ── Active room info ────────────────────────────────────────── */
  const activeRoom = useMemo(() => rooms.find(r => r._id === activeRoomId), [rooms, activeRoomId]);
  const activeRoomName = activeRoom ? getRoomName(activeRoom) : "Chat";
  const activeRoomAvatar = activeRoom ? getRoomAvatar(activeRoom) : undefined;

  /* ── Custom room avatar renderer for message list ─────────────── */
  const renderMessageAvatar = (senderId: string) => {
    const user = resolveUser(senderId);
    const avatarUrl = user?.avatar;
    const name = user?.displayName ?? "?";
    if (avatarUrl) {
      return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />;
    }
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ background: "var(--brand-accent)", color: "var(--brand-muted)" }}>
        {name[0]?.toUpperCase() || "?"}
      </div>
    );
  };

  /* ── Custom room list item renderer ──────────────────────────── */
  const renderRoomItem = (room: RoomType, isActive: boolean) => {
    const name = getRoomName(room);
    const avatar = getRoomAvatar(room);
    const preview = getMessagePreview(room);

    return (
      <div
        className={`flex items-center gap-3 px-3 py-3 mx-2 my-0.5 rounded-lg cursor-pointer transition-all duration-150 ${
          isActive
            ? "border-l-[3px]"
            : "border-l-[3px] border-transparent hover:opacity-80"
        }`}
        style={{
          background: isActive ? "var(--brand-accent)" : "transparent",
          borderColor: isActive ? "var(--brand-primary)" : "transparent",
        }}
      >
        <div className="flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--brand-accent)", color: "var(--brand-muted)", border: "1px solid var(--brand-border)" }}>
              {room.type === "group" ? "G" : name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <span className="font-medium text-sm truncate" style={{ color: "var(--brand-text)" }}>
              {name}
            </span>
            <span className="text-[11px] ml-2 flex-shrink-0" style={{ color: "var(--brand-muted)" }}>
              {relativeTime(room.lastActivity)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs truncate" style={{ color: "var(--brand-muted)" }}>{preview}</span>
            {room.unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0"
                style={{ background: "var(--brand-primary)", color: "var(--brand-primary-fg)" }}>
                {room.unreadCount > 99 ? "99+" : room.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <Chat
      client={client}
      theme="dark"
      customClasses={{
        chat: "h-[100dvh] w-full flex flex-col",
        room: "flex flex-1 w-full h-full min-w-0",
      }}
    >
      <div className="flex flex-1 w-full overflow-hidden font-sans" style={{ background: "var(--brand-bg)", color: "var(--brand-text)" }}>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div
          className={`
            fixed inset-y-0 left-0 z-20
            flex flex-col
            transition-transform duration-300 ease-in-out md:static md:translate-x-0
            ${showSidebar ? "translate-x-0 w-full md:w-80" : "-translate-x-full w-full md:w-80"}
          `}
          style={{ background: "var(--brand-bg)", borderRight: "1px solid var(--brand-border)" }}
        >
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-4 shrink-0"
            style={{ borderBottom: "1px solid var(--brand-border)" }}>
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5" style={{ color: "var(--brand-text)" }}>
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--brand-primary)" }}>
                <span className="text-xs font-bold" style={{ color: "var(--brand-primary-fg)" }}>H</span>
              </div>
              Hermes
            </h2>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ color: "var(--brand-muted)" }}
                title="New Chat"
              >
                <MessageSquarePlus className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ color: "var(--brand-muted)" }}
                title="Sign Out"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Search + Room List */}
          <div className="flex-1 overflow-y-auto relative" style={{ background: "var(--brand-bg)" }}>
            <div className="p-3 sticky top-0 z-10" style={{ background: "var(--brand-bg)", borderBottom: "1px solid var(--brand-border)" }}>
              <Search
                onSelectResult={handleSearchResult}
                placeholder="Search messages..."
                className="w-full text-sm"
              />
            </div>

            <RoomList
              rooms={rooms}
              loading={roomsLoading}
              currentUserId={hermesUser.userId}
              activeRoomId={activeRoomId || undefined}
              onSelectRoom={handleSelectRoom}
              renderRoomItem={renderRoomItem}
            />
          </div>

          {/* User Footer */}
          <div className="h-14 px-4 flex items-center gap-3 shrink-0"
            style={{ borderTop: "1px solid var(--brand-border)" }}>
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
              style={{ background: "var(--brand-accent)", border: "1px solid var(--brand-border)" }}>
              {hermesUser.avatar ? (
                <img src={hermesUser.avatar} alt="You" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: "var(--brand-muted)" }}>
                  {hermesUser.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--brand-text)" }}>
                {hermesUser.displayName}
              </p>
              <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: "#22c55e" }}>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                Online
              </p>
            </div>
          </div>
        </div>

        {/* ── Main Chat Area ──────────────────────────────────── */}
        <div className="flex-1 flex relative w-full h-full min-w-0" style={{ background: "var(--brand-card)" }}>
          {activeRoomId ? (
            <Room roomId={activeRoomId}>
              <Window className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Chat Header */}
                <div className="h-14 flex items-center px-4 md:px-5 z-10 shrink-0"
                  style={{ borderBottom: "1px solid var(--brand-border)", background: "var(--brand-card)" }}>
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden mr-3 p-1.5 -ml-1 rounded-lg hover:opacity-70"
                    style={{ color: "var(--brand-muted)" }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0"
                      style={{ background: "var(--brand-accent)", border: "1px solid var(--brand-border)" }}>
                      {activeRoomAvatar ? (
                        <img src={activeRoomAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold"
                          style={{ color: "var(--brand-muted)" }}>
                          {activeRoomName[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm truncate" style={{ color: "var(--brand-text)" }}>
                      {activeRoomName}
                    </h3>
                  </div>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto" style={{ background: "var(--brand-card)" }}>
                  <MessageList
                    className="h-full"
                    renderAvatar={renderMessageAvatar}
                  />
                </div>

                {/* Chat Input */}
                <div className="p-3 shrink-0" style={{ borderTop: "1px solid var(--brand-border)", background: "var(--brand-card)" }}>
                  <ChatInput
                    className="flex text-sm"
                    inputClassName="flex-1 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:outline-none transition-shadow"
                  />
                </div>
              </Window>

              {/* Thread panel */}
              <div className="h-full flex-shrink-0 hidden lg:block"
                style={{ borderLeft: "1px solid var(--brand-border)", background: "var(--brand-bg)" }}>
                <Thread autoFocus={true} />
              </div>
            </Room>
          ) : (
            <div className="flex-1 flex-col items-center justify-center hidden md:flex" style={{ color: "var(--brand-muted)" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: "var(--brand-accent)", border: "1px solid var(--brand-border)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="text-lg font-medium mb-1" style={{ color: "var(--brand-text)" }}>Hermes Messenger</h3>
              <p className="text-sm max-w-xs text-center">Select a conversation or start a new chat.</p>
            </div>
          )}
        </div>

      </div>

      <NewChatModal
        client={client}
        currentUser={hermesUser}
        open={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onRoomCreated={(room: RoomType) => {
          setActiveRoomId(room._id);
          if (window.innerWidth < 768) setShowSidebar(false);
        }}
      />
    </Chat>
  );
};

/* ──────────────────────────────────────────────────────────────── */
/*  Exported wrapper                                               */
/* ──────────────────────────────────────────────────────────────── */
export const Messenger: React.FC = () => {
  const { client, user: hermesUser, status } = useHermes();
  const { logout } = useAuthStore();

  if (status === "connecting" || status === "idle" || !client || !hermesUser) {
    return (
      <div className="flex h-[100dvh] items-center justify-center font-sans" style={{ background: "var(--brand-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-[3px] rounded-full animate-spin"
            style={{ borderColor: "var(--brand-border)", borderTopColor: "var(--brand-primary)" }}></div>
          <p className="text-sm tracking-wide" style={{ color: "var(--brand-muted)" }}>
            {status === "idle" ? "INITIALIZING..." : "CONNECTING..."}
          </p>
        </div>
      </div>
    );
  }

  return <MessengerInner client={client} hermesUser={hermesUser} logout={logout} />;
};
