import mongoose from "mongoose";
import dotenv from "dotenv";
import { Doc } from "../src/models/Document.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatkit";

// ─── TipTap JSON helpers ──────────────────────────────────────────────────────
const h1 = (text: string) => ({ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text }] });
const h2 = (text: string) => ({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] });
const h3 = (text: string) => ({ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text }] });
const p = (...runs: any[]) => ({ type: "paragraph", content: runs });
const t = (text: string) => ({ type: "text", text });
const bold = (text: string) => ({ type: "text", text, marks: [{ type: "bold" }] });
const code = (text: string) => ({ type: "text", text, marks: [{ type: "code" }] });
const hr = () => ({ type: "horizontalRule" });
const codeBlock = (lang: string, text: string) => ({ type: "codeBlock", attrs: { language: lang }, content: [{ type: "text", text }] });
const ul = (...items: any[][]) => ({ type: "bulletList", content: items.map(runs => ({ type: "listItem", content: [{ type: "paragraph", content: runs }] })) });
const ol = (...items: any[][]) => ({ type: "orderedList", content: items.map(runs => ({ type: "listItem", content: [{ type: "paragraph", content: runs }] })) });
const doc = (...nodes: any[]) => ({ type: "doc", content: nodes });
const link = (text: string, href: string) => ({ type: "text", text, marks: [{ type: "link", attrs: { href, target: "_blank", rel: "noopener noreferrer" } }] });

