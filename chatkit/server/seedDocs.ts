import mongoose from "mongoose";
import dotenv from "dotenv";
import { Doc } from "./src/models/Document.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatkit";

const docs = [
  {
    title: "1. Introduction & Setup",
    slug: "sdk-intro",
    category: "hermes-chat-react",
    order: 0,
    content: "# Introduction to Hermes Chat React\n\nWelcome to the official documentation for the `hermes-chat-react` SDK. This library provides a professional, highly scalable suite of React components, hooks, and core APIs to integrate real-time chat directly into your application.\n\n## Installation\n\nInstall the SDK via your preferred package manager:\n\n```bash\nnpm install hermes-chat-react\n# or\nyarn add hermes-chat-react\n```\n\n## Quick Start\n\nTo begin using the SDK, wrap your application with the `HermesProvider` and supply your backend configuration.\n\n```tsx\nimport { HermesProvider } from 'hermes-chat-react';\n\nconst config = {\n  endpoint: 'https://your-server.com', // Your Hermes backend URL\n  token: 'eyJhbGci...'\n};\n\nfunction App() {\n  return (\n    <HermesProvider config={config}>\n      <YourChatApp />\n    </HermesProvider>\n  );\n}\n```\n"
  },
  {
    title: "2. Core Concepts: Authentication & Provider",
    slug: "sdk-core",
    category: "hermes-chat-react",
    order: 1,
    content: "# Core Concepts\n\nThe SDK relies on the `HermesProvider` to manage the underlying WebSocket connection (`socket.io-client`) and distribute the connection context across your React tree.\n\n## HermesConfig Type\n\nThe `config` prop accepted by `HermesProvider` takes a `HermesConfig` object. You can authenticate either using a pre-signed JWT token or via API keys (recommended for server-side environments only).\n\n```typescript\ntype HermesConfig =\n  | { endpoint: string; token: string }\n  | {\n      endpoint: string;\n      apiKey: string;\n      secret: string;\n      userId: string;\n      displayName?: string;\n      avatar?: string;\n    };\n```\n\n## useHermes Context Hook\n\nIf you want low-level access to the socket engine, use the `useHermes` hook.\n\n### Returns:\n- `client` (*HermesClient*): The core engine instance.\n- `isConnected` (*boolean*): Real-time connection status.\n- `user` (*HermesUser*): The currently authenticated user.\n- `error` (*string | null*): Connection errors.\n\n```tsx\nimport { useHermes } from 'hermes-chat-react';\n\nfunction ConnectionStatus() {\n  const { isConnected, user } = useHermes();\n  return <div>{isConnected ? `Online as ${user.displayName}` : 'Connecting...'}</div>;\n}\n```\n"
  },
  {
    title: "3. React Hooks Reference",
    slug: "sdk-hooks",
    category: "hermes-chat-react",
    order: 2,
    content: "# React Hooks\n\nWe provide optimized React hooks to interact with chat data securely and reactively.\n\n## `useRooms()`\n\nManages the user's active rooms, automatically applying newly created rooms and updating read counts.\n\n### Returns:\n- `rooms` (*Room[]*): Array of available rooms.\n- `loading` (*boolean*): Loading state.\n- `createDirect(input: CreateDirectRoomInput)`: Initiates a 1-on-1 DM.\n- `createGroup(input: CreateGroupRoomInput)`: Creates a group room.\n\n```tsx\nconst { rooms, createDirect } = useRooms();\n\nconst startChat = () => {\n  createDirect({ targetUserId: 'user-456' });\n};\n```\n\n## `useMessages(roomId: string)`\n\nHandles the entire message pipeline for a designated room, tracking message edits, deletions, typing indicators, and reactions seamlessly.\n\n### Arguments:\n- `roomId` (*string*): The ID of the active room.\n\n### Returns:\n- `messages` (*Message[]*): The real-time list of messages.\n- `hasMore` (*boolean*): Whether more historical messages exist.\n- `loadMore()`: Fetches the next page of older messages.\n- `sendMessage(input: Omit<SendMessageInput, 'roomId'>)`: Sends a new text/media message.\n- `typingUsers` (*Array*): Users currently typing in this room.\n\n```tsx\nconst { messages, sendMessage, typingUsers } = useMessages('room-123');\n\nconst onSubmit = () => sendMessage({ text: 'Hello!' });\n```\n"
  },
  {
    title: "4. UI Components",
    slug: "sdk-components",
    category: "hermes-chat-react",
    order: 3,
    content: "# UI Components\n\n**hermes-chat-react** ships with fully styled, headless-compatible components out of the box.\n\n## `<RoomList />`\n\nDisplays the sidebar list of rooms with relative timestamps, unread badges, and last message previews.\n\n### Props:\n- `rooms` (*Room[], required*): The array of rooms.\n- `currentUserId` (*string, required*): The active user's ID.\n- `activeRoomId` (*string*): Highlights the currently selected room.\n- `onSelectRoom` (*(room: Room) => void, required*): Callback fired upon click.\n- `onCreateDirect`, `onCreateGroup`: Callbacks for the creation headers.\n\n```tsx\n<RoomList \n  rooms={rooms}\n  currentUserId=\"user-123\"\n  activeRoomId={activeRoom?._id}\n  onSelectRoom={setActiveRoom}\n/>\n```\n\n## `<MessageList />`\n\nA robust main feed rendering sophisticated message bubbles, media types, automated scroll-to-bottom features, and typing indicators.\n\n### Props:\n- `messages` (*Message[], required*): The message history.\n- `currentUser` (*HermesUser, required*): The active user.\n- `hasMore` (*boolean*): True if pagination is possible.\n- `onLoadMore` (*() => void*): Trigger history pagination.\n- `onReact`, `onEdit`, `onDelete`: Action button callbacks.\n\n```tsx\n<MessageList \n  messages={messages}\n  currentUser={user}\n  hasMore={hasMore}\n  onLoadMore={loadMore}\n  onReact={(msgId, emoji) => console.log('Reacted with', emoji)}\n/>\n```\n\n## `<ChatInput />`\n\nThe text entry field with dynamic resizing and optional file attachments.\n\n### Props:\n- `onSendText` (*(text: string) => void*): Fired on Enter or Submit.\n- `onSendFile` (*(file: File) => void*): Fired on attachment selection.\n- `replyingTo` (*Message*): Triggers the \"Replying to...\" UI state block.\n\n```tsx\n<ChatInput \n  placeholder=\"Type a message...\"\n  onSendText={(text) => handleSend(text)}\n/>\n```\n"
  },
  {
    title: "5. Types Reference",
    slug: "sdk-types",
    category: "hermes-chat-react",
    order: 4,
    content: "# Types Reference\n\nUnderstanding the core data structures utilized by the Hermes SDK.\n\n## `HermesUser`\n\n```typescript\ninterface HermesUser {\n  userId: string;\n  displayName: string;\n  avatar?: string;\n  email?: string;\n}\n```\n\n## `Room`\n\n```typescript\ninterface Room {\n  _id: string;\n  type: 'direct' | 'group';\n  projectId: string;\n  name?: string;\n  members: string[]; // User IDs\n  isActive: boolean;\n  lastActivity: string;\n  metadata?: Record<string, any>;\n  unreadCount: number;\n  lastMessage?: Message;\n}\n```\n\n## `Message`\n\n```typescript\ninterface Message {\n  _id: string;\n  roomId: string;\n  senderId: string;\n  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'link';\n  text?: string;\n  url?: string;\n  fileName?: string;\n  fileSize?: number;\n  replyTo?: string;\n  reactions?: Reaction[];\n  isDeleted?: boolean;\n  createdAt: string;\n  editedAt?: string;\n}\n```\n"
  }
];

async function seedDocs() {
  try {
    console.log("Connecting to MongoDB database at", MONGO_URI, "...");
    await mongoose.connect(MONGO_URI);
    
    // Clear existing docs in the category to avoid duplicates
    await Doc.deleteMany({ category: "hermes-chat-react" });
    
    for (const doc of docs) {
      await Doc.create({
        ...doc,
        lastUpdated: new Date()
      });
      console.log(`✅ Default documentation created: ${doc.title}`);
    }

    console.log("-----------------------------------------");
    console.log("🎉 SDK Documentation seeded successfully!");
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding docs:", error);
    process.exit(1);
  }
}

seedDocs();
