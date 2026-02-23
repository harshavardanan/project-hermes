import React from "react";
import { useChat } from "../ChatProvider";

export const MessageList = () => {
  const { messages, activeChatId, userId } = useChat();

  // Only show messages for this specific group/chat
  const filteredMessages = messages.filter(
    (m) => m.conversationId === activeChatId
  );

  return (
    <div
      className="d-flex flex-column p-3 bg-light overflow-auto"
      style={{ height: "400px" }}
    >
      {filteredMessages.map((msg) => {
        // --- THE FIX IS HERE ---
        const isMe = msg.senderId === userId;

        return (
          <div
            key={msg.id}
            className={`bubble mb-2 shadow-sm ${
              isMe ? "bubble-me" : "bubble-them"
            }`}
            style={{
              maxWidth: "75%",
              padding: "8px 12px",
              borderRadius: "10px",
              // Bootstrap utility classes for alignment
              alignSelf: isMe ? "flex-end" : "flex-start",
              backgroundColor: isMe ? "#dcf8c6" : "#ffffff",
              border: isMe ? "none" : "1px solid #dee2e6",
            }}
          >
            {/* Show Sender Name if it's NOT me (WhatsApp style) */}
            {!isMe && (
              <small
                className="d-block fw-bold text-primary mb-1"
                style={{ fontSize: "0.7rem" }}
              >
                {msg.senderId}
              </small>
            )}

            <div className="text-dark">{msg.text}</div>

            <div className="text-end opacity-50" style={{ fontSize: "0.6rem" }}>
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
