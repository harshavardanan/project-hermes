type Message = {
  from: string;
  text: string;
};

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <b>{m.from}:</b> {m.text}
        </div>
      ))}
    </div>
  );
}
