# hermes-chat-react

> Real-time chat SDK for React — hooks, components, and typed events out of the box.

```bash
npm install hermes-chat-react
```

---

## What is this?

`hermes-chat-react` is the official React SDK for the **Hermes** real-time messaging engine. Drop in a fully working chat system — rooms, messages, typing indicators, presence, reactions, file uploads, read receipts — without building any of it yourself.

Built on **Socket.IO**, typed end-to-end with **TypeScript**, and designed to be styled however you want. (v0.1.6 includes externalized UI dependencies like emoji-picker-react for easier bundling!)

---

## Quick Start

```tsx
import { HermesClient } from "hermes-chat-react";
import {
  useMessages,
  useRooms,
  ChatInput,
  MessageList,
} from "hermes-chat-react/react";

// 1. Create and connect a client
const client = new HermesClient({
  endpoint: "https://your-hermes-server.com",
  apiKey: "YOUR_API_KEY",
  secret: "YOUR_SECRET",
  userId: "user_123",
  displayName: "Jane Doe",
});

await client.connect();

// 2. Use hooks in your components
function Chat() {
  const { rooms } = useRooms(client);
  const { messages, sendMessage } = useMessages(client, rooms[0]?._id);

  return (
    <>
      <MessageList messages={messages} currentUser={client.currentUser!} />
      <ChatInput
        onSendText={(text) => sendMessage({ type: "text", text })}
        onSendFile={() => {}}
      />
    </>
  );
}
```

---

## Two Ways to Authenticate

**Option A — API Key + Secret** _(server-to-server auth, recommended for production)_

```ts
const client = new HermesClient({
  endpoint: "https://your-hermes-server.com",
  apiKey: "YOUR_API_KEY",
  secret: "YOUR_SECRET",
  userId: "user_123",
  displayName: "Jane Doe",
  avatar: "https://...", // optional
  email: "jane@example.com", // optional
});
```

**Option B — Pre-issued Token** _(exchange credentials yourself, pass the token)_

```ts
const client = new HermesClient({
  endpoint: "https://your-hermes-server.com",
  token: "eyJhbGci...", // JWT from your auth flow
});
```

---

## Hooks

All hooks take a connected `HermesClient` instance.

### `useRooms(client)`

Manage rooms — list, create direct messages, create groups.

```ts
const {
  rooms, // Room[]
  loading, // boolean
  createDirect, // (input: CreateDirectRoomInput) => Promise<Room>
  createGroup, // (input: CreateGroupRoomInput) => Promise<Room>
} = useRooms(client);
```

### `useMessages(client, roomId)`

Send, edit, delete, and paginate messages in a room.

```ts
const {
  messages, // Message[]
  loading, // boolean
  loadingMore, // boolean
  hasMore, // boolean
  loadMore, // () => void
  sendMessage, // (input: SendMessageInput) => Promise<Message>
  editMessage, // (messageId, roomId, text) => Promise<Message>
  deleteMessage, // (messageId, roomId) => Promise<void>
  addReaction, // (messageId, roomId, emoji) => Promise<void>
} = useMessages(client, roomId);
```

### `useTyping(client, roomId)`

Typing indicators — start, stop, and listen for others.

```ts
const {
  typingText, // string — e.g. "Jane is typing..."
  startTyping, // () => void
  stopTyping, // () => void
} = useTyping(client, roomId);
```

### `usePresence(client)`

Track who's online in real time.

```ts
const { isOnline } = usePresence(client);

isOnline("user_123"); // boolean
```

### `useReadReceipts(client, roomId)`

Mark messages as seen and track who has read what.

```ts
const {
  markSeen, // (lastMessageId: string) => Promise<void>
  seenBy, // (messageId: string) => string[]
  receipts, // Map<string, Set<string>>
} = useReadReceipts(client, roomId);
```

### `useUpload(client)`

Upload files and send them as messages.

```ts
const {
  sendFile, // (roomId, file, replyTo?) => Promise<void>
  uploading, // boolean
} = useUpload(client);
```

---

## Components

Pre-built components you can drop in and style with CSS.

### `<MessageList />`

```tsx
<MessageList
  messages={messages}
  currentUser={currentUser}
  loading={loading}
  loadingMore={loadingMore}
  hasMore={hasMore}
  onLoadMore={loadMore}
  onEdit={editMessage}
  onDelete={deleteMessage}
  onReact={addReaction}
  onReply={(msg) => setReplyingTo(msg)}
  autoScroll
/>
```

### `<ChatInput />`

