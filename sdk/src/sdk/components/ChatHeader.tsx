import React from "react";
import { useChat } from "../ChatProvider";

export const ChatHeader = () => {
  // We add activeChatId to know WHICH room we are in
  const { isTyping, searchQuery, setSearchQuery, activeChatId } = useChat();

  // If no chat is selected, don't show the header details
  if (!activeChatId) return null;

  return (
    <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white shadow-sm">
      <div className="d-flex flex-column">
        {/* Dynamically show the Chat Name */}
        <h5 className="mb-0 text-dark">
          {activeChatId.startsWith("group_")
            ? `👥 ${activeChatId.replace("group_", "")}`
            : `👤 ${activeChatId}`}
        </h5>
        {/* Typing indicator logic */}
        <span
          className={`small ${
            isTyping ? "text-success fw-bold" : "text-muted"
          }`}
        >
          {isTyping ? (
            <span className="animate-pulse">typing...</span>
          ) : (
            "Online"
          )}
        </span>
      </div>

      {/* Search Bar with Bootstrap styling */}
      <div className="w-25">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light border-end-0">🔍</span>
          <input
            type="text"
            className="form-control bg-light border-start-0 shadow-none"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
