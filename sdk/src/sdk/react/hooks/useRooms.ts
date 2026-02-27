import { useState, useEffect, useCallback } from "react";
import type { HermesClient } from "../../core/HermesClient.js";
import type {
  Room,
  CreateDirectRoomInput,
  CreateGroupRoomInput,
} from "../../types/index.js";

// ── useRooms ──────────────────────────────────────────────────────────────────
// Manages the full room list for the current user.
// Real-time updates when rooms are created/deleted/updated.
//
// Usage:
//   const { rooms, createDirect, createGroup, loading } = useRooms(client);

export const useRooms = (client: HermesClient) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Initial fetch ─────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    if (!client.isConnected) return;
    setLoading(true);
    setError(null);
    try {
      const data = await client.getRooms();
      setRooms(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ── Real-time updates ─────────────────────────────────────────────────────
  useEffect(() => {
    const onCreated = (room: Room) => {
      setRooms((prev) => {
        if (prev.find((r) => r._id === room._id)) return prev;
        return [room, ...prev];
      });
    };

    const onDeleted = ({ roomId }: { roomId: string }) => {
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    };

    const onMemberJoined = ({
      roomId,
      userId,
    }: {
      roomId: string;
      userId: string;
    }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r._id === roomId ? { ...r, members: [...r.members, userId] } : r,
        ),
      );
    };

    const onMemberLeft = ({
      roomId,
      userId,
    }: {
      roomId: string;
      userId: string;
    }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r._id === roomId
            ? { ...r, members: r.members.filter((m) => m !== userId) }
            : r,
        ),
      );
    };

    // Bump room to top when new message arrives
    const onMessage = (msg: any) => {
      setRooms((prev) => {
        const idx = prev.findIndex((r) => r._id === msg.roomId);
        if (idx === -1) return prev;
        const updated = {
          ...prev[idx],
          lastMessage: msg,
          lastActivity: msg.createdAt,
        };
        const rest = prev.filter((r) => r._id !== msg.roomId);
        return [updated, ...rest];
      });
    };

    client.on("room:created", onCreated);
    client.on("room:deleted", onDeleted);
    client.on("room:member:joined", onMemberJoined);
    client.on("room:member:left", onMemberLeft);
    client.on("message:receive", onMessage);

    return () => {
      client.off("room:created", onCreated);
      client.off("room:deleted", onDeleted);
      client.off("room:member:joined", onMemberJoined);
      client.off("room:member:left", onMemberLeft);
      client.off("message:receive", onMessage);
    };
  }, [client]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const createDirect = useCallback(
    async (input: CreateDirectRoomInput) => {
      const room = await client.createDirectRoom(input);
      return room;
    },
    [client],
  );

  const createGroup = useCallback(
    async (input: CreateGroupRoomInput) => {
      const room = await client.createGroupRoom(input);
      return room;
    },
    [client],
  );

  const deleteRoom = useCallback(
    async (roomId: string) => {
      await client.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    },
    [client],
  );

  const addMember = useCallback(
    async (roomId: string, userId: string) => {
      await client.addMember(roomId, userId);
    },
    [client],
  );

  const removeMember = useCallback(
    async (roomId: string, userId: string) => {
      await client.removeMember(roomId, userId);
    },
    [client],
  );

  return {
    rooms,
    loading,
    error,
    createDirect,
    createGroup,
    deleteRoom,
    addMember,
    removeMember,
    refetch: fetchRooms,
  };
};