```tsx
<ChatInput
  onSendText={async (text) => sendMessage({ type: "text", text })}
  onSendFile={async (file) => sendFile(roomId, file)}
  onTypingStart={startTyping}
  onTypingStop={stopTyping}
  replyingTo={replyingTo}
  onCancelReply={() => setReplyingTo(null)}
  placeholder="Type a message..."
/>
```

### `<TypingIndicator />`

```tsx
<TypingIndicator typingText={typingText} />
```

### `<RoomList />` · `<OnlineBadge />` · `<ReactionPicker />` · `<MediaMessage />`

Additional utility components — import from `hermes-chat-react/react`.

---

## Styling

All components expose BEM class names so you can override any style.

```css
/* Message bubbles */
.hermes-message--own .hermes-message__bubble {
  background: #your-color;
}
.hermes-message--other .hermes-message__bubble {
  background: #your-color;
}

/* Input area */
.hermes-chat-input textarea {
  border-radius: 12px;
}
.hermes-chat-input button {
  background: #your-brand-color;
}

/* Typing indicator */
.hermes-typing-indicator {
  color: #your-color;
}

/* Load more button */
.hermes-load-more {
  border-radius: 8px;
}
```

---

## Events

Listen to real-time events directly on the client.

```ts
client.on("message:receive", (message) => console.log("New message", message));
client.on("user:online", (event) =>
  console.log(event.displayName, "came online"),
);
client.on("user:offline", (event) => console.log(event.userId, "went offline"));
client.on("typing:started", (event) =>
  console.log(event.displayName, "is typing"),
);
client.on("reaction:updated", (event) => console.log("Reaction update", event));
client.on("disconnected", (reason) => console.log("Lost connection:", reason));
client.on("error", (err) => console.error(err));
```

Full event reference:

| Event                | Payload                 |
| -------------------- | ----------------------- |
| `connected`          | —                       |
| `disconnected`       | `reason: string`        |
| `error`              | `Error`                 |
| `message:receive`    | `Message`               |
| `message:edited`     | `Message`               |
| `message:deleted`    | `{ messageId, roomId }` |
| `room:created`       | `Room`                  |
| `room:deleted`       | `{ roomId }`            |
| `room:member:joined` | `{ roomId, userId }`    |
| `room:member:left`   | `{ roomId, userId }`    |
| `user:online`        | `PresenceEvent`         |
| `user:offline`       | `LastSeenEvent`         |
| `typing:started`     | `TypingEvent`           |
| `typing:stopped`     | `TypingEvent`           |
| `receipt:updated`    | `ReceiptEvent`          |
| `reaction:updated`   | `ReactionEvent`         |

---

## TypeScript

Everything is typed. Import types directly:

```ts
import type {
  HermesConfig,
  HermesUser,
  Room,
  Message,
  SendMessageInput,
  MessageType,
  ConnectionStatus,
  PresenceEvent,
  TypingEvent,
  ReceiptEvent,
  ReactionEvent,
  UploadResult,
} from "hermes-chat-react";
```

---

## Client API

```ts
// Connection
client.connect()           // Promise<HermesUser>
client.disconnect()        // void
client.isConnected         // boolean
client.currentUser         // HermesUser | null
client.status              // ConnectionStatus

// Messaging
client.sendMessage(input)                          // Promise<Message>
client.editMessage(messageId, roomId, text)        // Promise<Message>
client.deleteMessage(messageId, roomId)            // Promise<void>
client.getHistory(roomId, before?, limit?)         // Promise<MessageHistoryResult>

// Rooms
client.getRooms()                                  // Promise<Room[]>
client.createDirectRoom({ targetUserId })          // Promise<Room>
client.createGroupRoom({ name, memberIds })        // Promise<Room>
client.deleteRoom(roomId)                          // Promise<void>
client.addMember(roomId, userId)                   // Promise<void>
client.removeMember(roomId, userId)                // Promise<void>

// Presence & Typing
client.pingPresence(roomId)                        // void
client.startTyping(roomId)                         // void
client.stopTyping(roomId)                          // void

// Reactions & Receipts
client.addReaction(messageId, roomId, emoji)       // Promise<void>
client.markSeen(roomId, lastMessageId)             // Promise<void>

// File Upload
client.uploadFile(file)                            // Promise<UploadResult>
```

---

## Peer Dependencies

```json
{
  "react": ">=17.0.0",
  "react-dom": ">=17.0.0"
}
```

---

## License

MIT © Harshavardanan Moorthy
