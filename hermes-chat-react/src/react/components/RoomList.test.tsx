/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { RoomList } from "./RoomList";
import type { Room } from "../../types/index";

describe("RoomList", () => {
  const mockCurrentUserId = "user1";
  const mockRooms: Room[] = [
    {
      _id: "r1",
      type: "direct",
      members: ["user1", "user2"],
      isActive: true,
      lastActivity: new Date().toISOString(),
      unreadCount: 2,
      lastMessage: { type: "text", text: "Are you there?" } as any
    } as unknown as Room,
    {
      _id: "r2",
      type: "group",
      name: "Engineering Team",
      members: ["user1", "user3", "user4"],
      isActive: true,
      lastActivity: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 0,
      lastMessage: { type: "image", fileName: "arch.png" } as any
    } as unknown as Room
  ];

  it("should render loading state", () => {
    render(
      <RoomList 
        rooms={[]} 
        currentUserId={mockCurrentUserId} 
        onSelectRoom={vi.fn()} 
        loading={true} 
      />
    );
    expect(screen.getByText("Loading rooms...")).toBeInTheDocument();
  });

  it("should render empty state", () => {
    render(
      <RoomList 
        rooms={[]} 
        currentUserId={mockCurrentUserId} 
        onSelectRoom={vi.fn()} 
      />
    );
    expect(screen.getByText("No conversations yet.")).toBeInTheDocument();
  });

  it("should render rooms list correctly", () => {
    render(
      <RoomList 
        rooms={mockRooms} 
        currentUserId={mockCurrentUserId} 
        onSelectRoom={vi.fn()} 
      />
    );

    // Group room
    expect(screen.getByText("Engineering Team")).toBeInTheDocument();
    expect(screen.getByText("📷 Image")).toBeInTheDocument();
    
    // Direct room
    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.getByText("Are you there?")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Unread count
  });

  it("should trigger onSelectRoom when a room is clicked", async () => {
    const user = userEvent.setup();
    const mockOnSelectRoom = vi.fn();

    render(
      <RoomList 
        rooms={mockRooms} 
        currentUserId={mockCurrentUserId} 
        onSelectRoom={mockOnSelectRoom} 
      />
    );

    const roomElement = screen.getByText("Engineering Team");
    await user.click(roomElement);

    expect(mockOnSelectRoom).toHaveBeenCalledTimes(1);
    expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[1]);
  });

  it("should render and trigger create buttons", async () => {
    const user = userEvent.setup();
    const mockOnCreateDirect = vi.fn();
    const mockOnCreateGroup = vi.fn();

    render(
      <RoomList 
        rooms={mockRooms} 
        currentUserId={mockCurrentUserId} 
        onSelectRoom={vi.fn()} 
        onCreateDirect={mockOnCreateDirect}
        onCreateGroup={mockOnCreateGroup}
      />
    );

    const directBtn = screen.getByText("+ Direct");
    const groupBtn = screen.getByText("+ Group");

    expect(directBtn).toBeInTheDocument();
    expect(groupBtn).toBeInTheDocument();

    await user.click(directBtn);
    expect(mockOnCreateDirect).toHaveBeenCalledTimes(1);

    await user.click(groupBtn);
    expect(mockOnCreateGroup).toHaveBeenCalledTimes(1);
  });
});
