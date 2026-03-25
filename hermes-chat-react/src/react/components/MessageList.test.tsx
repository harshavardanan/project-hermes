/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MessageList } from "./MessageList";
import type { Message, HermesUser } from "../../types/index";

describe("MessageList", () => {
  const currentUser: HermesUser = { userId: "user1", displayName: "Test User" };
  const mockMessages: Message[] = [
    { _id: "m1", roomId: "r1", senderId: "user1", text: "Hello from me", type: "text", createdAt: new Date().toISOString() } as unknown as Message,
    { _id: "m2", roomId: "r1", senderId: "user2", text: "Hello from them", type: "text", createdAt: new Date().toISOString() } as unknown as Message,
    { _id: "m3", roomId: "r1", senderId: "user2", type: "image", url: "http://image.png", fileName: "test.png", createdAt: new Date().toISOString() } as unknown as Message,
    { _id: "m4", roomId: "r1", senderId: "user1", isDeleted: true, createdAt: new Date().toISOString() } as unknown as Message,
  ];

  it("should render loading state", () => {
    render(<MessageList messages={[]} currentUser={currentUser} loading={true} />);
    expect(screen.getByText("Loading messages...")).toBeInTheDocument();
  });

  it("should render empty state", () => {
    render(<MessageList messages={[]} currentUser={currentUser} />);
    expect(screen.getByText("No messages yet. Say hello! 👋")).toBeInTheDocument();
  });

  it("should render messages list properly", () => {
    render(<MessageList messages={mockMessages} currentUser={currentUser} />);
    
    // Text messages
    expect(screen.getByText("Hello from me")).toBeInTheDocument();
    expect(screen.getByText("Hello from them")).toBeInTheDocument();
    
    // Image message
    const img = screen.getByAltText("test.png");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://image.png");

    // Deleted message
    expect(screen.getByText("This message was deleted.")).toBeInTheDocument();
  });

  it("should render typing indicators", () => {
    render(
      <MessageList 
        messages={[]} 
        currentUser={currentUser} 
        typingUsers={[{ userId: "u2", displayName: "Alice" }, { userId: "u3", displayName: "Bob" }]} 
      />
    );
    expect(screen.getByText("Alice and Bob are typing")).toBeInTheDocument();
  });

  it("should call onLoadMore when Load older messages button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnLoadMore = vi.fn();
    
    render(
      <MessageList 
        messages={mockMessages} 
        currentUser={currentUser} 
        hasMore={true}
        onLoadMore={mockOnLoadMore}
      />
    );

    const loadMoreBtn = screen.getByText("Load older messages");
    await user.click(loadMoreBtn);

    expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
  });

  it("should handle message actions (edit, delete, reply, react)", async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnReply = vi.fn();
    const mockOnReact = vi.fn();

    // Mock window.prompt for edit
    global.prompt = vi.fn().mockReturnValue("Edited text");

    const root = render(
      <MessageList 
        messages={[mockMessages[0]]} 
        currentUser={currentUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onReply={mockOnReply}
        onReact={mockOnReact}
      />
    );

    // Hover over the message to reveal action buttons
    // The message row contains the text "Hello from me"
    const messageRow = screen.getByText("Hello from me").closest("div[style*='align-items: flex-end']");
    fireEvent.mouseEnter(messageRow!);

    // Reply Button
    const replyBtn = screen.getByTitle("Reply");
    fireEvent.click(replyBtn);
    expect(mockOnReply).toHaveBeenCalledWith(mockMessages[0]);

    // Delete Button
    const deleteBtn = screen.getByTitle("Delete");
    fireEvent.click(deleteBtn);
    expect(mockOnDelete).toHaveBeenCalledWith("m1");

    // Edit Button
    const editBtn = screen.getByTitle("Edit");
    fireEvent.click(editBtn);
    expect(global.prompt).toHaveBeenCalledWith("Edit message:", "Hello from me");
    expect(mockOnEdit).toHaveBeenCalledWith("m1", "Edited text");

    // React Button
    const reactBtn = screen.getByTitle("React");
    fireEvent.click(reactBtn);
    
    // Clicking React opens the picker. Let's click the first emoji 🔥 
    // Just find any button with emoji inside the picker visually (picker renders emojis as text buttons)
    const fireEmojiBtn = await screen.findByText("🔥");
    fireEvent.click(fireEmojiBtn);
    expect(mockOnReact).toHaveBeenCalledWith("m1", "🔥");
  });
});
