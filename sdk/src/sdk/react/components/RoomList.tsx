import React from "react";
import type { Room } from "../../types/index";

interface RoomListProps {
  rooms: Room[];
  activeRoomId?: string | null;
  currentUserId: string;
  loading?: boolean;
  onSelectRoom: (room: Room) => void;
  onCreateDirect?: () => void;
  onCreateGroup?: () => void;
  renderRoomItem?: (room: Room, isActive: boolean) => React.ReactNode;
  renderAvatar?: (room: Room) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  className?: string;
  itemClassName?: string;
}

const formatLastActivity = (iso: string) => {
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
  return date.toLocaleDateString();
};

const getRoomName = (room: Room, currentUserId: string) => {
  if (room.type === "group") return room.name ?? "Group";
  const other = room.members.find((m) => m !== currentUserId);
  return other ?? "Direct Message";
};

const getLastMessagePreview = (room: Room): string => {
  const msg = room.lastMessage as any;
  if (!msg) return "No messages yet";
  if (msg.isDeleted) return "Message deleted";
  if (msg.type === "text") return msg.text?.slice(0, 50) ?? "";
  if (msg.type === "image") return "📷 Image";
  if (msg.type === "video") return "🎥 Video";
  if (msg.type === "audio") return "🎵 Audio";
  if (msg.type === "document") return `📄 ${msg.fileName ?? "File"}`;
  if (msg.type === "link") return `🔗 ${msg.url}`;
  return "";
};

const DefaultRoomItem: React.FC<{
  room: Room;
  isActive: boolean;
  currentUserId: string;
  renderAvatar?: (room: Room) => React.ReactNode;
  itemClassName?: string;
}> = ({ room, isActive, currentUserId, renderAvatar, itemClassName }) => (
  <div
    className={`hermes-room-item ${isActive ? "hermes-room-item--active" : ""} ${itemClassName ?? ""}`}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      cursor: "pointer",
      background: isActive ? "rgba(0,132,255,0.08)" : "transparent",
      borderLeft: isActive ? "3px solid #0084ff" : "3px solid transparent",
    }}
  >
    <div style={{ flexShrink: 0 }}>
      {renderAvatar ? (
        renderAvatar(room)
      ) : (
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {room.type === "group" ? "G" : "D"}
        </div>
      )}
    </div>
    <div style={{ flex: 1, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {getRoomName(room, currentUserId)}
        </span>
        <span
          style={{ fontSize: 11, opacity: 0.5, flexShrink: 0, marginLeft: 4 }}
        >
          {formatLastActivity(room.lastActivity)}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontSize: 13,
            opacity: 0.6,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {getLastMessagePreview(room)}
        </span>
        {room.unreadCount > 0 && (
          <span
            style={{
              background: "#0084ff",
              color: "#fff",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700,
              padding: "1px 7px",
              flexShrink: 0,
              marginLeft: 4,
            }}
          >
            {room.unreadCount > 99 ? "99+" : room.unreadCount}
          </span>
        )}
      </div>
    </div>
  </div>
);

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  activeRoomId,
  currentUserId,
  loading = false,
  onSelectRoom,
  onCreateDirect,
  onCreateGroup,
  renderRoomItem,
  renderAvatar,
  renderEmpty,
  className = "",
  itemClassName = "",
}) => {
  return (
    <div
      className={`hermes-room-list ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {/* Buttons always visible */}
      {(onCreateDirect || onCreateGroup) && (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "10px 12px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          {onCreateDirect && (
            <button
              onClick={onCreateDirect}
              style={{
                flex: 1,
                background: "#0084ff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              + Direct
            </button>
          )}
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
              style={{
                flex: 1,
                background: "none",
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              + Group
            </button>
          )}
        </div>
      )}

      {loading && (
        <div style={{ padding: "12px 16px", opacity: 0.5, fontSize: 13 }}>
          Loading rooms...
        </div>
      )}

      {!loading && rooms.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 24,
            opacity: 0.4,
            fontSize: 13,
          }}
        >
          {renderEmpty ? renderEmpty() : "No conversations yet."}
        </div>
      )}

      {!loading &&
        rooms.map((room) => {
          const isActive = room._id === activeRoomId;
          return (
            <div key={room._id} onClick={() => onSelectRoom(room)}>
              {renderRoomItem ? (
                renderRoomItem(room, isActive)
              ) : (
                <DefaultRoomItem
                  room={room}
                  isActive={isActive}
                  currentUserId={currentUserId}
                  renderAvatar={renderAvatar}
                  itemClassName={itemClassName}
                />
              )}
            </div>
          );
        })}
    </div>
  );
};
