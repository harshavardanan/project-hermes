# Core React Components

The Hermes React SDK acts as a highly opinionated hierarchy of structural components. To use them properly, you must understand how they nest together.

## 1. Global Providers

### `<Chat>`

The `<Chat>` component initializes the theme and the `HermesClient` context globally. It is the absolute highest-level wrapper for any chat interface.

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `client` | `HermesClient` | **Required** | The initialized JavaScript client instance. |
| `theme` | `"light" \| "dark" \| string` | `"light"` | Base theme targeting class (e.g. `.hermes-chat--dark`). |
| `customClasses` | `CustomClasses` | `undefined` | Granular overrides for internal layout wrappers. |

**Real Code Example:**
```tsx
import React, { useEffect, useState } from "react";
import { Chat, HermesClient } from "hermes-chat-react/react";

const ChatAppWrapper = ({ children }) => {
  const [chatClient, setChatClient] = useState<HermesClient | null>(null);

  useEffect(() => {
    const init = async () => {
      const client = new HermesClient({
        endpoint: "https://api.myapp.com",
        apiKey: "PUBLIC_KEY",
        userId: "user-42"
      });
      await client.connect();
      setChatClient(client);
    };
    init();
  }, []);

  if (!chatClient) return <div>Connecting to Chat Server...</div>;

  return (
    // Pass the client and force a dark theme with standard flexbox height
    <Chat 
      client={chatClient} 
      theme="dark"
      customClasses={{
        chat: "h-screen w-full flex bg-gray-900" 
      }}
    >
      {children}
    </Chat>
  );
};
```

---

## 2. Conversation Controllers

### `<Room>`

The `Room` wrapper subscribes the data layer for a specific chat. It does not render visible DOM nodes; it fetches historical data, joins the WebSocket channel, and maps typing indicators.

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `roomId` | `string` | **Required** | The channel's unique database ID. |
| `Message` | `ComponentType` | `undefined` | Total visual replacement for standard `Message` node. |

**Real Code Example:**
```tsx
import { Room, Window, MessageList, ChatInput } from "hermes-chat-react/react";

const ActiveConversation = ({ currentRoomId }) => {
  if (!currentRoomId) return <div>No chat selected.</div>;

  return (
    // When currentRoomId changes, this automatically cleans up the old websocket 
    // subscription and fetches the history for the new room!
    <Room roomId={currentRoomId}>
      <Window>
         <MessageList />
         <ChatInput />
      </Window>
    </Room>
  );
};
```

---

## 3. Structural Layout

### `<Window>`
Renders a CSS Flexbox-column `div` that strictly structures the conversation feed above the composer logic. Should always wrap `<MessageList>` and `<ChatInput>`.

**Real Code Example:**
```tsx
import { Window, MessageList, ChatInput } from "hermes-chat-react/react";

const standardChatLayout = (
  // The Window forces MessageList to stretch and ChatInput to stick to the bottom
  <Window className="flex-1 flex flex-col h-full bg-white relative">
    <div className="chat-header h-16 border-b">Header Details Here</div>
    <MessageList />
    <ChatInput className="shrink-0 p-4 border-t" />
  </Window>
);
```

### `<RoomList>`
Automatically maps and renders the `activeRooms` array provided by the `ChatContext` for the currently authenticated user.

**Real Code Example:**
```tsx
import { RoomList } from "hermes-chat-react/react";

const Sidebar = ({ setRoomId }) => {
  return (
    <div className="w-80 h-full border-r overflow-y-auto shrink-0">
      <h2 className="p-4 font-bold text-lg">My Chats</h2>
      <RoomList 
        onSelectRoom={(room) => {
          console.log(`User clicked room: ${room.name}`);
          setRoomId(room._id);
        }} 
      />
    </div>
  );
};
```

---

## 4. Interaction Engines

### `<MessageList>` & `<ChatInput>`
These are the core UI workhorses. Because they inherit state from `<Room>`, you do not need to pass them logic handlers.

**Real Code Example:**
```tsx
import { Room, Window, MessageList, ChatInput } from "hermes-chat-react/react";

const FullView = ({ activeId }) => {
  return (
    <Room roomId={activeId}>
       <Window>
         {/* Automatically renders the message history with dates and typing bubbles */}
         <MessageList 
            className="flex-1 overflow-y-auto p-4 custom-scrollbar" 
         />
         
         {/* Automatically handles text input, file attachments, and enter key submission */}
         <div className="p-3 bg-gray-50">
           <ChatInput 
              placeholder="Send a message to the group..."
              inputClassName="w-full rounded-2xl border px-4 py-2"
           />
         </div>
       </Window>
    </Room>
  );
};
```
