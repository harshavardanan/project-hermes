import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

type Props = {
  messages: any[];
  onSend: (text: string) => void;
};

export default function ChatWindow({ messages, onSend }: Props) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <MessageList messages={messages} />
      <MessageInput onSend={onSend} />
    </div>
  );
}
