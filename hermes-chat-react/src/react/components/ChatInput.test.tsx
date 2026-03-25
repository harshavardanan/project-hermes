/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ChatInput } from "./ChatInput";

describe("ChatInput", () => {
  it("should render successfully with defaults", () => {
    const mockOnSendText = vi.fn();
    render(<ChatInput onSendText={mockOnSendText} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    expect(textarea).toBeInTheDocument();
    
    // The send button should be rendered and initially disabled
    const sendButton = screen.getByRole("button");
    expect(sendButton).toBeDisabled();
  });

  it("should type and enable send button, then call onSendText", async () => {
    const user = userEvent.setup();
    const mockOnSendText = vi.fn().mockResolvedValue(undefined);
    const mockOnTypingStart = vi.fn();
    const mockOnTypingStop = vi.fn();

    render(
      <ChatInput
        onSendText={mockOnSendText}
        onTypingStart={mockOnTypingStart}
        onTypingStop={mockOnTypingStop}
      />
    );

    const textarea = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByRole("button");

    expect(sendButton).toBeDisabled();

    // Type "Hello"
    await user.type(textarea, "Hello");

    expect(mockOnTypingStart).toHaveBeenCalled();
    expect(sendButton).not.toBeDisabled();

    // Click send
    await user.click(sendButton);

    expect(mockOnSendText).toHaveBeenCalledWith("Hello");
    expect(mockOnTypingStop).toHaveBeenCalled();
    
    // Textarea should be cleared
    expect(textarea).toHaveValue("");
    expect(sendButton).toBeDisabled();
  });

  it("should send message on Enter key press", async () => {
    const user = userEvent.setup();
    const mockOnSendText = vi.fn().mockResolvedValue(undefined);

    render(<ChatInput onSendText={mockOnSendText} />);
    const textarea = screen.getByPlaceholderText("Type a message...");

    await user.type(textarea, "Testing Enter Key{enter}");

    expect(mockOnSendText).toHaveBeenCalledWith("Testing Enter Key");
    expect(textarea).toHaveValue("");
  });

  it("should not send message on Shift+Enter", async () => {
    const user = userEvent.setup();
    const mockOnSendText = vi.fn();

    render(<ChatInput onSendText={mockOnSendText} />);
    const textarea = screen.getByPlaceholderText("Type a message...");

    await user.type(textarea, "Line 1{shift>}{enter}{/shift}Line 2");

    expect(mockOnSendText).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("Line 1\nLine 2");
  });

  it("should render file attachment button and handle file selection", async () => {
    const user = userEvent.setup();
    const mockOnSendFile = vi.fn().mockResolvedValue(undefined);

    render(<ChatInput onSendText={vi.fn()} onSendFile={mockOnSendFile} />);
    
    // There are now two buttons: attach and send
    const buttons = screen.getAllByRole("button");
    const attachButton = buttons[0];

    // File input is hidden but we can find it by its type/accept properties or test id if added. We'll use document.querySelector for simplicity in this DOM.
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const file = new File(["hello"], "hello.png", { type: "image/png" });
    await user.upload(fileInput, file);

    expect(mockOnSendFile).toHaveBeenCalledTimes(1);
    expect(mockOnSendFile).toHaveBeenCalledWith(file);
  });

  it("should render replyingTo block and handle cancel", async () => {
    const user = userEvent.setup();
    const mockOnCancelReply = vi.fn();
    
    const replyingToMessage = { _id: "1", type: "text", text: "Original message" } as unknown as any;

    render(
      <ChatInput
        onSendText={vi.fn()}
        replyingTo={replyingToMessage}
        onCancelReply={mockOnCancelReply}
      />
    );

    expect(screen.getByText("Replying to:")).toBeInTheDocument();
    expect(screen.getByText("Original message")).toBeInTheDocument();

    const cancelBtn = screen.getByText("✕");
    await user.click(cancelBtn);

    expect(mockOnCancelReply).toHaveBeenCalledTimes(1);
  });
});
