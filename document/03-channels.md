# Channels (Rooms)

Channels (referred to as "Rooms" internally in Hermes) are the foundational containers for conversation. The SDK allows you to query existing rooms, create new direct messages, group chats, and read member lists.

## The `<RoomList>` Component

The easiest way to display available channels is via the `<RoomList>` component, which automatically fetches the user's active rooms upon mounting.

**Real Code Example: A Functional Sidebar**
```tsx
import React, { useState } from "react";
import { RoomList } from "hermes-chat-react/react";

export const HermesSidebar = () => {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full w-[300px] border-r bg-gray-50">
      <div className="p-4 font-bold border-b shadow-sm">
        Conversations
      </div>
      <div className="flex-1 overflow-y-auto">
        {/*
          RoomList automatically draws from the ChatContext.
          When a user clicks on a channel, we store the ID in React state.
        */}
        <RoomList 
          onSelectRoom={(room) => {
             console.log("Joined Channel:", room.name || room._id);
             setActiveRoomId(room._id);
          }} 
        />
      </div>
      {activeRoomId && (
         <div className="p-2 text-xs text-center border-t text-gray-500">
           Currently viewing: {activeRoomId}
         </div>
      )}
    </div>
  );
};
```

### Manual Querying (Headless)

To manually fetch the raw room directory outside the React context tree, call `client.getRooms()`.

```typescript
const fetchRoster = async (hermesClient) => {
  try {
    const rooms = await hermesClient.getRooms();
    console.log(`User is a member of ${rooms.length} rooms.`);
    
    rooms.forEach((room) => {
      console.log(`Room ID: ${room._id}`);
      console.log(`Members: ${room.members.join(", ")}`);
    });
  } catch (err) {
    console.error("Failed to load user channel list:", err);
  }
};
```

## Creating Channels

To create communication channels, you invoke explicit methods on the `HermesClient` engine. A common pattern is opening a modal to search the directory, then creating a direct room.

### Creating a Direct Room (1-on-1)

Use `createDirectRoom` passing the `targetUserId`. A new channel will be generated on the backend, and its ID can immediately be passed to the `<Room>` context provider.

**Real Code Example: Start a Chat Modal**
```tsx
import React, { useState } from "react";
// Assuming you have access to your hermes client instance
import { useChatContext } from "hermes-chat-react/react";

export const StartChatButton = ({ targetUser, onRoomCreated }) => {
  const { client } = useChatContext();
  const [isCreating, setIsCreating] = useState(false);

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      // Create a 1-on-1 direct channel!
      const room = await client.createDirectRoom({
        targetUserId: targetUser.userId, // e.g., "bob_smith_89"
      });
      
      // Pass the new room back up so your parent component can mount <Room roomId={room._id}>
      onRoomCreated(room);
    } catch (error) {
      console.error("Failed creating chat:", error);
      alert("Could not create channel!");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button 
      disabled={isCreating} 
      onClick={handleNewChat}
      className="bg-blue-600 px-4 py-2 rounded text-white"
    >
      {isCreating ? "Initializing Data..." : `Message ${targetUser.displayName}`}
    </button>
  );
};
```

## The `<Room>` Context Architecture

Once you have a valid `roomId`, you **must** mount a `<Room>` provider around your messaging application.

If you skip wrapping your app in `<Room>`, components like `<MessageList>` and `<ChatInput>` will catastrophically fail since they have no parent to read from.

**Real Code Example: Rendering the Feed**
```tsx
import { Room, Window, MessageList } from "hermes-chat-react/react";

const ConversationFeed = ({ roomId }) => {
  if (!roomId) return <div>Ready to chat. Select a room!</div>;

  return (
    // 1. Hook up the backend sockets for this specific room
    <Room roomId={roomId}>

      {/* 2. Setup the DOM Flexbox column for the UI */}
      <Window>

        {/* 3. The Message List magically renders all historical + incoming messages! */}
        <MessageList />
      </Window>
      
    </Room>
  );
};
```

### Channel Members & Pagination Caveat

A channel payload contains a `members` array object. Be aware that the `members` array contains string IDs, **not** fully hydrated user objects. To resolve a user's name or avatar, you must cross-reference it against the full directory by calling `await client.getUsers()`.