const allDocs = [
  // ─── 1. INTRODUCTION ────────────────────────────────────────────────────────
  {
    title: "What is Hermes?",
    slug: "what-is-hermes",
    category: "1. Introduction",
    order: 10,
    content: doc(
      h1("What is Hermes?"),
      p(t("Hermes is a powerful, self-hosted real-time messaging engine and React SDK that lets developers add rich chat, notifications, and live collaboration features to any application — in minutes, not months.")),
      p(t("Building a scalable chat backend from scratch is hard. You would need to manage WebSockets, message persistence, presence tracking, typing indicators, thread management, read receipts, file uploads, and complex real-time state synchronization. Hermes provides a production-ready solution that handles all of this for you, so you can focus on your actual product.")),

      h2("What can you build with Hermes?"),
      ul(
        [bold("In-app chat"), t(" — Seamless 1-on-1 or group conversations inside your product, just like Slack or Discord.")],
        [bold("Customer support"), t(" — Live chat between agents and customers with real-time updates.")],
        [bold("Collaborative spaces"), t(" — Real-time event broadcasting and shared UI state for collaborative tools.")],
        [bold("Live feeds"), t(" — Instant comments, emoji reactions, and read receipts for social apps.")],
        [bold("Notification systems"), t(" — Push real-time alerts and data updates to connected users.")],
      ),

      h2("The Three Pillars of Hermes"),
      p(t("Hermes is built around three tightly integrated components that work together:")),
      ol(
        [bold("The Node.js Engine"), t(" — A self-hosted, scalable Socket.IO + MongoDB backend. You own your infrastructure and your data 100%. Messages never touch a third-party server. Deploy the engine to Vercel, Railway, Render, AWS, or any Node.js host.")],
        [bold("The React SDK"), t(" (hermes-chat-react) — A beautifully designed, context-driven component library for React and Next.js. Install it via npm and build a full chat UI in minutes.")],
        [bold("The Admin Dashboard"), t(" — A web UI to create and manage API keys, monitor projects, and configure authentication credentials.")],
      ),

      h2("Why self-hosted?"),
      p(t("Most chat SDKs send your messages through their servers, charge per message, and lock you in to proprietary infrastructure. With Hermes, you deploy the engine on your own infrastructure. Your users' messages never leave your environment. You control scaling, pricing, and data retention.")),
      p(t("This makes Hermes ideal for applications that handle sensitive conversations, have strict GDPR requirements, or simply want to avoid per-message billing at scale.")),
    )
  },

  {
    title: "Core Architecture",
    slug: "core-architecture",
    category: "1. Introduction",
    order: 11,
    content: doc(
      h1("Core Architecture"),
      p(t("Understanding how Hermes works internally will help you customize it, debug issues, and build more advanced integrations. Let's walk through the entire data flow from the browser to the database and back.")),

      h2("The Big Picture"),
      p(t("Here is the complete flow of a message from one user to another:")),
      ol(
        [t("User A types a message and presses Send.")],
        [t("The React SDK emits a "), code("message:send"), t(" event over the WebSocket connection to the Hermes Engine.")],
        [t("The Engine validates the request, saves the message to MongoDB, and broadcasts "), code("message:receive"), t(" to all users in the room.")],
        [t("The SDK on User B's device hears "), code("message:receive"), t(" and updates the React state.")],
        [t("User B's "), code("<MessageList>"), t(" re-renders and shows the new message instantly.")],
      ),
      p(t("This entire round-trip typically completes in under 50ms on a good connection.")),

      h2("1. The HermesClient — Your Central Control"),
      p(t("Everything in the SDK revolves around the "), code("HermesClient"), t(" class. Think of it as the brain of your chat integration. It is responsible for:")),
      ul(
        [t("Authenticating against the Hermes Engine via your API key and secret")],
        [t("Establishing and maintaining the Socket.IO WebSocket connection")],
        [t("Emitting events to the server (send message, create room, etc.)")],
        [t("Receiving and forwarding server events to React hooks and components")],
        [t("Auto-reconnecting if the connection drops (up to 5 attempts)")],
      ),
      codeBlock("tsx",
        "// You create ONE HermesClient instance and share it across your app\nconst client = new HermesClient({\n  endpoint: \"https://your-hermes-server.com\",\n  apiKey: \"proj_abc123\",\n  secret: \"sk_yoursecrethere\",\n  userId: \"user_uuid_from_your_system\",\n  displayName: \"Alice\"\n});\n\n// connect() does two things:\n// 1. POSTs to /hermes/connect to exchange credentials for a JWT token\n// 2. Opens a Socket.IO connection authenticated with that token\nawait client.connect();"
      ),

      h2("2. Authentication Flow"),
      p(t("When you call "), code("client.connect()"), t(", the SDK first makes an HTTP POST request to "), code("/hermes/connect"), t(" on your server with your API key, secret, and user information. The server validates the credentials and returns a short-lived JWT token. The SDK then uses this token to authenticate the WebSocket connection.")),
      p(t("This means even if someone somehow intercepts your API key, they still need the secret to get a token — and tokens expire automatically.")),

      h2("3. React Context Providers"),
      p(t("The SDK uses React Context to share state efficiently across your component tree, without prop drilling. There are several nested context layers:")),
      ul(
        [code("<Chat>"), t(" — The outermost layer. Holds the client instance and the currently authenticated user. Wraps your entire chat UI.")],
        [code("<Room>"), t(" — A context provider that subscribes to a specific room's messages, typing events, and receipts. It is invisible — it renders no DOM, only manages state.")],
        [code("ComponentContext"), t(" — Allows you to override any default component (like the loader or date separator) with your own custom component.")],
      ),

      h2("4. View Components"),
      p(t("Because "), code("<Room>"), t(" manages all the state, your UI components are simple and focused. They just read from context and render:")),
      codeBlock("tsx",
        "// This is all you need for a fully working real-time chat view.\n// <Room> automatically fetches history, subscribes to new messages,\n// tracks typing users, and marks messages as seen.\n<Chat client={client}>\n  <Room roomId=\"room_abc123\">\n    <MessageList />   {/* reads messages from RoomStateContext */}\n    <ChatInput />     {/* reads sendMessage from RoomActionContext */}\n  </Room>\n</Chat>"
      ),
    )
  },

  // ─── 2. QUICK SETUP ─────────────────────────────────────────────────────────
  {
    title: "Installation & Setup",
    slug: "installation-setup",
    category: "2. Quick Setup",
    order: 20,
    content: doc(
      h1("Installation & Setup"),
      p(t("This guide walks you through everything you need to do to get Hermes working in your React or Next.js application. The whole process takes about 5 minutes.")),

      h2("Requirements"),
      ul(
        [t("React 17 or higher (React 18 recommended)")],
        [t("Node.js 18 or higher")],
        [t("A running Hermes Engine (self-hosted). See the Server Setup section.")],
        [t("An API key and secret from the Hermes Admin Dashboard.")],
      ),

      h2("Step 1: Install the SDK"),
      p(t("Install the "), code("hermes-chat-react"), t(" package from npm:")),
      codeBlock("bash", "npm install hermes-chat-react\n# or\nyarn add hermes-chat-react\n# or\npnpm add hermes-chat-react"),

      h2("Step 2: Generating Your API Credentials"),
      p(t("Before writing any code, you need an API key and secret from the Admin Dashboard:")),
      ol(
        [t("Open your self-hosted Admin Panel in the browser.")],
        [t("Navigate to \"Projects\" and click \"Create Project\".")],
        [t("Give your project a name (e.g. \"My Chat App\").")],
        [t("Copy the "), bold("API Key"), t(" — a 40-character hex string. This is safe to use in the browser.")],
        [t("Copy the "), bold("Secret"), t(" — another 40-character hex string. Keep this private. Anyone with it can authenticate as any user in your project.")],
      ),
      p(bold("Important:"), t(" Store your Secret in an environment variable, never commit it directly in your code.")),

      h2("Step 3: Create and Connect the Client"),
      p(t("Configure the "), code("HermesClient"), t(" in your app. Here is a complete, production-ready example using React state:")),
      codeBlock("tsx",
        "import { useState, useEffect } from \"react\";\nimport { HermesClient } from \"hermes-chat-react\";\nimport { Chat } from \"hermes-chat-react/react\";\n\nfunction App() {\n  const [client, setClient] = useState<HermesClient | null>(null);\n\n  useEffect(() => {\n    const hermesClient = new HermesClient({\n      endpoint: process.env.REACT_APP_HERMES_URL, // e.g. \"https://your-server.com\"\n      apiKey: process.env.REACT_APP_HERMES_API_KEY,\n      secret: process.env.REACT_APP_HERMES_SECRET,\n\n      // These come from YOUR application's auth system.\n      // Usually from Firebase, Auth0, Clerk, etc.\n      userId: currentUser.uid,\n      displayName: currentUser.name,\n      avatar: currentUser.photoURL,    // optional\n      email: currentUser.email,        // optional\n    });\n\n    hermesClient.connect()\n      .then(() => setClient(hermesClient))\n      .catch(console.error);\n\n    // Clean up connection when component unmounts\n    return () => hermesClient.disconnect();\n  }, []);\n\n  if (!client) return <div>Connecting...</div>;\n\n  return (\n    <Chat client={client}>\n      {/* Your chat UI goes here */}\n    </Chat>\n  );\n}"
      ),

      h2("Step 4: Environment Variables"),
      p(t("Create a "), code(".env"), t(" file in your project root. For Vite projects use the "), code("VITE_"), t(" prefix; for Create React App use "), code("REACT_APP_"), t(":")),
      codeBlock("bash",
        "# .env (Vite example)\nVITE_HERMES_ENDPOINT=https://your-hermes-server.com\nVITE_HERMES_API_KEY=A3F9D2E1B4C7F8A0D3E6B9C2F5A8D1E4B7C0F3A6\nVITE_HERMES_SECRET=9E2B5D8F1A4C7E0B3F6A9D2E5B8C1F4A7D0E3B6"
      ),
      p(bold("Never commit your .env file to version control."), t(" Add it to your "), code(".gitignore"), t(" file.")),

      h2("Step 5: Verify It Works"),
      p(t("Add a simple connection status check to confirm everything is wired up correctly:")),
      codeBlock("tsx",
        "import { useChatContext } from \"hermes-chat-react/react\";\n\nfunction ConnectionStatus() {\n  const { client, currentUser } = useChatContext();\n\n  return (\n    <div>\n      Status: {client.isConnected ? \"✅ Connected\" : \"❌ Disconnected\"}\n      {currentUser && <span> as {currentUser.displayName}</span>}\n    </div>\n  );\n}\n\n// Make sure this component is inside <Chat>\nfunction App() {\n  return (\n    <Chat client={client}>\n      <ConnectionStatus />\n    </Chat>\n  );\n}"
      ),
    )
  },

  {
    title: "10-Minute Chat App Guide",
    slug: "10-minute-chat-app",
    category: "2. Quick Setup",
    order: 21,
    content: doc(
      h1("Build a Chat App in 10 Minutes"),
      p(t("This tutorial builds a complete, real-time chat interface from scratch. By the end you will have a working app with a room list sidebar, live message feed, typing indicators, and message sending. Think of this as your quickstart blueprint.")),

      h2("What We Are Building"),
      p(t("A two-panel chat layout: a sidebar showing your rooms on the left, and the active conversation on the right. This is the same pattern used by Slack, Discord, and most chat apps.")),

      h2("Step 1: Setup and Connect"),
      p(t("Start with the connection boilerplate from the Installation guide. Wrap everything in "), code("<Chat>"), t(":")),
      codeBlock("tsx",
        "import { useState, useEffect } from \"react\";\nimport { HermesClient } from \"hermes-chat-react\";\nimport { Chat, Room, RoomList, Window, MessageList, ChatInput, TypingIndicator } from \"hermes-chat-react/react\";\n\nexport function ChatApp() {\n  const [client, setClient] = useState<HermesClient | null>(null);\n  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);\n\n  useEffect(() => {\n    const c = new HermesClient({\n      endpoint: import.meta.env.VITE_HERMES_ENDPOINT,\n      apiKey: import.meta.env.VITE_HERMES_API_KEY,\n      secret: import.meta.env.VITE_HERMES_SECRET,\n      userId: \"user-001\",      // Replace with your actual user ID\n      displayName: \"Alice\",   // Replace with your actual user name\n    });\n    c.connect().then(() => setClient(c));\n    return () => c.disconnect();\n  }, []);\n\n  if (!client) return <div>Loading Hermes...</div>;\n\n  return (\n    <Chat client={client}>\n      <div style={{ display: \"flex\", height: \"100vh\", overflow: \"hidden\" }}>\n        {/* Sidebar - Step 2 */}\n        {/* Main Chat Area - Step 3 */}\n      </div>\n    </Chat>\n  );\n}"
      ),

      h2("Step 2: Add the Room List Sidebar"),
      p(t("The "), code("<RoomList>"), t(" component automatically fetches and displays all rooms the current user belongs to. When a room is clicked, we store its ID in state:")),
      codeBlock("tsx",
        "// Replace the {/* Sidebar - Step 2 */} comment with this:\n<div style={{ width: 280, borderRight: \"1px solid #e5e7eb\", overflowY: \"auto\" }}>\n  <div style={{ padding: \"16px\", fontWeight: \"bold\", borderBottom: \"1px solid #e5e7eb\" }}>\n    Conversations\n  </div>\n  <RoomList\n    onSelectRoom={(room) => setActiveRoomId(room._id)}\n  />\n</div>"
      ),
      p(t("That's it! "), code("<RoomList>"), t(" handles fetching your rooms, showing loading states, displaying unread counts, and updating in real-time when new rooms are created or messages arrive.")),

      h2("Step 3: Add the Conversation View"),
      p(t("Now add the main message area. The key pattern here is using "), code("<Room>"), t(" as a context boundary — everything inside it has access to that room's messages and actions:")),
      codeBlock("tsx",
        "// Replace the {/* Main Chat Area - Step 3 */} comment with this:\n<div style={{ flex: 1, display: \"flex\", flexDirection: \"column\" }}>\n  {activeRoomId ? (\n    <Room roomId={activeRoomId}>\n      <Window>\n        {/* The scrollable message list - takes all available space */}\n        <MessageList />\n\n        {/* Typing indicator shows above the input */}\n        <TypingIndicator />\n\n        {/* Message composer at the bottom */}\n        <ChatInput placeholder=\"Type a message...\" />\n      </Window>\n    </Room>\n  ) : (\n    <div style={{ flex: 1, display: \"flex\", alignItems: \"center\", justifyContent: \"center\", color: \"#9ca3af\" }}>\n      Select a conversation to start chatting\n    </div>\n  )}\n</div>"
      ),

      h2("Full Code (Put Together)"),
      p(t("Here is the complete file — copy and paste this to have a working chat app:")),
      codeBlock("tsx",
        "import { useState, useEffect } from \"react\";\nimport { HermesClient } from \"hermes-chat-react\";\nimport { Chat, Room, RoomList, Window, MessageList, ChatInput, TypingIndicator } from \"hermes-chat-react/react\";\n\nexport function ChatApp() {\n  const [client, setClient] = useState<HermesClient | null>(null);\n  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);\n\n  useEffect(() => {\n    const c = new HermesClient({\n      endpoint: import.meta.env.VITE_HERMES_ENDPOINT,\n      apiKey: import.meta.env.VITE_HERMES_API_KEY,\n      secret: import.meta.env.VITE_HERMES_SECRET,\n      userId: \"user-001\",\n      displayName: \"Alice\",\n    });\n    c.connect().then(() => setClient(c));\n    return () => c.disconnect();\n  }, []);\n\n  if (!client) return <div>Loading Hermes...</div>;\n\n  return (\n    <Chat client={client}>\n      <div style={{ display: \"flex\", height: \"100vh\", overflow: \"hidden\" }}>\n        <div style={{ width: 280, borderRight: \"1px solid #e5e7eb\", overflowY: \"auto\" }}>\n          <div style={{ padding: 16, fontWeight: \"bold\" }}>Conversations</div>\n          <RoomList onSelectRoom={(room) => setActiveRoomId(room._id)} />\n        </div>\n        <div style={{ flex: 1, display: \"flex\", flexDirection: \"column\" }}>\n          {activeRoomId ? (\n            <Room roomId={activeRoomId}>\n              <Window>\n                <MessageList />\n                <TypingIndicator />\n                <ChatInput placeholder=\"Type a message...\" />\n              </Window>\n            </Room>\n          ) : (\n            <div style={{ margin: \"auto\", color: \"#9ca3af\" }}>Select a conversation</div>\n          )}\n        </div>\n      </div>\n    </Chat>\n  );\n}"
      ),
      p(t("You now have a fully working real-time chat app with: message history, live message delivery, typing indicators, auto scroll, and room switching. All in under 60 lines of code.")),
    )
  },

  // ─── 3. HERMESCLIENT API ─────────────────────────────────────────────────────
  {
    title: "HermesClient — Complete API",
    slug: "hermes-client-api",
    category: "3. HermesClient",
    order: 30,
    content: doc(
      h1("HermesClient — Complete API Reference"),
      p(t("The "), code("HermesClient"), t(" class is the core of the entire SDK. Every socket event, every API call, and every piece of real-time data flows through it. This page documents every method and property available to you.")),

      h2("Creating a Client"),
      p(t("Import from the main entry point (not "), code("/react"), t("):")),
      codeBlock("tsx",
        "import { HermesClient } from \"hermes-chat-react\";\n\nconst client = new HermesClient(config);"
      ),

      h2("Configuration (HermesConfig)"),
      p(t("The config object you pass to the constructor:")),
      codeBlock("typescript",
        "interface HermesConfig {\n  endpoint: string;       // REQUIRED: Your server URL e.g. \"https://chat.myapp.com\"\n  apiKey: string;         // REQUIRED: Your project's API key (40-char hex string from the Admin Dashboard)\n  secret: string;         // REQUIRED: Your project's secret (40-char hex string from the Admin Dashboard)\n  userId: string;         // REQUIRED: The ID of the user logging in (from YOUR system)\n  displayName?: string;   // Optional: The user's display name\n  avatar?: string;        // Optional: URL to the user's profile picture\n  email?: string;         // Optional: The user's email address\n}"
      ),
      p(bold("About userId:"), t(" This should be the unique identifier for the user from your own authentication system. If you use Firebase Auth, it would be "), code("user.uid"), t(". If you use Clerk, it would be "), code("user.id"), t(". Hermes uses this to link the Hermes user record to your user.")),

      h2("Connection Methods"),
      codeBlock("typescript",
        "// Connect to the server. Must be called before anything else.\n// Returns a HermesUser object with the authenticated user's details.\nawait client.connect(): Promise<HermesUser>\n\n// Cleanly disconnect from the server and close the socket.\nclient.disconnect(): void"
      ),

      h2("Connection State Properties"),
      codeBlock("typescript",
        "client.isConnected    // boolean — true only when fully connected and authenticated\nclient.status         // \"idle\" | \"connecting\" | \"connected\" | \"disconnected\" | \"error\"\nclient.currentUser    // HermesUser | null — the authenticated user's profile"
      ),

      h2("Messaging Methods"),
      codeBlock("typescript",
        "// Send a text message to a room\nawait client.sendMessage({\n  roomId: \"room_123\",\n  type: \"text\",\n  text: \"Hello world!\"\n}): Promise<Message>\n\n// Load message history for a room.\n// 'before' is a message ID for pagination (load older messages).\n// 'limit' defaults to 50.\nawait client.getHistory(roomId, before?, limit?): Promise<MessageHistoryResult>\n\n// Edit an existing message (text only)\nawait client.editMessage(messageId, roomId, newText): Promise<Message>\n\n// Soft-delete a message (sets isDeleted = true, hides text)\nawait client.deleteMessage(messageId, roomId): Promise<void>"
      ),

      h2("Room Management Methods"),
      codeBlock("typescript",
        "// Get all rooms the current user is a member of\nawait client.getRooms(): Promise<Room[]>\n\n// Start a direct message (1-on-1) with another user.\n// If a DM room already exists with that user, it is returned.\nawait client.createDirectRoom({ targetUserId: \"user_456\" }): Promise<Room>\n\n// Create a group room with multiple members\nawait client.createGroupRoom({\n  name: \"Project Alpha\",\n  memberIds: [\"user_1\", \"user_2\", \"user_3\"],\n  description: \"Optional description\",  // optional\n  avatar: \"https://...\",                // optional\n}): Promise<Room>\n\n// Delete a room (admin only)\nawait client.deleteRoom(roomId): Promise<void>\n\n// Add a user to an existing room\nawait client.addMember(roomId, userId): Promise<void>\n\n// Remove a user from a room\nawait client.removeMember(roomId, userId): Promise<void>"
      ),

      h2("User Directory"),
      codeBlock("typescript",
        "// Fetch all users registered in your Hermes project.\n// Useful for building a \"New Chat\" user picker UI.\nawait client.getUsers(): Promise<HermesUser[]>"
      ),

      h2("Presence & Typing"),
      codeBlock("typescript",
        "// Signal that the current user is typing in a room\nclient.startTyping(roomId): void\n\n// Signal that the current user stopped typing\nclient.stopTyping(roomId): void\n\n// Ping your presence (lets others know you are online in a room)\nclient.pingPresence(roomId): void"
      ),

      h2("Reactions"),
      codeBlock("typescript",
        "// Add or toggle a reaction emoji on a message.\n// If the user already reacted with that emoji, it is removed.\nawait client.addReaction(messageId, roomId, emoji): Promise<void>\n\n// Example:\nawait client.addReaction(\"msg_abc\", \"room_xyz\", \"👍\")"
      ),

      h2("Read Receipts"),
      codeBlock("typescript",
        "// Mark all messages up to lastMessageId as seen in a room.\n// This triggers a 'receipt:updated' event for other members.\nawait client.markSeen(roomId, lastMessageId): Promise<void>"
      ),

      h2("File Uploads"),
      codeBlock("typescript",
        "// Upload a File object to the server.\n// Returns metadata including the URL, file type, size, etc.\nawait client.uploadFile(file: File): Promise<UploadResult>\n\n// Example:\nconst fileInput = document.querySelector('input[type=\"file\"]');\nconst file = fileInput.files[0];\nconst result = await client.uploadFile(file);\n// result.url => \"https://your-server.com/uploads/xyz.jpg\"\n// result.type => \"image\""
      ),

      h2("Event Listening"),
      p(t("The client is an event emitter. You can manually subscribe to any real-time event:")),
      codeBlock("typescript",
        "// Subscribe to an event\nclient.on(\"message:receive\", (message) => {\n  console.log(\"New message:\", message.text);\n});\n\n// Unsubscribe from an event\nclient.off(\"message:receive\", myHandler);\n\n// All available events:\nclient.on(\"connected\", () => {});\nclient.on(\"disconnected\", (reason: string) => {});\nclient.on(\"error\", (error: Error) => {});\nclient.on(\"message:receive\", (message: Message) => {});\nclient.on(\"message:edited\", (message: Message) => {});\nclient.on(\"message:deleted\", ({ messageId, roomId }) => {});\nclient.on(\"room:created\", (room: Room) => {});\nclient.on(\"room:deleted\", ({ roomId }) => {});\nclient.on(\"room:member:joined\", ({ roomId, userId }) => {});\nclient.on(\"room:member:left\", ({ roomId, userId }) => {});\nclient.on(\"user:online\", ({ userId, displayName }) => {});\nclient.on(\"user:offline\", ({ userId, lastSeen }) => {});\nclient.on(\"typing:started\", ({ userId, displayName, roomId }) => {});\nclient.on(\"typing:stopped\", ({ userId, roomId }) => {});\nclient.on(\"receipt:updated\", ({ roomId, userId, lastMessageId }) => {});\nclient.on(\"reaction:updated\", ({ messageId, roomId, reactions }) => {});"
      ),
    )
  },

  // ─── 4. DATA TYPES ──────────────────────────────────────────────────────────
  {
    title: "TypeScript Types Reference",
    slug: "typescript-types",
    category: "3. HermesClient",
    order: 31,
    content: doc(
      h1("TypeScript Types Reference"),
      p(t("Everything in Hermes is fully typed. Here is a complete reference of every data type you will work with. Import types from "), code("hermes-chat-react"), t(":")),
      codeBlock("typescript",
        "import type {\n  HermesConfig, HermesUser, Room, Message,\n  SendMessageInput, MessageType, DeliveryStatus,\n  Reaction, ReactionEvent, PresenceEvent,\n  TypingEvent, ReceiptEvent, UploadResult,\n  ConnectionStatus, MessageHistoryResult\n} from \"hermes-chat-react\";"
      ),

      h2("HermesUser"),
      p(t("Represents an authenticated user in the Hermes system:")),
      codeBlock("typescript",
        "interface HermesUser {\n  userId: string;        // The user's ID (from your system)\n  displayName: string;   // The user's display name\n  avatar?: string;       // Optional profile picture URL\n  email?: string;        // Optional email address\n}"
      ),

      h2("Room"),
      p(t("A conversation container — either a direct message (1-on-1) or a group:")),
      codeBlock("typescript",
        "interface Room {\n  _id: string;            // MongoDB document ID, use this as roomId\n  name?: string;          // Room name (only set for group rooms)\n  type: \"direct\" | \"group\";  // Room type\n  createdBy: string;      // userId of the creator\n  members: string[];      // Array of userId strings in this room\n  admins: string[];       // Array of admin userId strings\n  avatar?: string;        // Optional room avatar URL\n  description?: string;   // Optional room description\n  lastMessage?: Message;  // The most recent message (for previews)\n  lastActivity: string;   // ISO date string of last activity\n  unreadCount: number;    // Number of messages the current user hasn't seen\n  isMuted: boolean;       // Whether the current user has muted this room\n  isPinned: boolean;      // Whether the current user has pinned this room\n  createdAt: string;      // ISO date string\n  updatedAt: string;      // ISO date string\n}"
      ),

      h2("Message"),
      p(t("A single message in a room:")),
      codeBlock("typescript",
        "interface Message {\n  _id: string;              // MongoDB document ID\n  roomId: string;           // Which room this message belongs to\n  senderId: string;         // userId of the sender\n  type: MessageType;        // \"text\" | \"link\" | \"image\" | \"video\" | \"audio\" | \"document\"\n  text?: string;            // Message text (for type: \"text\")\n  url?: string;             // File URL (for media messages)\n  fileName?: string;        // Original filename (for file messages)\n  fileSize?: number;        // File size in bytes\n  mimeType?: string;        // e.g. \"image/jpeg\", \"application/pdf\"\n  thumbnail?: string;       // Thumbnail URL (for images/videos)\n  replyTo?: string;         // Message _id being replied to\n  threadParentId?: string;  // Parent message _id if this is a thread reply\n  replyCount?: number;      // How many thread replies this message has\n  reactions: Reaction[];    // Array of emoji reactions\n  deliveryStatus: \"sent\" | \"delivered\" | \"seen\";  // Message delivery state\n  seenBy: string[];         // Array of userIds who have seen this message\n  isDeleted: boolean;       // true if soft-deleted\n  deletedAt?: string;       // When it was deleted\n  editedAt?: string;        // When it was last edited\n  createdAt: string;        // When it was created\n  updatedAt: string;        // When it was last updated\n}"
      ),

      h2("Reaction"),
      codeBlock("typescript",
        "interface Reaction {\n  emoji: string;    // The emoji character, e.g. \"👍\"\n  users: string[];  // Array of userIds who reacted with this emoji\n}"
      ),

      h2("SendMessageInput"),
      p(t("The object you pass to "), code("client.sendMessage()"), t(" or "), code("sendMessage()"), t(" from "), code("useMessages"), t(":")),
      codeBlock("typescript",
        "interface SendMessageInput {\n  roomId: string;       // Target room\n  type: MessageType;    // \"text\", \"image\", \"video\", \"audio\", \"document\", \"link\"\n  text?: string;        // Message text (required for type: \"text\")\n  url?: string;         // File URL (required for media types)\n  fileName?: string;    // Original filename\n  fileSize?: number;    // File size in bytes\n  mimeType?: string;    // MIME type e.g. \"image/jpeg\"\n  thumbnail?: string;   // Thumbnail URL\n  replyTo?: string;     // ID of message being replied to\n}"
      ),

      h2("UploadResult"),
      p(t("Returned by "), code("client.uploadFile()"), t(" after a successful upload:")),
      codeBlock("typescript",
        "interface UploadResult {\n  type: MessageType;  // Auto-detected file type\n  url: string;        // URL where the file can be accessed\n  thumbnail?: string; // Auto-generated thumbnail (for images/videos)\n  fileName: string;   // Original filename\n  fileSize: number;   // File size in bytes\n  mimeType: string;   // MIME type\n}"
      ),

      h2("ConnectionStatus"),
      codeBlock("typescript",
        "type ConnectionStatus =\n  | \"idle\"          // Client created but connect() not called yet\n  | \"connecting\"    // connect() called, waiting for server response\n  | \"connected\"     // Fully authenticated and connected\n  | \"disconnected\"  // Connection lost or disconnect() called\n  | \"error\";        // Connection failed with an error"
      ),
    )
  },

  // ─── 5. REACT HOOKS ─────────────────────────────────────────────────────────
  {
    title: "useRooms — Room Management Hook",
    slug: "hook-use-rooms",
    category: "4. React Hooks",
    order: 40,
    content: doc(
      h1("useRooms — Room Management Hook"),
      p(t("The "), code("useRooms"), t(" hook gives you the complete state and all actions for managing rooms. It fetches your room list, keeps it updated in real-time, and provides functions to create, join, and leave rooms.")),
      p(t("You typically use this hook in your sidebar or navigation component.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { useRooms } from \"hermes-chat-react/react\";\n\nfunction RoomSidebar({ client }) {\n  const { rooms, loading, error, createDirect } = useRooms(client);\n\n  if (loading) return <div>Loading rooms...</div>;\n  if (error) return <div>Error: {error}</div>;\n\n  return (\n    <ul>\n      {rooms.map(room => (\n        <li key={room._id}>\n          {room.name || \"Direct Message\"}\n          {room.unreadCount > 0 && <span>({room.unreadCount} unread)</span>}\n        </li>\n      ))}\n    </ul>\n  );\n}"
      ),

      h2("All Returned Values"),
      codeBlock("typescript",
        "const {\n  rooms,        // Room[] — the complete list of rooms\n  loading,      // boolean — true while fetching rooms on mount\n  error,        // string | null — error message if fetch failed\n  createDirect, // (input) => Promise<Room> — start a 1-on-1 chat\n  createGroup,  // (input) => Promise<Room> — create a group chat\n  deleteRoom,   // (roomId) => Promise<void> — delete a room\n  addMember,    // (roomId, userId) => Promise<void> — add someone to a room\n  removeMember, // (roomId, userId) => Promise<void> — remove someone\n  refetch,      // () => Promise<void> — manually re-fetch rooms\n} = useRooms(client);"
      ),

      h2("Creating a Direct Message"),
      p(t("Use "), code("createDirect"), t(" to start a 1-on-1 conversation with another user. If a DM room already exists between the two users, it returns the existing one:")),
      codeBlock("tsx",
        "function NewChatButton({ client, targetUserId }) {\n  const { createDirect } = useRooms(client);\n\n  const handleStartChat = async () => {\n    const room = await createDirect({ targetUserId });\n    // Navigate to the new room\n    setActiveRoomId(room._id);\n  };\n\n  return <button onClick={handleStartChat}>Start Chat</button>;\n}"
      ),

      h2("Creating a Group Room"),
      codeBlock("tsx",
        "const { createGroup } = useRooms(client);\n\nconst room = await createGroup({\n  name: \"Project Alpha Team\",\n  memberIds: [\"user_1\", \"user_2\", \"user_3\"],\n  description: \"For discussing Project Alpha\",  // optional\n  avatar: \"https://...\",                         // optional\n});"
      ),

      h2("How Real-Time Updates Work"),
      p(t("The hook automatically listens to these events and updates the "), code("rooms"), t(" array without you doing anything:")),
      ul(
        [code("room:created"), t(" — Adds the new room to the top of the list")],
        [code("room:deleted"), t(" — Removes the room from the list")],
        [code("room:member:joined"), t(" — Updates the members array of the affected room")],
        [code("room:member:left"), t(" — Removes the member from the affected room")],
        [code("message:receive"), t(" — Moves the room with the new message to the top of the list and updates its "), code("lastMessage")],
      ),

      h2("Using Inside Context (Alternative)"),
      p(t("If you are already inside a "), code("<Chat>"), t(" provider, you can use "), code("useChatContext()"), t(" to get the client and pass it to "), code("useRooms"), t(":")),
      codeBlock("tsx",
        "import { useChatContext } from \"hermes-chat-react/react\";\n\nfunction Sidebar() {\n  const { client } = useChatContext();\n  const { rooms } = useRooms(client);\n  // ...\n}"
      ),
    )
  },

  {
    title: "useMessages — Message Feed Hook",
    slug: "hook-use-messages",
    category: "4. React Hooks",
    order: 41,
    content: doc(
      h1("useMessages — Message Feed Hook"),
      p(t("The "), code("useMessages"), t(" hook is the most powerful hook in the SDK. It manages the complete message lifecycle for a room: fetching history, receiving new messages in real-time, tracking edits, deletions, reactions, and typing indicators.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { useMessages } from \"hermes-chat-react/react\";\n\nfunction MessageFeed({ client, roomId }) {\n  const {\n    messages,\n    loading,\n    typingUsers,\n    sendMessage,\n  } = useMessages(client, roomId);\n\n  if (loading) return <div>Loading messages...</div>;\n\n  return (\n    <div>\n      {messages.map(msg => (\n        <div key={msg._id}>\n          <strong>{msg.senderId}</strong>: {msg.text}\n        </div>\n      ))}\n\n      {typingUsers.length > 0 && (\n        <div>{typingUsers[0].displayName} is typing...</div>\n      )}\n\n      <button onClick={() => sendMessage({ type: \"text\", text: \"Hello!\" })}>\n        Send Hello\n      </button>\n    </div>\n  );\n}"
      ),

      h2("All Returned Values"),
      codeBlock("typescript",
        "const {\n  messages,     // Message[] — all messages in the room (sorted oldest to newest)\n  loading,      // boolean — true while loading initial message history\n  loadingMore,  // boolean — true while loading older messages (pagination)\n  hasMore,      // boolean — true if there are older messages to load\n  error,        // string | null — error message if something went wrong\n  typingUsers,  // { userId: string; displayName: string }[] — who is typing\n  sendMessage,  // (input) => Promise<Message> — send a message\n  editMessage,  // (messageId, newText) => Promise<Message> — edit a message\n  deleteMessage,// (messageId) => Promise<void> — delete a message\n  addReaction,  // (messageId, emoji) => Promise<void> — react to a message\n  loadMore,     // () => Promise<void> — load the previous page of messages\n} = useMessages(client, roomId);"
      ),

      h2("Sending a Text Message"),
      codeBlock("tsx",
        "const { sendMessage } = useMessages(client, roomId);\n\n// Text message\nawait sendMessage({ type: \"text\", text: \"Hey there!\" });\n\n// Reply to another message\nawait sendMessage({ type: \"text\", text: \"I agree!\", replyTo: \"msg_OriginalId\" });"
      ),

      h2("Infinite Scroll Pagination"),
      p(t("Use "), code("loadMore"), t(" to fetch older messages when the user scrolls to the top of the feed:")),
      codeBlock("tsx",
        "const { messages, hasMore, loadingMore, loadMore } = useMessages(client, roomId);\n\nreturn (\n  <div>\n    {/* Show a Load More button at the top if there are older messages */}\n    {hasMore && (\n      <button onClick={loadMore} disabled={loadingMore}>\n        {loadingMore ? \"Loading...\" : \"Load older messages\"}\n      </button>\n    )}\n\n    {messages.map(msg => (\n      <div key={msg._id}>{msg.text}</div>\n    ))}\n  </div>\n);"
      ),

      h2("Editing a Message"),
      codeBlock("tsx",
        "const { editMessage } = useMessages(client, roomId);\n\n// The UI updates instantly for all users\nawait editMessage(\"msg_abc123\", \"Updated message text\");"
      ),

      h2("Deleting a Message"),
      p(t("Hermes uses soft deletes — the message record stays in the database but "), code("isDeleted"), t(" is set to "), code("true"), t(" and the text is cleared. This preserves thread structure:")),
      codeBlock("tsx",
        "const { deleteMessage } = useMessages(client, roomId);\n\nawait deleteMessage(\"msg_abc123\");\n// The message now shows as \"This message was deleted\""
      ),

      h2("Adding Reactions"),
      codeBlock("tsx",
        "const { addReaction } = useMessages(client, roomId);\n\n// Reacting with a thumbs up\nawait addReaction(\"msg_abc123\", \"👍\");\n\n// Adding again removes the reaction (toggle behavior)"
      ),

      h2("What Changes Trigger Re-renders"),
      p(t("This hook re-renders your component when:")),
      ul(
        [t("A new message arrives from the server ("), code("message:receive"), t(")")],
        [t("A message is edited ("), code("message:edited"), t(")")],
        [t("A message is deleted ("), code("message:deleted"), t(")")],
        [t("A reaction is added or removed ("), code("reaction:updated"), t(")")],
        [t("The typing users list changes")],
        [t("The initial history finishes loading")],
      ),
    )
  },

  {
    title: "useTyping — Typing Indicators Hook",
    slug: "hook-use-typing",
    category: "4. React Hooks",
    order: 42,
    content: doc(
      h1("useTyping — Typing Indicators Hook"),
      p(t("The "), code("useTyping"), t(" hook makes it easy to both "), bold("show"), t(" who is typing and "), bold("broadcast"), t(" your own typing status to others. It handles everything automatically — including cleaning up stale typing states if a user goes offline.")),

      h2("How It Works"),
      p(t("When a user types, you call "), code("startTyping()"), t(". The hook emits a "), code("typing:started"), t(" event to the server, which broadcasts it to everyone in the room. After 3 seconds of no typing activity, the hook automatically calls "), code("stopTyping()"), t(" — so you do not need to manually manage a debounce timer.")),
      p(t("On the receiving side, the hook listens for "), code("typing:started"), t(" and "), code("typing:stopped"), t(" events from the server and updates a Map of currently typing users. If a typing event is not followed by a stop within 4 seconds, the user is automatically removed from the list.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { useTyping } from \"hermes-chat-react/react\";\n\nfunction ChatComposer({ client, roomId }) {\n  const { typingText, startTyping, stopTyping } = useTyping(client, roomId);\n\n  return (\n    <div>\n      {/* Show the typing indicator above the input */}\n      {typingText && <div className=\"typing-hint\">{typingText}</div>}\n\n      <input\n        onKeyDown={startTyping}        // Call on every keystroke\n        onBlur={stopTyping}            // Call when input loses focus\n        placeholder=\"Type a message...\"\n      />\n    </div>\n  );\n}"
      ),

      h2("All Returned Values"),
      codeBlock("typescript",
        "const {\n  typingUsers,      // Map<userId, displayName> — who is currently typing\n  typingText,       // string | null — a human-readable summary:\n                    //   null          → nobody is typing\n                    //   \"Alice is typing...\"\n                    //   \"Alice and Bob are typing...\"\n                    //   \"Alice and 3 others are typing...\"\n  isAnyoneTyping,   // boolean — shortcut for typingUsers.size > 0\n  startTyping,      // () => void — call this when the user types\n  stopTyping,       // () => void — call this when the user stops/blurs\n} = useTyping(client, roomId);"
      ),

      h2("Combining with useMessages"),
      p(t("Note: The "), code("useMessages"), t(" hook also tracks typing users internally (via the "), code("typingUsers"), t(" return value). You do NOT need both hooks if you just want to display who is typing — "), code("useMessages"), t(" already handles that. Use "), code("useTyping"), t(" separately when you need the "), code("startTyping"), t(" / "), code("stopTyping"), t(" methods to broadcast from a custom input component.")),

      h2("Advanced: Accessing Individual Typing Users"),
      codeBlock("tsx",
        "const { typingUsers } = useTyping(client, roomId);\n\n// typingUsers is a Map<string, string>: userId -> displayName\n// You can iterate over it:\nfor (const [userId, displayName] of typingUsers) {\n  console.log(`${displayName} is typing`);\n}\n\n// Or convert to array:\nconst typingList = Array.from(typingUsers.entries());"
      ),
    )
  },

  {
    title: "usePresence — Online Status Hook",
    slug: "hook-use-presence",
    category: "4. React Hooks",
    order: 43,
    content: doc(
      h1("usePresence — Online Status Hook"),
      p(t("The "), code("usePresence"), t(" hook lets you track which users are currently online in real-time. Use it to show green online dots, filter active users, or gate certain features to online-only users.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { usePresence } from \"hermes-chat-react/react\";\n\nfunction UserListItem({ client, user }) {\n  const { isOnline } = usePresence(client);\n\n  return (\n    <div>\n      {user.displayName}\n      <span style={{ color: isOnline(user.userId) ? \"green\" : \"gray\" }}>\n        {isOnline(user.userId) ? \"● Online\" : \"○ Offline\"}\n      </span>\n    </div>\n  );\n}"
      ),

      h2("All Returned Values"),
      codeBlock("typescript",
        "const {\n  isOnline,    // (userId: string) => boolean — check if a specific user is online\n  onlineUsers, // string[] — array of userIds who are currently online\n  onlineMap,   // Map<userId, boolean> — the raw presence data\n} = usePresence(client);"
      ),

      h2("Showing All Online Users"),
      codeBlock("tsx",
        "const { onlineUsers } = usePresence(client);\n\nreturn (\n  <div>\n    <h3>{onlineUsers.length} users online</h3>\n    <ul>\n      {onlineUsers.map(userId => (\n        <li key={userId}>{userId}</li>\n      ))}\n    </ul>\n  </div>\n);"
      ),

      h2("How It Works Internally"),
      p(t("The hook subscribes to two server events:")),
      ul(
        [code("user:online"), t(" — Fires when a user connects. Sets their status to "), code("true"), t(" in the map.")],
        [code("user:offline"), t(" — Fires when a user disconnects. Sets their status to "), code("false"), t(" in the map.")],
      ),
      p(t("The map persists between room changes, so you always have a global view of who is online across your entire application, not just the current room.")),
    )
  },

  {
    title: "useReadReceipts — Read Status Hook",
    slug: "hook-use-read-receipts",
    category: "4. React Hooks",
    order: 44,
    content: doc(
      h1("useReadReceipts — Read Status Hook"),
      p(t("The "), code("useReadReceipts"), t(" hook lets you track which messages have been seen by which users, and mark messages as seen on behalf of the current user. This powers the \"seen by Alice\" or the double-tick (✓✓) pattern you see in WhatsApp and iMessage.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { useReadReceipts } from \"hermes-chat-react/react\";\n\nfunction MessageItem({ client, roomId, message, currentUserId }) {\n  const { seenBy, markSeen } = useReadReceipts(client, roomId);\n\n  // Mark this message as seen when it appears on screen\n  useEffect(() => {\n    markSeen(message._id);\n  }, [message._id]);\n\n  const viewers = seenBy(message._id);\n\n  return (\n    <div>\n      <p>{message.text}</p>\n      {viewers.length > 0 && (\n        <small>Seen by {viewers.join(\", \")}</small>\n      )}\n    </div>\n  );\n}"
      ),

      h2("All Returned Values"),
      codeBlock("typescript",
        "const {\n  markSeen,  // (lastMessageId: string) => Promise<void>\n             // Tells the server: \"current user has seen everything up to this message\"\n\n  seenBy,    // (messageId: string) => string[]\n             // Returns array of userIds who have seen this message\n\n  receipts,  // Map<messageId, Set<userId>>\n             // The raw receipt data for the entire room\n} = useReadReceipts(client, roomId);"
      ),

      h2("Marking Messages as Seen"),
      p(t("Best practice: call "), code("markSeen"), t(" with the ID of the "), bold("last visible message"), t(" in the viewport. This is more efficient than calling it for every single message:")),
      codeBlock("tsx",
        "const { markSeen } = useReadReceipts(client, roomId);\n\n// When the user scrolls to the bottom, mark the last message as seen\nconst lastMessage = messages[messages.length - 1];\nif (lastMessage) {\n  await markSeen(lastMessage._id);\n}"
      ),

      h2("Showing Who Has Seen a Message"),
      codeBlock("tsx",
        "const { seenBy } = useReadReceipts(client, roomId);\n\n// Get the list of users who have seen message \"msg_abc\"\nconst viewers = seenBy(\"msg_abc\");\n// => [\"user_1\", \"user_3\"]\n\n// Show it as text\nconst seenText = viewers.length > 0 ? `Seen by ${viewers.length}` : \"Sent\";"
      ),
    )
  },

  {
    title: "useUpload — File Upload Hook",
    slug: "hook-use-upload",
    category: "4. React Hooks",
    order: 45,
    content: doc(
      h1("useUpload — File Upload Hook"),
      p(t("The "), code("useUpload"), t(" hook handles uploading files to the Hermes server and sending them as messages. It handles the upload, tracks progress state, validates file types and sizes, and sends the resulting media message — all in one function call.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { useUpload } from \"hermes-chat-react/react\";\n\nfunction FileUploadButton({ client, roomId }) {\n  const { sendFile, uploading, error } = useUpload(client);\n\n  const handleFileSelect = async (event) => {\n    const file = event.target.files[0];\n    if (!file) return;\n    await sendFile(roomId, file);\n  };\n\n  return (\n    <div>\n      <input\n        type=\"file\"\n        onChange={handleFileSelect}\n        disabled={uploading}\n        accept=\"image/*,video/*,audio/*,.pdf\"\n      />\n      {uploading && <span>Uploading...</span>}\n      {error && <span>Error: {error}</span>}\n    </div>\n  );\n}"
      ),

      h2("All Returned Values"),
      codeBlock("typescript",
        "const {\n  sendFile,    // (roomId, file, replyTo?) => Promise<Message | null>\n               // Uploads the file AND sends it as a message in one step\n\n  upload,      // (file: File) => Promise<UploadResult | null>\n               // Just uploads the file, returns the URL without sending a message\n\n  validate,    // (file: File, maxMb?: number) => string | null\n               // Returns an error string if invalid, or null if the file is OK\n\n  uploading,   // boolean — true while the upload is in progress\n  error,       // string | null — error message if upload failed\n  lastUpload,  // UploadResult | null — the result of the most recent upload\n} = useUpload(client);"
      ),

      h2("Validating Before Uploading"),
      p(t("Always validate files before uploading to give users helpful error messages:")),
      codeBlock("tsx",
        "const { validate, sendFile, error } = useUpload(client);\n\nconst handleFile = async (file) => {\n  // validate accepts optional max size in MB (default: 50MB)\n  const validationError = validate(file, 25);  // 25MB max\n  if (validationError) {\n    alert(validationError);  // e.g. \"File too large. Max size is 25MB.\"\n    return;\n  }\n  await sendFile(roomId, file);\n};"
      ),

      h2("Supported File Types"),
      p(t("The validator accepts these MIME types by default:")),
      ul(
        [bold("Images: "), t("image/jpeg, image/png, image/gif, image/webp")],
        [bold("Videos: "), t("video/mp4, video/webm")],
        [bold("Audio: "), t("audio/mpeg, audio/ogg, audio/wav")],
        [bold("Documents: "), t("application/pdf, application/msword, .docx, text/plain")],
      ),

      h2("Upload Only (Without Sending a Message)"),
      p(t("Use "), code("upload"), t(" when you want to get the URL but control when the message is sent:")),
      codeBlock("tsx",
        "const { upload } = useUpload(client);\n\n// Just upload the file and get the metadata back\nconst result = await upload(file);\nif (result) {\n  console.log(result.url);      // \"https://your-server.com/uploads/xyz.jpg\"\n  console.log(result.type);     // \"image\"\n  console.log(result.mimeType); // \"image/jpeg\"\n\n  // Now you can send a message manually\n  await client.sendMessage({\n    roomId,\n    type: result.type,\n    url: result.url,\n    fileName: result.fileName,\n    fileSize: result.fileSize,\n    mimeType: result.mimeType,\n  });\n}"
      ),
    )
  },

  // ─── 6. CONTEXT HOOKS ───────────────────────────────────────────────────────
  {
    title: "Context Hooks",
    slug: "context-hooks",
    category: "5. Context & Providers",
    order: 50,
    content: doc(
      h1("Context Hooks"),
      p(t("When you nest components inside the "), code("<Chat>"), t(" and "), code("<Room>"), t(" providers, you get access to a set of context hooks that let you read state and trigger actions without passing props manually. These are the lowest-overhead way to connect to Hermes state.")),

      h2("useChatContext()"),
      p(t("Use this hook to access the global client instance and the current user. It is available anywhere inside a "), code("<Chat>"), t(" provider.")),
      codeBlock("tsx",
        "import { useChatContext } from \"hermes-chat-react/react\";\n\nfunction ProfileBadge() {\n  const { client, currentUser, theme } = useChatContext();\n\n  return (\n    <div>\n      <img src={currentUser?.avatar} alt=\"avatar\" />\n      <span>{currentUser?.displayName}</span>\n      <span>{client.isConnected ? \"Online\" : \"Offline\"}</span>\n    </div>\n  );\n}"
      ),
      codeBlock("typescript",
        "// useChatContext() returns:\n{\n  client: HermesClient;        // The connected client instance\n  currentUser: HermesUser | null; // The authenticated user\n  theme?: string;              // The theme passed to <Chat> (if any)\n}"
      ),

      h2("useRoomStateContext()"),
      p(t("Use this inside a "), code("<Room>"), t(" provider to read message state. This hook re-renders your component when messages arrive, someone types, or the loading state changes.")),
      codeBlock("tsx",
        "import { useRoomStateContext } from \"hermes-chat-react/react\";\n\nfunction MessageCounter() {\n  const { messages, loading, room } = useRoomStateContext();\n\n  if (loading) return <span>Loading...</span>;\n\n  return (\n    <span>\n      {messages.length} messages in {room?.name || \"Direct Message\"}\n    </span>\n  );\n}"
      ),
      codeBlock("typescript",
        "// useRoomStateContext() returns:\n{\n  room: Room | null;          // The current room's data\n  messages: Message[];        // All messages in the room\n  loading: boolean;           // True while fetching initial history\n  loadingMore: boolean;       // True while loading older messages\n  hasMore: boolean;           // True if there are more messages to load back\n  typingUsers: { userId: string; displayName: string }[];\n  thread: Message | null;     // Currently open thread parent message\n}"
      ),

      h2("useRoomActionContext()"),
      p(t("Use this to trigger actions on the current room. Action functions are stable references, so calling this hook causes very few re-renders — ideal for button/input components that do not need to display state.")),
      codeBlock("tsx",
        "import { useRoomActionContext } from \"hermes-chat-react/react\";\n\nfunction DeleteButton({ messageId }) {\n  const { deleteMessage } = useRoomActionContext();\n\n  return (\n    <button onClick={() => deleteMessage(messageId)}>\n      Delete\n    </button>\n  );\n}"
      ),
      codeBlock("typescript",
        "// useRoomActionContext() returns:\n{\n  sendMessage:   (input: Omit<SendMessageInput, \"roomId\">) => Promise<Message>;\n  editMessage:   (messageId: string, text: string) => Promise<Message>;\n  deleteMessage: (messageId: string) => Promise<void>;\n  addReaction:   (messageId: string, emoji: string) => Promise<void>;\n  loadMore:      () => Promise<void>;\n  markSeen:      (lastMessageId: string) => Promise<void>;\n  startTyping:   () => void;\n  stopTyping:    () => void;\n}"
      ),

      h2("useMessageContext()"),
      p(t("This hook is available inside custom Message renderers. It gives you the full message data and actions for a specific message, without needing to pass props:")),
      codeBlock("tsx",
        "import { useMessageContext } from \"hermes-chat-react/react\";\n\n// Used inside a custom Message component provided via ComponentProvider\nfunction CustomMessage() {\n  const { message, isMyMessage } = useMessageContext();\n\n  return (\n    <div style={{ textAlign: isMyMessage ? \"right\" : \"left\" }}>\n      <p>{message.text}</p>\n      <small>{new Date(message.createdAt).toLocaleTimeString()}</small>\n    </div>\n  );\n}"
      ),
    )
  },

  // ─── 7. UI COMPONENTS ───────────────────────────────────────────────────────
  {
    title: "<Chat> Provider Component",
    slug: "component-chat",
    category: "6. UI Components",
    order: 60,
    content: doc(
      h1("<Chat> — The Root Provider"),
      p(t("The "), code("<Chat>"), t(" component is the root of your entire Hermes integration. It must wrap all other Hermes components and hooks. It establishes the React context that everything else reads from.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { Chat } from \"hermes-chat-react/react\";\n\n<Chat client={client}>\n  {/* All your chat UI goes here */}\n</Chat>"
      ),

      h2("Props"),
      codeBlock("typescript",
        "interface ChatProps {\n  client: HermesClient;    // REQUIRED: Your connected HermesClient instance\n  children: React.ReactNode; // REQUIRED: All your chat UI components\n  theme?: string;          // Optional: Pass a theme identifier (\"light\" | \"dark\")\n  customClasses?: {        // Optional: override CSS class names\n    chat?: string;         // Class for the outermost container div\n  };\n}"
      ),

      h2("What <Chat> Does"),
      ul(
        [t("Creates and provides the "), code("ChatContext"), t(" to all children")],
        [t("Exposes "), code("client"), t(" and "), code("currentUser"), t(" to "), code("useChatContext()")],
        [t("Acts as the anchor point for the entire context tree")],
      ),

      h2("Important Rules"),
      ul(
        [t("You can only have ONE "), code("<Chat>"), t(" provider per app. Do not nest them.")],
        [t("The "), code("client"), t(" must be connected before passing it to "), code("<Chat>"), t(". Call "), code("await client.connect()"), t(" first.")],
        [t("All other Hermes components and hooks MUST be children of "), code("<Chat>"), t(".")],
      ),
    )
  },

  {
    title: "<Room> Provider Component",
    slug: "component-room",
    category: "6. UI Components",
    order: 61,
    content: doc(
      h1("<Room> — The Conversation Provider"),
      p(t("The "), code("<Room>"), t(" component is a context provider that subscribes to a specific room's data. It renders "), bold("absolutely no DOM"), t(" — it is purely logical. When mounted, it automatically joins the room's socket channel, fetches message history, and subscribes to all real-time events for that room.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { Room, MessageList, ChatInput } from \"hermes-chat-react/react\";\n\n// Everything inside <Room> has access to that room's state and actions\n<Room roomId=\"room_abc123\">\n  <MessageList />\n  <ChatInput />\n</Room>"
      ),

      h2("Props"),
      codeBlock("typescript",
        "interface RoomProps {\n  roomId: string;          // REQUIRED: The _id of the room to subscribe to\n  children: React.ReactNode; // REQUIRED: Your message list, input, etc.\n}"
      ),

      h2("What <Room> Does Automatically"),
      ul(
        [t("Fetches the initial 50 messages from the server")],
        [t("Subscribes to "), code("message:receive"), t(", "), code("message:edited"), t(", "), code("message:deleted"), t(", and "), code("reaction:updated"), t(" events")],
        [t("Tracks who is typing with automatic timeout cleanup")],
        [t("Marks messages as seen when the user is active in the room")],
        [t("Provides all state and actions via context to children")],
      ),

      h2("Switching Rooms"),
      p(t("When you change the "), code("roomId"), t(" prop, "), code("<Room>"), t(" automatically unsubscribes from the old room and subscribes to the new one. No cleanup needed on your side:")),
      codeBlock("tsx",
        "// Just change the roomId prop — Room handles the rest\nfunction ChatArea({ activeRoomId }) {\n  if (!activeRoomId) return <div>Select a room</div>;\n\n  return (\n    <Room roomId={activeRoomId}>\n      <MessageList />\n      <ChatInput />\n    </Room>\n  );\n}"
      ),
    )
  },

  {
    title: "<Window> Layout Component",
    slug: "component-window",
    category: "6. UI Components",
    order: 62,
    content: doc(
      h1("<Window> — The Flexbox Layout Container"),
      p(t("The "), code("<Window>"), t(" component is a layout helper that creates a proper Flexbox column container for the chat area. It ensures the message list takes all available vertical space while the input stays anchored at the bottom.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { Window } from \"hermes-chat-react/react\";\n\n<Room roomId={roomId}>\n  <Window>\n    {/* MessageList will expand to fill available space */}\n    <MessageList />\n\n    {/* ChatInput will stick to the bottom */}\n    <ChatInput />\n  </Window>\n</Room>"
      ),

      h2("Why Use Window?"),
      p(t("Getting the CSS layout right for a chat interface is surprisingly tricky. Without it, you quickly run into issues where the message list doesn't scroll properly, or the chat input is pushed off-screen. "), code("<Window>"), t(" applies the correct "), code("flex: 1"), t(", "), code("overflow: hidden"), t(", and height constraints automatically.")),

      h2("Props"),
      codeBlock("typescript",
        "interface WindowProps {\n  children: React.ReactNode;\n  className?: string; // Add your own CSS classes\n}"
      ),
    )
  },

  {
    title: "<RoomList> Component",
    slug: "component-roomlist",
    category: "6. UI Components",
    order: 63,
    content: doc(
      h1("<RoomList> Component"),
      p(t("The "), code("<RoomList>"), t(" component renders the list of rooms the current user belongs to. It automatically handles fetching rooms, showing loading states, empty states, and updating in real-time as new messages arrive.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { RoomList } from \"hermes-chat-react/react\";\n\n<RoomList\n  onSelectRoom={(room) => setActiveRoomId(room._id)}\n/>"
      ),

      h2("Props"),
      codeBlock("typescript",
        "interface RoomListProps {\n  // Called when the user clicks on a room\n  onSelectRoom: (room: Room) => void;\n\n  // Override the entire rendering of each room row.\n  // room = the room data, isActive = whether it's currently selected\n  renderRoomItem?: (room: Room, isActive: boolean) => React.ReactNode;\n\n  // The ID of the currently active room (for highlighting)\n  activeRoomId?: string;\n\n  // Pass your own rooms array instead of fetching automatically\n  rooms?: Room[];\n\n  // Override the loading state\n  renderLoading?: () => React.ReactNode;\n}"
      ),

      h2("Customizing Room Items"),
      p(t("Use "), code("renderRoomItem"), t(" to completely control how each room looks. This is the most common customization:")),
      codeBlock("tsx",
        "<RoomList\n  onSelectRoom={setActiveRoom}\n  activeRoomId={activeRoomId}\n  renderRoomItem={(room, isActive) => (\n    <div\n      style={{\n        padding: \"12px 16px\",\n        backgroundColor: isActive ? \"#4f46e5\" : \"transparent\",\n        color: isActive ? \"white\" : \"#374151\",\n        cursor: \"pointer\",\n        borderRadius: 8,\n        display: \"flex\",\n        justifyContent: \"space-between\",\n        alignItems: \"center\",\n      }}\n    >\n      <span># {room.name || \"Direct Message\"}</span>\n      {room.unreadCount > 0 && (\n        <span style={{ background: \"#ef4444\", color: \"white\", borderRadius: 99, padding: \"2px 7px\", fontSize: 12 }}>\n          {room.unreadCount}\n        </span>\n      )}\n    </div>\n  )}\n/>"
      ),

      h2("Real-Time Behavior"),
      p(t("The room list automatically updates when:")),
      ul(
        [t("A new message arrives (moves the room to the top)")],
        [t("A new room is created (added to the top)")],
        [t("A room is deleted (removed instantly)")],
        [t("A member joins or leaves a room")],
      ),
    )
  },

  {
    title: "<MessageList> Component",
    slug: "component-messagelist",
    category: "6. UI Components",
    order: 64,
    content: doc(
      h1("<MessageList> Component"),
      p(t("The "), code("<MessageList>"), t(" component is the heart of the chat view. It renders all messages in the room, handles automatic scrolling, date separators, grouped messages, deleted message display, and \"load more\" pagination.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { MessageList } from \"hermes-chat-react/react\";\n\n// Must be inside a <Room> provider\n<Room roomId={roomId}>\n  <MessageList />\n</Room>"
      ),

      h2("Props"),
      codeBlock("typescript",
        "interface MessageListProps {\n  // CSS class for the outer container\n  className?: string;\n\n  // A custom component to render instead of the default message bubble.\n  // If provided, it receives the message via useMessageContext().\n  renderMessage?: (message: Message) => React.ReactNode;\n\n  // Disable the automatic date separator dividers\n  disableDateSeparator?: boolean;\n\n  // Disable auto-scroll to the bottom on new messages\n  disableAutoScroll?: boolean;\n}"
      ),

      h2("Layout Requirements"),
      p(bold("Important:"), t(" "), code("<MessageList>"), t(" must have a fixed or bounded height to scroll correctly. If you put it in an unconstrained container, the auto-scroll calculations will break. The easiest way to do this is to use the "), code("<Window>"), t(" component:")),
      codeBlock("tsx",
        "// CORRECT: Inside <Window>, MessageList gets flex: 1 and scrolls properly\n<Window>\n  <MessageList />\n  <ChatInput />\n</Window>\n\n// CORRECT: Explicit height\n<div style={{ height: \"600px\", overflow: \"hidden\" }}>\n  <MessageList />\n</div>\n\n// WRONG: No height constraint — scroll will break\n<div>\n  <MessageList />\n</div>"
      ),

      h2("Message Grouping"),
      p(t("The component automatically groups consecutive messages from the same sender. If Alice sends 3 messages in a row within a short time, only the first shows the avatar and name. The rest are visually grouped below it. This is controlled via a "), code("groupStyle"), t(" value ("), code("\"top\" | \"middle\" | \"bottom\" | \"single\""), t(") attached to each rendered message.")),

      h2("Date Separators"),
      p(t("Messages are automatically divided by day with a date separator label. You can disable this with "), code("disableDateSeparator={true}"), t(".")),

      h2("Load More (Pagination)"),
      p(t("When a user scrolls to the top of the list, a \"Load older messages\" button appears automatically if older messages exist. Clicking it fetches the previous page. This is handled entirely by the component — no extra code needed.")),
    )
  },

  {
    title: "<ChatInput> Component",
    slug: "component-chatinput",
    category: "6. UI Components",
    order: 65,
    content: doc(
      h1("<ChatInput> Component"),
      p(t("The "), code("<ChatInput>"), t(" component is an auto-growing textarea that handles text composition, keyboard shortcuts (Enter to send), typing indicator broadcast, file attachment, and reply threading — all out of the box.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { ChatInput } from \"hermes-chat-react/react\";\n\n// Must be inside a <Room> provider\n<Room roomId={roomId}>\n  <MessageList />\n  <ChatInput placeholder=\"Type a message...\" />\n</Room>"
      ),

      h2("Props"),
      codeBlock("typescript",
        "interface ChatInputProps {\n  placeholder?: string;    // Placeholder text (default: \"Type a message...\")\n  className?: string;      // Class for the outer container div\n  inputClassName?: string; // Class for the textarea element itself\n\n  // Callbacks to override default behavior with your own:\n  onSendText?: (text: string) => void | Promise<void>;\n  onSendFile?: (file: File) => void | Promise<void>;\n  onTypingStart?: () => void;\n  onTypingStop?: () => void;\n\n  // For reply-to threading:\n  replyingTo?: Message | null;    // The message being replied to\n  onCancelReply?: () => void;     // Called when user dismisses the reply\n}"
      ),

      h2("Automatic Typing Indicators"),
      p(t("Every keystroke triggers a debounced "), code("typing:started"), t(" event. After about 3 seconds of inactivity, "), code("typing:stopped"), t(" is emitted automatically. This is all built in — you do not need to wire it up manually.")),

      h2("Styling the Input"),
      codeBlock("tsx",
        "// Use inputClassName to style the textarea directly,\n// and className to style the outer wrapper:\n<ChatInput\n  className=\"border-t border-gray-200 bg-white p-4\"\n  inputClassName=\"w-full bg-gray-100 rounded-xl px-4 py-2 outline-none\"\n  placeholder=\"Write something...\"\n/>"
      ),

      h2("Keyboard Shortcuts"),
      ul(
        [bold("Enter"), t(" — Sends the message")],
        [bold("Shift + Enter"), t(" — Inserts a newline (multiline message)")],
      ),

      h2("Reply to a Message"),
      codeBlock("tsx",
        "const [replyingTo, setReplyingTo] = useState(null);\n\n<ChatInput\n  replyingTo={replyingTo}\n  onCancelReply={() => setReplyingTo(null)}\n/>"
      ),
    )
  },

  {
    title: "<TypingIndicator> Component",
    slug: "component-typing-indicator",
    category: "6. UI Components",
    order: 66,
    content: doc(
      h1("<TypingIndicator> Component"),
      p(t("A simple component that automatically displays who is currently typing in the active room. Mount it just above your "), code("<ChatInput>"), t(" for the standard chat UI pattern.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { TypingIndicator } from \"hermes-chat-react/react\";\n\n<Room roomId={roomId}>\n  <MessageList />\n  <TypingIndicator />    {/* Shows \"Alice is typing...\" automatically */}\n  <ChatInput />\n</Room>"
      ),

      h2("How It Works"),
      p(t("The component reads from "), code("useRoomStateContext()"), t(" and shows the typing text. It renders "), code("null"), t(" when nobody is typing, so it takes up no space and causes no layout shift.")),
      p(t("The text format is:")),
      ul(
        [t("Nobody typing → renders nothing")],
        [t("One person → \"Alice is typing...\"")],
        [t("Two people → \"Alice and Bob are typing...\"")],
        [t("Three or more → \"Alice and 2 others are typing...\"")],
      ),

      h2("Props"),
      codeBlock("typescript",
        "interface TypingIndicatorProps {\n  className?: string; // Optional CSS class for the container\n}"
      ),
    )
  },

  {
    title: "<ReactionPicker> Component",
    slug: "component-reaction-picker",
    category: "6. UI Components",
    order: 67,
    content: doc(
      h1("<ReactionPicker> Component"),
      p(t("A floating emoji picker panel that lets users react to messages. It shows a row of common emojis, and a ➕ button that opens the full emoji picker (powered by emoji-picker-react). Already-reacted emojis are visually highlighted.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { ReactionPicker } from \"hermes-chat-react/react\";\n\nfunction MessageActions({ message, roomId, currentUserId, client }) {\n  const handleReact = async (emoji) => {\n    await client.addReaction(message._id, roomId, emoji);\n  };\n\n  return (\n    <ReactionPicker\n      onSelect={handleReact}\n      currentReactions={message.reactions}\n      currentUserId={currentUserId}\n    />\n  );\n}"
      ),

      h2("Props"),
      codeBlock("typescript",
        "interface ReactionPickerProps {\n  // Called with the selected emoji string when user clicks one\n  onSelect: (emoji: string) => void;\n\n  // Current reactions on the message (for showing which ones are active)\n  currentReactions?: Reaction[];\n\n  // The current user's ID (to highlight their own reactions)\n  currentUserId?: string;\n\n  // Override the default set of quick-pick emojis\n  emojis?: string[]; // default: [\"👍\",\"❤️\",\"😂\",\"😮\",\"😢\",\"🔥\",\"🎉\",\"👏\"]\n\n  className?: string;\n  align?: \"left\" | \"right\"; // Which side the full picker opens towards\n}"
      ),

      h2("Customizing the Quick Emojis"),
      codeBlock("tsx",
        "// Provide your own set of frequently used reactions:\n<ReactionPicker\n  onSelect={handleReact}\n  emojis={[\"🙌\", \"💯\", \"🚀\", \"😍\", \"🤔\", \"👀\"]}\n/>"
      ),
    )
  },

  {
    title: "<OnlineBadge> Component",
    slug: "component-online-badge",
    category: "6. UI Components",
    order: 68,
    content: doc(
      h1("<OnlineBadge> Component"),
      p(t("A tiny visual indicator — a green dot — that shows whether a user is currently online. Typically used overlaid on an avatar image.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { OnlineBadge } from \"hermes-chat-react/react\";\n\nfunction UserAvatar({ user, isOnline }) {\n  return (\n    <div style={{ position: \"relative\", display: \"inline-block\" }}>\n      <img src={user.avatar} style={{ width: 40, height: 40, borderRadius: \"50%\" }} />\n      <OnlineBadge isOnline={isOnline} />\n    </div>\n  );\n}"
      ),

      h2("Combining with usePresence"),
      codeBlock("tsx",
        "import { usePresence, OnlineBadge } from \"hermes-chat-react/react\";\n\nfunction RoomMember({ client, user }) {\n  const { isOnline } = usePresence(client);\n\n  return (\n    <div style={{ position: \"relative\", display: \"inline-block\" }}>\n      <img src={user.avatar} style={{ width: 40, height: 40, borderRadius: \"50%\" }} />\n      <OnlineBadge isOnline={isOnline(user.userId)} />\n    </div>\n  );\n}"
      ),
    )
  },

  {
    title: "<MediaMessage> Component",
    slug: "component-media-message",
    category: "6. UI Components",
    order: 69,
    content: doc(
      h1("<MediaMessage> Component"),
      p(t("The "), code("<MediaMessage>"), t(" component renders media attachments — images, videos, audio, and documents — inside a message bubble. It handles different content types, shows thumbnails, and provides download links for documents.")),

      h2("Basic Usage"),
      codeBlock("tsx",
        "import { MediaMessage } from \"hermes-chat-react/react\";\n\nfunction MessageBubble({ message }) {\n  if (message.type === \"text\") {\n    return <p>{message.text}</p>;\n  }\n\n  // For image, video, audio, or document messages:\n  return <MediaMessage message={message} />;\n}"
      ),

      h2("What It Renders"),
      ul(
        [bold("image"), t(" — An img tag with the URL, with a thumbnail preview if available")],
        [bold("video"), t(" — A <video> element with controls")],
        [bold("audio"), t(" — An <audio> element with controls")],
        [bold("document"), t(" — A download link card with the filename and file size")],
      ),
    )
  },

  // ─── 8. ADVANCED ────────────────────────────────────────────────────────────
  {
    title: "Overriding Components (IoC)",
    slug: "advanced-component-overrides",
    category: "7. Advanced",
    order: 70,
    content: doc(
      h1("Overriding Default Components (Inversion of Control)"),
      p(t("Hermes uses an Inversion of Control (IoC) pattern for its UI components. This means you can replace "), bold("any"), t(" built-in component with your own custom implementation, applied globally across your entire app, without modifying the SDK.")),
      p(t("This is done via the "), code("ComponentProvider"), t(" context provider.")),

      h2("How It Works"),
      p(t("Wrap your components in "), code("<ComponentProvider value={...}>"), t(" and pass an object with the keys of the components you want to override. Any SDK component that renders that type will use your version instead.")),

      codeBlock("tsx",
        "import { ComponentProvider, Chat, Room, MessageList } from \"hermes-chat-react/react\";\n\n// 1. Define your replacement components\nconst MyLoader = () => (\n  <div style={{ textAlign: \"center\", padding: 40 }}>\n    <div className=\"my-custom-spinner\" />\n    <p>Fetching messages...</p>\n  </div>\n);\n\nconst MyEmptyState = () => (\n  <div style={{ textAlign: \"center\", padding: 40, color: \"#9ca3af\" }}>\n    <p>Say hi! No messages yet.</p>\n  </div>\n);\n\n// 2. Pass them to ComponentProvider\nfunction App() {\n  return (\n    <Chat client={client}>\n      <ComponentProvider value={{\n        LoadingIndicator: MyLoader,\n        EmptyStateIndicator: MyEmptyState,\n      }}>\n        <Room roomId={roomId}>\n          <MessageList />  {/* Now uses MyLoader and MyEmptyState */}\n        </Room>\n      </ComponentProvider>\n    </Chat>\n  );\n}"
      ),

      h2("Available Override Keys"),
      codeBlock("typescript",
        "// All keys are optional — only provide what you want to override\ninterface ComponentContextValue {\n  Message?: React.ComponentType;          // Single message bubble\n  LoadingIndicator?: React.ComponentType; // Loading spinner\n  EmptyStateIndicator?: React.ComponentType; // Empty room state\n  DateSeparator?: React.ComponentType;    // Date label between messages\n  TypingIndicator?: React.ComponentType;  // \"Alice is typing...\" label\n}"
      ),

      h2("Creating a Custom Message Bubble"),
      p(t("This is the most powerful override. Use "), code("useMessageContext()"), t(" inside your custom component to get the message data:")),
      codeBlock("tsx",
        "import { useMessageContext } from \"hermes-chat-react/react\";\n\nfunction MyCustomMessage() {\n  const { message, isMyMessage } = useMessageContext();\n\n  return (\n    <div\n      style={{\n        display: \"flex\",\n        justifyContent: isMyMessage ? \"flex-end\" : \"flex-start\",\n        marginBottom: 8,\n      }}\n    >\n      <div\n        style={{\n          maxWidth: \"70%\",\n          padding: \"10px 14px\",\n          borderRadius: isMyMessage ? \"18px 18px 4px 18px\" : \"18px 18px 18px 4px\",\n          background: isMyMessage ? \"#4f46e5\" : \"#f3f4f6\",\n          color: isMyMessage ? \"white\" : \"black\",\n        }}\n      >\n        {message.isDeleted ? (\n          <em style={{ opacity: 0.5 }}>This message was deleted</em>\n        ) : (\n          <p style={{ margin: 0 }}>{message.text}</p>\n        )}\n        <small style={{ opacity: 0.6, fontSize: 11 }}>\n          {new Date(message.createdAt).toLocaleTimeString()}\n        </small>\n      </div>\n    </div>\n  );\n}\n\n// Register it globally:\n<ComponentProvider value={{ Message: MyCustomMessage }}>\n  <MessageList />\n</ComponentProvider>"
      ),
    )
  },

  {
    title: "Headless Mode (No UI Components)",
    slug: "advanced-headless",
    category: "7. Advanced",
    order: 71,
    content: doc(
      h1("Headless Mode — Build Your Own UI"),
      p(t("You do not have to use ANY of the built-in UI components. If you want complete design freedom, you can use Hermes in \"headless\" mode — just the hooks and the client, with your own HTML and CSS.")),
      p(t("This is perfect for design systems that have strict component standards, or for applications with very custom UIs.")),

      h2("Headless Example: Custom Chat UI"),
      codeBlock("tsx",
        "import { useState, useEffect } from \"react\";\nimport { HermesClient } from \"hermes-chat-react\";\nimport { useRooms, useMessages, useTyping } from \"hermes-chat-react/react\";\n\nfunction HeadlessChat() {\n  const [client, setClient] = useState(null);\n  const [roomId, setRoomId] = useState(null);\n  const [text, setText] = useState(\"\");\n\n  useEffect(() => {\n    const c = new HermesClient({ /* ...config */ });\n    c.connect().then(() => setClient(c));\n  }, []);\n\n  if (!client) return <div>Connecting...</div>;\n\n  return <ChatUI client={client} />;\n}\n\nfunction ChatUI({ client }) {\n  const [roomId, setRoomId] = useState(null);\n  const { rooms } = useRooms(client);\n\n  return (\n    <div style={{ display: \"flex\" }}>\n      {/* Your own sidebar */}\n      <aside>\n        {rooms.map(room => (\n          <button key={room._id} onClick={() => setRoomId(room._id)}>\n            {room.name || \"DM\"}\n          </button>\n        ))}\n      </aside>\n\n      {/* Your own message area */}\n      {roomId && <MessageArea client={client} roomId={roomId} />}\n    </div>\n  );\n}\n\nfunction MessageArea({ client, roomId }) {\n  const [text, setText] = useState(\"\");\n  const { messages, sendMessage, loading } = useMessages(client, roomId);\n  const { typingText, startTyping, stopTyping } = useTyping(client, roomId);\n\n  const handleSend = async () => {\n    if (!text.trim()) return;\n    await sendMessage({ type: \"text\", text });\n    setText(\"\");\n  };\n\n  if (loading) return <div>Loading...</div>;\n\n  return (\n    <div style={{ flex: 1, display: \"flex\", flexDirection: \"column\" }}>\n      {/* Your own message list */}\n      <div style={{ flex: 1, overflow: \"auto\" }}>\n        {messages.map(msg => (\n          <div key={msg._id}>\n            <strong>{msg.senderId}:</strong> {msg.text}\n          </div>\n        ))}\n      </div>\n\n      {typingText && <div>{typingText}</div>}\n\n      {/* Your own input */}\n      <input\n        value={text}\n        onChange={e => { setText(e.target.value); startTyping(); }}\n        onBlur={stopTyping}\n        onKeyDown={e => e.key === \"Enter\" && handleSend()}\n        placeholder=\"Type a message...\"\n      />\n    </div>\n  );\n}"
      ),

      h2("Key Principle"),
      p(t("In headless mode, all the complex logic (real-time sync, pagination, typing debounce, optimistic updates) still happens inside the hooks. You only control the visual output.")),
    )
  },

  {
    title: "Server Customization Guide",
    slug: "advanced-server",
    category: "7. Advanced",
    order: 72,
    content: doc(
      h1("Customizing the Hermes Server"),
      p(t("Because you own and host the Hermes Engine, you can modify it however you need. The engine is a standard Node.js + Express + Socket.IO + MongoDB application. This guide covers the most common customizations.")),

      h2("Project Structure"),
      p(t("The server is organized as follows:")),
      codeBlock("bash",
        "server/src/\n├── hermes-engine/src/\n│   ├── index.ts          # Engine initialization — wires Socket.IO to the app\n│   ├── routes/           # HTTP routes (/hermes/connect, /hermes/upload, etc.)\n│   ├── socket/           # Socket.IO event handlers\n│   ├── models/           # MongoDB schemas (User, Room, Message)\n│   ├── services/         # Business logic (message service, room service)\n│   └── middleware/       # JWT authentication middleware\n├── routes/               # Your app's own routes (/api, /auth, etc.)\n├── config/\n│   ├── db.ts             # MongoDB connection\n│   └── passport.ts       # OAuth configuration (if using)\n└── app.ts                # Express app setup, CORS, Socket.IO config"
      ),

      h2("Changing the File Upload Destination"),
      p(t("By default, uploads are stored on the server's local filesystem. To redirect them to AWS S3 or another storage provider, modify the upload route:")),
      codeBlock("typescript",
        "// In: hermes-engine/src/routes/uploadRoute.ts\n// Replace the local disk storage with S3:\nimport multer from \"multer\";\nimport multerS3 from \"multer-s3\";\nimport { S3Client } from \"@aws-sdk/client-s3\";\n\nconst s3 = new S3Client({ region: \"us-east-1\" });\n\nconst upload = multer({\n  storage: multerS3({\n    s3,\n    bucket: \"my-hermes-uploads\",\n    contentType: multerS3.AUTO_CONTENT_TYPE,\n    key: (req, file, cb) => {\n      cb(null, `uploads/${Date.now()}-${file.originalname}`);\n    },\n  }),\n  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max\n});"
      ),

      h2("Adding Custom Fields to Users"),
      p(t("The Hermes user model stores basic profile info. To add custom fields like "), code("role"), t(" or "), code("department"), t(", edit the User model:")),
      codeBlock("typescript",
        "// In: hermes-engine/src/models/User.ts\nconst UserSchema = new mongoose.Schema({\n  // ... existing fields ...\n  hermesUserId: String,\n  displayName: String,\n  avatar: String,\n  email: String,\n\n  // Your custom fields:\n  role: { type: String, default: \"member\" },\n  department: String,\n  isAdmin: { type: Boolean, default: false },\n});"
      ),

      h2("Adding Custom Socket Events"),
      p(t("You can add entirely new real-time events by extending the socket handler:")),
      codeBlock("typescript",
        "// In your server's app.ts or a new file:\nio.of(\"/hermes\").on(\"connection\", (socket) => {\n  // Add your own custom event handler\n  socket.on(\"my:custom:event\", async (data, callback) => {\n    console.log(\"Custom event received:\", data);\n    // Do something and respond\n    callback({ success: true, result: \"Done!\" });\n  });\n});"
      ),

      h2("Environment Variables"),
      p(t("The server reads these environment variables:")),
      codeBlock("bash",
        "# MongoDB connection string\nMONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/hermes\n\n# JWT secret for signing tokens\nJWT_SECRET=your_super_long_random_secret_key\n\n# Comma-separated list of allowed frontend origins for the dashboard\nCLIENT_ORIGIN=https://your-dashboard.vercel.app,https://your-app.com\n\n# Server port (defaults to 8080)\nPORT=8080"
      ),
    )
  },

  {
    title: "CORS & Deployment Guide",
    slug: "advanced-cors-deployment",
    category: "7. Advanced",
    order: 73,
    content: doc(
      h1("CORS & Deployment Configuration"),
      p(t("Hermes uses a split CORS policy: SDK-facing routes ("), code("/hermes/*"), t(") are open to any origin so any developer's app can connect, while dashboard routes ("), code("/api/*"), t(" and "), code("/auth/*"), t(") are restricted to your own frontend URLs.")),

      h2("The Split CORS Policy"),
      codeBlock("typescript",
        "// In app.ts — this is how the server is configured:\n\n// SDK routes — open to ANY origin (third-party developers can connect from anywhere)\napp.use(\"/hermes\", cors({ origin: \"*\" }));\n\n// Dashboard routes — restricted to your own frontend domains\napp.use(\"/api\", cors({ origin: allowedOrigins, credentials: true }));\napp.use(\"/auth\", cors({ origin: allowedOrigins, credentials: true }));"
      ),

      h2("Configuring CLIENT_ORIGIN"),
      p(t("Set the "), code("CLIENT_ORIGIN"), t(" environment variable to a comma-separated list of your dashboard/admin frontend URLs. This controls who can access the "), code("/api"), t(" and "), code("/auth"), t(" routes:")),
      codeBlock("bash",
        "# In your server's Vercel/Railway environment variables:\nCLIENT_ORIGIN=https://your-admin-dashboard.vercel.app,https://your-other-frontend.com"
      ),
      p(t("Note: You do NOT need to add third-party developer apps here. Because "), code("/hermes/*"), t(" routes are wide open, any developer using your API key + secret can connect from any domain.")),

      h2("Deploying to Vercel"),
      p(bold("Important:"), t(" Vercel does not support persistent WebSocket connections. The Hermes server uses HTTP long-polling (via Socket.IO) instead of WebSockets in this environment. The SDK is pre-configured to use polling transport by default.")),
      p(t("To deploy the server to Vercel:")),
      ol(
        [t("Push your server code to GitHub.")],
        [t("Import the repository in Vercel.")],
        [t("Set your environment variables (MONGO_URI, JWT_SECRET, CLIENT_ORIGIN).")],
        [t("Deploy. Vercel automatically runs the Node.js server.")],
      ),

      h2("Deploying to Railway or Render"),
      p(t("Railway and Render support full WebSockets. You can enable WebSocket transport by changing the transport configuration in both the server and the client:")),
      codeBlock("typescript",
        "// In app.ts — enable WebSocket support:\nconst io = new Server(server, {\n  cors: { origin: \"*\" },\n  transports: [\"polling\", \"websocket\"], // Allows both\n});\n\n// In your frontend client config:\nconst client = new HermesClient({\n  // ...\n  transports: [\"polling\", \"websocket\"], // Upgrade to WebSocket if available\n});"
      ),
    )
  },

  // ─── 9. EVENTS REFERENCE ────────────────────────────────────────────────────
  {
    title: "Events Reference",
    slug: "events-reference",
    category: "8. Reference",
    order: 80,
    content: doc(
      h1("Complete Events Reference"),
      p(t("Hermes uses an event-driven architecture. This page lists every event emitted by the server and received by the client SDK. You can listen to all of these directly on the "), code("HermesClient"), t(" instance.")),

      h2("Connection Events"),
      codeBlock("typescript",
        "// Fired when the socket successfully connects and authenticates\nclient.on(\"connected\", () => {\n  console.log(\"Connected to Hermes!\");\n});\n\n// Fired when the socket disconnects for any reason\n// reason can be: \"manual\", \"transport close\", \"ping timeout\", etc.\nclient.on(\"disconnected\", (reason: string) => {\n  console.log(\"Disconnected:\", reason);\n});\n\n// Fired when a connection error occurs\nclient.on(\"error\", (error: Error) => {\n  console.error(\"Connection error:\", error.message);\n});"
      ),

      h2("Message Events"),
      codeBlock("typescript",
        "// A new message was sent in a room the current user is in\nclient.on(\"message:receive\", (message: Message) => {\n  // message.roomId tells you which room it belongs to\n  console.log(\"New message:\", message.text, \"in room:\", message.roomId);\n});\n\n// A message was edited\nclient.on(\"message:edited\", (message: Message) => {\n  // Replace the old message in your local state with this updated version\n});\n\n// A message was deleted (soft delete)\nclient.on(\"message:deleted\", ({ messageId, roomId }) => {\n  // Mark the message as deleted in your local state\n});"
      ),

      h2("Room Events"),
      codeBlock("typescript",
        "// A new room was created and the current user is a member\nclient.on(\"room:created\", (room: Room) => {\n  // Add this room to your room list\n});\n\n// A room was deleted\nclient.on(\"room:deleted\", ({ roomId }) => {\n  // Remove this room from your list\n});\n\n// Someone joined a room\nclient.on(\"room:member:joined\", ({ roomId, userId }) => {\n  // Update the room's members array\n});\n\n// Someone left a room\nclient.on(\"room:member:left\", ({ roomId, userId }) => {\n  // Update the room's members array\n});"
      ),

      h2("Presence Events"),
      codeBlock("typescript",
        "// A user came online\nclient.on(\"user:online\", (event: PresenceEvent) => {\n  // { userId, displayName, roomId? }\n  console.log(event.displayName, \"is now online\");\n});\n\n// A user went offline\nclient.on(\"user:offline\", (event: LastSeenEvent) => {\n  // { userId, lastSeen } — lastSeen is an ISO date string\n  console.log(event.userId, \"went offline at\", event.lastSeen);\n});"
      ),

      h2("Typing Events"),
      codeBlock("typescript",
        "client.on(\"typing:started\", (event: TypingEvent) => {\n  // { userId, displayName, roomId }\n  console.log(event.displayName, \"started typing in\", event.roomId);\n});\n\nclient.on(\"typing:stopped\", (event: TypingEvent) => {\n  // { userId, displayName, roomId }\n  console.log(event.displayName, \"stopped typing\");\n});"
      ),

      h2("Receipt Events"),
      codeBlock("typescript",
        "// A user has seen messages up to lastMessageId\nclient.on(\"receipt:updated\", (event: ReceiptEvent) => {\n  // { roomId, userId, lastMessageId, seenAt }\n  console.log(event.userId, \"read messages up to\", event.lastMessageId);\n});"
      ),

      h2("Reaction Events"),
      codeBlock("typescript",
        "// Reactions on a message were updated\nclient.on(\"reaction:updated\", (event: ReactionEvent) => {\n  // { messageId, roomId, reactions: Reaction[] }\n  // Replace the reactions array on the message with event.reactions\n  console.log(\"Reactions on\", event.messageId, \":\", event.reactions);\n});"
      ),
    )
  },

  {
    title: "Troubleshooting & FAQ",
    slug: "troubleshooting",
    category: "8. Reference",
    order: 81,
    content: doc(
      h1("Troubleshooting & FAQ"),
      p(t("Here are answers to the most common questions and issues developers run into when integrating Hermes.")),

      h2("\"CORS policy\" error in the browser"),
      p(bold("Problem:"), t(" You see an error like "), code("Access to fetch at 'https://...' has been blocked by CORS policy"), t(".")),
      p(bold("Solution:"), t(" Your domain is not in the "), code("CLIENT_ORIGIN"), t(" environment variable on your server. Add your frontend URL to "), code("CLIENT_ORIGIN"), t(" and redeploy the server. Note: SDK routes ("), code("/hermes/*"), t(") should never get this error — the CORS issue would only affect "), code("/api"), t(" or "), code("/auth"), t(" routes.")),

      h2("\"WebSocket connection failed\" error"),
      p(bold("Problem:"), t(" You see "), code("WebSocket connection to 'wss://...' failed"), t(".")),
      p(bold("Solution:"), t(" Your hosting provider does not support WebSockets (Vercel is the most common case). The SDK defaults to HTTP polling which works everywhere. If you are explicitly setting "), code("transports: [\"websocket\"]"), t(", remove that override. Use polling only for Vercel deployments.")),

      h2("Messages not appearing in real-time"),
      p(bold("Problem:"), t(" Messages only appear after a page refresh, not in real-time.")),
      p(bold("Solution:"), t(" Make sure you are calling "), code("client.connect()"), t(" before rendering any Hermes components. Also check that the client is being shared across components using a ref or state — do not create a new "), code("HermesClient"), t(" on every render.")),

      h2("\"Rollup failed to resolve import\" build error on Vercel"),
      p(bold("Problem:"), t(" You see "), code("Rollup failed to resolve import \"emoji-picker-react\""), t(" or a similar error when deploying.")),
      p(bold("Solution:"), t(" Update to "), code("hermes-chat-react@0.1.8"), t(" or later. This version pre-bundles "), code("emoji-picker-react"), t(" into the SDK itself, removing the external dependency requirement.")),

      h2("The client connects but immediately disconnects"),
      p(bold("Problem:"), t(" You see \"connected\" then immediately \"disconnected\".")),
      p(bold("Solution:"), t(" This is usually a JWT authentication failure. Check that your "), code("apiKey"), t(" and "), code("secret"), t(" are correct and that the "), code("JWT_SECRET"), t(" on the server matches. Also check if your "), code("userId"), t(" is a valid string — it cannot be null or undefined.")),

      h2("How do I get the userId to pass to Hermes?"),
      p(bold("Answer:"), t(" Hermes does not handle authentication — that is your job. Use your existing auth system (Firebase Auth, Clerk, Auth0, Supabase, etc.) and pass that user's unique ID to Hermes. For example with Firebase:")),
      codeBlock("tsx",
        "import { getAuth, onAuthStateChanged } from \"firebase/auth\";\n\nonAuthStateChanged(getAuth(), (user) => {\n  if (user) {\n    const client = new HermesClient({\n      // ...config\n      userId: user.uid,          // Firebase user ID\n      displayName: user.displayName,\n      avatar: user.photoURL,\n      email: user.email,\n    });\n    client.connect();\n  }\n});"
      ),

      h2("Can I use Hermes with Next.js?"),
      p(bold("Answer:"), t(" Yes! Hermes works great with Next.js (both App Router and Pages Router). The only requirement is that client setup and socket connections happen on the client side, not the server side. Wrap any Hermes code in "), code("useEffect"), t(" or use a "), code("\"use client\""), t(" directive in Next.js App Router.")),
    )
  },
];

// ─── Seed all docs ────────────────────────────────────────────────────────────
async function seedExternalDocs() {
  try {
    console.log("\n🔌 Connecting to MongoDB for Extended Population...");
    await mongoose.connect(MONGO_URI);
    console.log("   ✅ Connected\n");

    const count = await Doc.countDocuments();
    if(count > 0) {
      console.log(`Clearing ${count} old documentation elements...`);
      await Doc.deleteMany({});
    }

    console.log("📖 Seeding new Extended Hermes Documentation...");
    console.log("─".repeat(50));
    
    for (const docData of allDocs) {
      await Doc.create({ ...docData, lastUpdated: new Date(), status: "published" });
      console.log(`   ✅  [${docData.category}] ${docData.title}`);
    }

    console.log("\n" + "═".repeat(50));
    console.log(`🎉  Done! ${allDocs.length} ultra-detailed documents seeded.`);
    console.log("═".repeat(50) + "\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding docs:", error);
    process.exit(1);
  }
}

seedExternalDocs();
