import React, { useEffect, useState } from "react";
import { Modal } from "hermes-chat-react/react";
import type { HermesClient, HermesUser, Room } from "hermes-chat-react";
import { Search, User } from "lucide-react";

interface NewChatModalProps {
  client: HermesClient;
  currentUser: HermesUser;
  open: boolean;
  onClose: () => void;
  onRoomCreated: (room: Room) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  client,
  currentUser,
  open,
  onClose,
  onRoomCreated,
}) => {
  const [users, setUsers] = useState<HermesUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open && users.length === 0) {
      setLoading(true);
      const hClient = client as any;
      if (typeof hClient.getUsers === "function") {
        hClient
          .getUsers()
          .then((fetchedUsers: HermesUser[]) => {
            setUsers(
              fetchedUsers.filter((u) => u.userId !== currentUser.userId),
            );
          })
          .catch((err: any) => console.error("Failed to fetch users", err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
        console.error("getUsers method not found on HermesClient");
      }
    }
  }, [open, users.length, client, currentUser.userId]);

  const handleCreateRoom = async (targetUser: HermesUser) => {
    if (creating) return;
    setCreating(true);
    try {
      const room = await client.createDirectRoom({
        targetUserId: targetUser.userId,
      });
      onRoomCreated(room);
      onClose();
    } catch (err) {
      console.error("Failed to create room", err);
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.displayName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="w-[480px] max-w-[90vw] p-6 flex flex-col h-[500px] max-h-[85vh] rounded-xl relative overflow-hidden"
        style={{
          background: "var(--brand-card)",
          border: "1px solid var(--brand-border)",
          color: "var(--brand-text)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
        }}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--brand-text)" }}>
            New Conversation
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--brand-muted)" }}>
            Find a user to start chatting
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--brand-muted)" }} />
          <input
            type="text"
            placeholder="Search directory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors"
            style={{
              background: "var(--brand-accent)",
              border: "1px solid var(--brand-border)",
              color: "var(--brand-text)",
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--brand-muted)" }}>
              Loading Directory...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: "var(--brand-muted)" }}>
              <User className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <button
                key={u.userId}
                disabled={creating}
                onClick={() => handleCreateRoom(u)}
                className="w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors disabled:opacity-50 hover:opacity-80"
                style={{ background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--brand-accent)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {u.avatar ? (
                  <img src={u.avatar} alt={u.displayName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                    style={{ background: "var(--brand-accent)", color: "var(--brand-muted)", border: "1px solid var(--brand-border)" }}>
                    {u.displayName?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--brand-text)" }}>
                    {u.displayName}
                  </p>
                  {u.email && (
                    <p className="text-xs truncate" style={{ color: "var(--brand-muted)" }}>{u.email}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
