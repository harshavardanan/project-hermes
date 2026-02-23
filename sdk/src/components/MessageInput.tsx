import { useState } from "react";

export default function MessageInput({
  onSend,
}: {
  onSend: (t: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div style={{ display: "flex", padding: 10 }}>
      <input
        style={{ flex: 1 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            onSend(text);
            setText("");
          }
        }}
        placeholder="Type a message"
      />
      <button
        onClick={() => {
          if (text.trim()) {
            onSend(text);
            setText("");
          }
        }}
      >
        Send
      </button>
    </div>
  );
}
