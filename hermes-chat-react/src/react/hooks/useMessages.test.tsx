import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMessages } from "./useMessages";
import { HermesClient } from "../../core/HermesClient";
import type { Message } from "../../types/index";

describe("useMessages", () => {
  let mockClient: any;
  const mockRoomId = "room1";

  const mockMessage: Message = {
    _id: "msg1",
    roomId: mockRoomId,
    senderId: "u1",
    text: "Hello",
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    mockClient = {
      isConnected: true,
      getHistory: vi.fn(),
      sendMessage: vi.fn(),
      editMessage: vi.fn(),
      deleteMessage: vi.fn(),
      addReaction: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };
  });

  it("should fetch message history on mount", async () => {
    mockClient.getHistory.mockResolvedValue({ messages: [mockMessage], hasMore: false });

    const { result } = renderHook(() => useMessages(mockClient as unknown as HermesClient, mockRoomId));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.messages).toEqual([mockMessage]);
    expect(result.current.hasMore).toBe(false);
  });

  it("should handle incoming new messages", async () => {
    mockClient.getHistory.mockResolvedValue({ messages: [], hasMore: false });

    let messageReceiveCb: Function | undefined;
    mockClient.on.mockImplementation((event: string, cb: Function) => {
      if (event === "message:receive") messageReceiveCb = cb;
    });

    const { result } = renderHook(() => useMessages(mockClient as unknown as HermesClient, mockRoomId));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.messages).toHaveLength(0);

    act(() => {
      messageReceiveCb?.(mockMessage);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]._id).toBe("msg1");
  });

  it("should handle message deletion", async () => {
    mockClient.getHistory.mockResolvedValue({ messages: [mockMessage], hasMore: false });

    let deleteCb: Function | undefined;
    mockClient.on.mockImplementation((event: string, cb: Function) => {
      if (event === "message:deleted") deleteCb = cb;
    });

    const { result } = renderHook(() => useMessages(mockClient as unknown as HermesClient, mockRoomId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      deleteCb?.({ messageId: "msg1", roomId: mockRoomId });
    });

    expect(result.current.messages[0].isDeleted).toBe(true);
    expect(result.current.messages[0].text).toBeUndefined();
  });

  it("should load more messages when loadMore is called", async () => {
    const olderMessage = { ...mockMessage, _id: "msg0", text: "older" };
    mockClient.getHistory
      .mockResolvedValueOnce({ messages: [mockMessage], hasMore: true })
      .mockResolvedValueOnce({ messages: [olderMessage], hasMore: false });

    const { result } = renderHook(() => useMessages(mockClient as unknown as HermesClient, mockRoomId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.messages).toHaveLength(2);
    // Older messages should be unshifted to the beginning
    expect(result.current.messages[0]._id).toBe("msg0");
    expect(result.current.messages[1]._id).toBe("msg1");
    expect(result.current.hasMore).toBe(false);
  });

  it("should send a message", async () => {
    mockClient.getHistory.mockResolvedValue({ messages: [], hasMore: false });
    mockClient.sendMessage.mockResolvedValue(mockMessage);

    const { result } = renderHook(() => useMessages(mockClient as unknown as HermesClient, mockRoomId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.sendMessage({ text: "Hello" } as any);
    });

    expect(mockClient.sendMessage).toHaveBeenCalledWith({ text: "Hello", roomId: mockRoomId });
  });

  it("should handle typing indicators", async () => {
    mockClient.getHistory.mockResolvedValue({ messages: [], hasMore: false });
    
    let typingStartedCb: Function | undefined;
    let typingStoppedCb: Function | undefined;

    mockClient.on.mockImplementation((event: string, cb: Function) => {
      if (event === "typing:started") typingStartedCb = cb;
      if (event === "typing:stopped") typingStoppedCb = cb;
    });

    const { result } = renderHook(() => useMessages(mockClient as unknown as HermesClient, mockRoomId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      typingStartedCb?.({ userId: "u2", displayName: "User 2", roomId: mockRoomId });
    });

    expect(result.current.typingUsers).toHaveLength(1);
    expect(result.current.typingUsers[0].userId).toBe("u2");

    act(() => {
      typingStoppedCb?.({ userId: "u2", roomId: mockRoomId });
    });

    expect(result.current.typingUsers).toHaveLength(0);
  });
});
