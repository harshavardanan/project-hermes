# Quick Start & Architecture

The Hermes Chat SDK (`hermes-chat-react`) provides a suite of deeply integrated React components and a lightweight JavaScript client to power real-time messaging applications. 

## 1. Installation

Install the library using your package manager. The SDK ships with its own TypeScript definitions.

```bash
npm install hermes-chat-react
# or
yarn add hermes-chat-react
```

## 2. Architecture Overview

The Hermes SDK relies on a strict parent-child Context Architecture to prevent prop-drilling:

1. **The Core Client:** You initialize a `HermesClient` to manage WebSockets and REST requests.
2. **The Global Context (`<Chat>`):** Wrap your application in the `<Chat>` provider. This passes the `HermesClient` and user state to all child components.
3. **The Room Context (`<Room>`):** To render conversations, wrap your view components in `<Room roomId={id}>`. This automates message fetching, typing indicators, and WebSocket subscriptions for that specific channel.
4. **UI Components:** Components like `<MessageList>` and `<ChatInput>` require almost no props—they automatically infer state from the nearest `<Room>` provider.

## 3. Hello World: Your First Chat App

Here is a complete, minimal React application demonstrating the SDK.

```tsx
import React, { useState, useEffect } from "react";
// 1. Import the Core Client and React UI Components
import { 
  HermesClient, 
  Chat, 
  RoomList, 
  Room, 
  Window, 
  MessageList, 
  ChatInput 
} from "hermes-chat-react/react";

const App = () => {
  const [client, setClient] = useState<HermesClient | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    // 2. Initialize the HermesClient
    const initHermes = async () => {
      const hClient = new HermesClient({
        endpoint: "https://api.yourdomain.com", // Your Hermes Backend URL
        apiKey: "YOUR_API_KEY",
        secret: "YOUR_SECRET_KEY",
        userId: "user-123",
        displayName: "Alice"
      });

      // 3. Connect to the server
      await hClient.connect();
      setClient(hClient);
    };

    initHermes();

    // 4. Disconnect on unmount
    return () => {
       if (client) client.disconnect();
    };
  }, []);

  if (!client) return <div>Connecting to Hermes...</div>;

  return (
    // 5. Provide the global <Chat> context
    <Chat client={client}>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        
        {/* The Sidebar: Displays all rooms the user is a member of */}
        <div style={{ width: '320px', borderRight: '1px solid #ccc' }}>
          <RoomList 
            onSelectRoom={(room) => setActiveRoomId(room._id)} 
          />
        </div>

        {/* The Main View: Renders the active conversation */}
        <div style={{ flex: 1, display: 'flex' }}>
          {activeRoomId ? (
            // 6. Provide the active <Room> context
            <Room roomId={activeRoomId}>
              <Window>
                <MessageList />
                <ChatInput />
              </Window>
            </Room>
          ) : (
            <div style={{ margin: 'auto' }}>Please select a chat.</div>
          )}
        </div>

      </div>
    </Chat>
  );
};

export default App;
```

### What's happening in this code?
Notice how incredibly lean the UI code is. We did not need to pass an `onSendMessage` callback to `<ChatInput>`, nor did we pass a `messages` array to `<MessageList>`. 

Because they sit directly inside `<Room>`, the SDK automatically tracks the state, handles pagination, and listens for the `message:receive` WebSocket events. When you select a new room from the `<RoomList>`, React unmounts and remounts `<Room>`, causing it to effortlessly query the new channel history.
