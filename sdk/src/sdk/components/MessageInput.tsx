import React, { useState, useRef } from "react";
import { useChat } from "../ChatProvider";
export const MessageInput = () => {
  const { sendMessage, sendTypingStatus } = useChat();
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    // Tell backend we are typing
    sendTypingStatus(true);

    // Stop typing indicator after 2 seconds of silence
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };

  return (
    <div className="input-row">
      <input value={text} onChange={handleInputChange} />
      <button
        onClick={() => {
          sendMessage(text);
          setText("");
        }}
      >
        Send
      </button>
    </div>
  );
};
