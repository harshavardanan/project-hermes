import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRooms } from "./useRooms";
import { HermesClient } from "../../core/HermesClient";
import type { Room } from "../../types/index";

describe("useRooms", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      isConnected: true,
      getRooms: vi.fn(),
      createDirectRoom: vi.fn(),
      createGroupRoom: vi.fn(),
      deleteRoom: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };
  });

  const mockRoom: Room = {
    _id: "room1",
    type: "direct",
    projectId: "p1",
    members: ["user1", "user2"],
    isActive: true,
    lastActivity: new Date().toISOString()
  };

  it("should fetch rooms on mount", async () => {
    mockClient.getRooms.mockResolvedValue([mockRoom]);
    
    const { result } = renderHook(() => useRooms(mockClient as unknown as HermesClient));
    
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rooms).toEqual([mockRoom]);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    mockClient.getRooms.mockRejectedValue(new Error("Failed to fetch"));
    
    const { result } = renderHook(() => useRooms(mockClient as unknown as HermesClient));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch");
    expect(result.current.rooms).toEqual([]);
  });

  it("should create direct room and update state instantly", async () => {
    mockClient.getRooms.mockResolvedValue([]);
    const newRoom = { ...mockRoom, _id: "new-room" };
    mockClient.createDirectRoom.mockResolvedValue(newRoom);
    
    const { result } = renderHook(() => useRooms(mockClient as unknown as HermesClient));
    
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createDirect({ targetUserId: "user-3" });
    });

    expect(result.current.rooms).toHaveLength(1);
    expect(result.current.rooms[0]._id).toBe("new-room");
    expect(result.current.rooms[0].unreadCount).toBe(0);
  });

  it("should handle room:created socket event", async () => {
    mockClient.getRooms.mockResolvedValue([]);
    
    let onCreatedCallback: Function | undefined;
    mockClient.on.mockImplementation((event: string, cb: Function) => {
      if (event === "room:created") onCreatedCallback = cb;
    });

    const { result } = renderHook(() => useRooms(mockClient as unknown as HermesClient));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      onCreatedCallback?.(mockRoom);
    });

    expect(result.current.rooms).toHaveLength(1);
    expect(result.current.rooms[0]._id).toBe("room1");
  });

  it("should handle room:deleted socket event", async () => {
    mockClient.getRooms.mockResolvedValue([mockRoom]);
    
    let onDeletedCallback: Function | undefined;
    mockClient.on.mockImplementation((event: string, cb: Function) => {
      if (event === "room:deleted") onDeletedCallback = cb;
    });

    const { result } = renderHook(() => useRooms(mockClient as unknown as HermesClient));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rooms).toHaveLength(1);

    act(() => {
      onDeletedCallback?.({ roomId: "room1" });
    });

    expect(result.current.rooms).toHaveLength(0);
  });
  
  it("should handle new message and bump room to top", async () => {
    const room2 = { ...mockRoom, _id: "room2" };
    mockClient.getRooms.mockResolvedValue([mockRoom, room2]);
    
    let onMessageCallback: Function | undefined;
    mockClient.on.mockImplementation((event: string, cb: Function) => {
      if (event === "message:receive") onMessageCallback = cb;
    });

    const { result } = renderHook(() => useRooms(mockClient as unknown as HermesClient));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      onMessageCallback?.({ roomId: "room2", text: "New message!", createdAt: "later" });
    });

    expect(result.current.rooms[0]._id).toBe("room2");
    expect((result.current.rooms[0] as any).lastMessage.text).toBe("New message!");
  });
});
