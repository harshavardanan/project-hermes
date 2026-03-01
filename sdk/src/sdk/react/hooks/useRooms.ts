import { useState, useEffect, useCallback, useRef } from "react";
import type { HermesClient } from "../../core/HermesClient";
import type {
  Room,
  CreateDirectRoomInput,
  CreateGroupRoomInput,
} from "../../types/index";

export const useRooms = (client: HermesClient) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // ── Wait until socket is connected, then fetch ────────────────────────────
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log(
      "🔄 fetchRooms start — isConnected:",
      client.isConnected,
      "status:",
      client.status,
    );

    // Poll isConnected every 100ms, timeout after 5s
    await new Promise<void>((resolve, reject) => {
      if (client.isConnected) return resolve();
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (client.isConnected) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 50) {
          clearInterval(interval);
          reject(new Error("Connection timeout"));
        }
      }, 100);
    });

    try {
      const data = await client.getRooms();
      console.log(
        "✅ rooms loaded:",
        data.length,
        data.map((r: any) => ({
          id: r._id,
          name: r.name ?? r.type,
          members: r.members.length,
        })),
      );
      setRooms(data);
      fetchedRef.current = true;
    } catch (err: any) {
      console.error("❌ fetchRooms failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Fetch on mount + re-fetch on reconnect
  useEffect(() => {
    fetchRooms();
    const onConnected = () => {
      if (!fetchedRef.current) fetchRooms();
    };
    client.on("connected", onConnected);
    return () => {
      client.off("connected", onConnected);
    };
  }, [fetchRooms, client]);

  // ── Real-time updates ─────────────────────────────────────────────────────
  useEffect(() => {
    const onCreated = (room: Room) => {
      setRooms((prev) => {
        if (prev.find((r) => r._id === room._id)) return prev;
        return [{ ...room, unreadCount: 0 }, ...prev];
      });
    };

    const onDeleted = ({ roomId }: { roomId: string }) =>
      setRooms((prev) => prev.filter((r) => r._id !== roomId));

    const onMemberJoined = ({
      roomId,
      userId,
    }: {
      roomId: string;
      userId: string;
    }) =>
      setRooms((prev) =>
        prev.map((r) =>
          r._id === roomId ? { ...r, members: [...r.members, userId] } : r,
        ),
      );

    const onMemberLeft = ({
      roomId,
      userId,
    }: {
      roomId: string;
      userId: string;
    }) =>
      setRooms((prev) =>
        prev.map((r) =>
          r._id === roomId
            ? { ...r, members: r.members.filter((m) => m !== userId) }
            : r,
        ),
      );

    const onMessage = (msg: any) =>
      setRooms((prev) => {
        const idx = prev.findIndex((r) => r._id === msg.roomId);
        if (idx === -1) return prev;
        const updated = {
          ...prev[idx],
          lastMessage: msg,
          lastActivity: msg.createdAt,
        };
        return [updated, ...prev.filter((r) => r._id !== msg.roomId)];
      });

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

  // ── Actions — add room to state immediately on creation ───────────────────
  const createDirect = useCallback(
    async (input: CreateDirectRoomInput) => {
      const room = await client.createDirectRoom(input);
      setRooms((prev) => {
        if (prev.find((r) => r._id === room._id)) return prev;
        return [{ ...room, unreadCount: 0 }, ...prev];
      });
      return room;
    },
    [client],
  );

  const createGroup = useCallback(
    async (input: CreateGroupRoomInput) => {
      const room = await client.createGroupRoom(input);
      setRooms((prev) => {
        if (prev.find((r) => r._id === room._id)) return prev;
        return [{ ...room, unreadCount: 0 }, ...prev];
      });
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
    (roomId: string, userId: string) => client.addMember(roomId, userId),
    [client],
  );

  const removeMember = useCallback(
    (roomId: string, userId: string) => client.removeMember(roomId, userId),
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
