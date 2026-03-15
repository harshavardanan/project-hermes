# hermes-sdk

Official React SDK for the **Hermes** real-time messaging engine.

## Installation

```bash
npm install hermes-sdk
```

## Quick Start

```tsx
import { HermesClient } from "hermes-sdk";
import { useMessages, useRooms, ChatInput, MessageList } from "hermes-sdk/react";

const client = new HermesClient({
  endpoint: "https://your-backend.up.railway.app",
  apiKey: "YOUR_API_KEY",
  secret: "YOUR_SECRET",
  userId: "user_123",
  displayName: "Alice",
});

await client.connect();
```

## React Hooks

| Hook | Description |
|---|---|
| `useMessages(client, roomId)` | Messages, send, edit, delete, react |
| `useRooms(client)` | Room list, create DM, create group |
| `usePresence(client)` | Online/offline presence |
| `useTyping(client, roomId)` | Typing indicators |
| `useReadReceipts(client, roomId)` | Mark seen, receipt events |
| `useUpload(client)` | File uploads |

## React Components

| Component | Description |
|---|---|
| `<MessageList />` | Scrollable message thread with reactions, replies, edit, delete |
| `<ChatInput />` | Text input with file upload and reply preview |
| `<RoomList />` | Sidebar room list with unread badges |
| `<TypingIndicator />` | Animated typing indicator |
| `<OnlineBadge />` | Presence dot |

## License

MIT
