import mongoose from "mongoose";
import dotenv from "dotenv";
import { Doc } from "./src/models/Document.js";

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

// ─── PLATFORM DOCS — category: "project-hermes" ──────────────────────────────

const platformDocs = [
  {
    title: "What is Hermes?",
    slug: "what-is-hermes",
    category: "project-hermes",
    order: 10,
    content: doc(
      h1("What is Hermes?"),
      p(t("Hermes is a real-time messaging SDK that lets you add chat, notifications, and live collaboration to any application in minutes — without building a backend from scratch.")),
      p(t("Most apps need real-time features at some point. Whether it's a customer support chat, a team messaging tool, a live comment feed, or collaborative editing — building all of that yourself means dealing with WebSockets, authentication, message persistence, presence tracking, and scaling. That's weeks of work before you write a single line of your actual product.")),
      p(t("Hermes handles all of that. You bring your users. Hermes handles the rest.")),

      h2("What can you build with Hermes?"),
      ul(
        [bold("In-app chat"), t(" — one-on-one or group messaging between your users")],
        [bold("Customer support"), t(" — live chat between customers and support agents")],
        [bold("Collaborative tools"), t(" — shared editors, whiteboards, or project boards")],
        [bold("Live feeds"), t(" — real-time comments, reactions, notifications")],
        [bold("Multiplayer features"), t(" — turn-based games, live polls, shared state")],
      ),

      h2("How it works"),
      p(t("Hermes has three parts:")),
      ol(
        [bold("The Hermes Engine"), t(" — a Node.js server that manages connections, stores messages, and broadcasts events. You deploy this once. It runs persistently and handles all real-time traffic.")],
        [bold("The Hermes SDK"), t(" — a JavaScript/TypeScript client library you install in your frontend. It connects to the engine and gives you a clean API to send messages, join rooms, track typing, and listen to events.")],
        [bold("Your Project"), t(" — when you register on the Hermes dashboard, you get an API key and secret. These credentials identify your app and authenticate your users with the engine.")],
      ),
      p(t("The flow looks like this:")),
      codeBlock("bash",
        "Your App (Frontend)\n      │\n      │  HermesClient.connect({ apiKey, secret, userId })\n      ▼\nHermes Engine (your deployed server)\n      │\n      │  Authenticates user, issues JWT, opens WebSocket\n      ▼\nMongoDB (stores messages, rooms, users)"
      ),
      p(t("Every user in your app gets a unique Hermes identity tied to their user ID in your system. Once connected, they can join rooms, send messages, and receive real-time events from other users — all through the SDK.")),

      h2("Key concepts"),
      p(t("Before diving into code, here are the four concepts you'll use constantly:")),
      ul(
        [bold("Project"), t(" — your app registered on the Hermes dashboard. Has an API key and secret. Every message and room belongs to a project.")],
        [bold("HermesUser"), t(" — a user identity inside Hermes. Created automatically the first time a user connects. Linked to your own user ID (email, UUID, database ID — whatever you use).")],
        [bold("Room"), t(" — a channel where messages are exchanged. Can be a direct message between two users, or a group room with many members. Rooms are persistent — messages are stored and can be retrieved as history.")],
        [bold("Message"), t(" — a piece of content sent in a room. Can be text, an image, a file, or a custom type. Messages are stored in MongoDB and delivered in real-time to all connected members of the room.")],
      ),

      h2("What Hermes is NOT"),
      p(t("Hermes is not a hosted SaaS platform. It is a self-hosted engine that you deploy and control. Your messages stay in your database. Your users' data never leaves your infrastructure.")),
      p(t("This also means you are responsible for:")),
      ul(
        [t("Keeping your API key and secret private")],
        [t("Deploying and maintaining the Hermes engine")],
        [t("Scaling the engine as your user base grows")],
      ),

      h2("Prerequisites"),
      p(t("To use Hermes, you need:")),
      ul(
        [t("Node.js 18+ installed")],
        [t("A deployed Hermes Engine (see Deployment guide)")],
        [t("Your API Key and Secret from the Hermes dashboard")],
        [t("A basic understanding of JavaScript/TypeScript and async/await")],
      ),
      p(t("You do not need to know anything about WebSockets, Socket.io, or real-time systems. Hermes abstracts all of that away.")),
    ),
  },

  {
    title: "Authentication",
    slug: "hermes-authentication",
    category: "project-hermes",
    order: 20,
    content: doc(
      h1("Authentication"),
      p(t("Hermes uses JWT (JSON Web Tokens) for all authentication. There are no sessions, no cookies — just a signed token that your users carry in localStorage and send with every API request.")),

      h2("How sign-in works"),
      p(t("The sign-in flow uses OAuth providers (Google, GitHub) via a popup window:")),
      ol(
        [t("Your user clicks \"Sign in\" — a 500×600 popup opens to the OAuth provider.")],
        [t("After the user authenticates, the Hermes server verifies the identity, creates or retrieves the user record, and signs a 7-day JWT.")],
        [t("The server redirects to "), code("/auth/callback#token=<jwt>"), t(" on your frontend. Using a URL hash keeps the token out of server logs and referrer headers.")],
        [t("The "), code("/auth/callback"), t(" page stores the token in localStorage, then either closes the popup (sending the token to the parent tab via postMessage) or redirects to /dashboard if it became a new tab.")],
        [t("The parent tab receives the message, fetches "), code("/auth/me"), t(" with the token, and sets the user state.")],
      ),

      h2("The /auth/callback page"),
      p(t("This page handles both the popup-close and new-tab scenarios:")),
      codeBlock("tsx",
        "// src/components/AuthCallback.tsx\nimport { useEffect } from \"react\";\nimport { setToken } from \"../lib/authFetch\";\n\nconst AuthCallback = () => {\n  useEffect(() => {\n    const hash = window.location.hash; // \"#token=eyJ...\"\n    const params = new URLSearchParams(hash.slice(1));\n    const token = params.get(\"token\");\n\n    if (!token) {\n      window.location.replace(\"/\");\n      return;\n    }\n\n    setToken(token); // saves to localStorage as \"hermes_token\"\n\n    if (window.opener && !window.opener.closed) {\n      // Popup: notify the parent tab and close\n      window.opener.postMessage({ type: \"HERMES_AUTH_SUCCESS\", token }, \"*\");\n      window.close();\n    } else {\n      // New tab: replace history so back button doesn't loop\n      window.location.replace(\"/dashboard\");\n    }\n  }, []);\n\n  return <div>Signing you in…</div>;\n};\n\nexport default AuthCallback;"
      ),

      h2("Using the token (authFetch)"),
      p(t("Every request to the Hermes API must include the JWT as a Bearer token. Use the built-in "), code("authFetch"), t(" utility as a drop-in replacement for "), code("fetch"), t(":")),
      codeBlock("typescript",
        "import { authFetch } from \"@/lib/authFetch\";\n\n// Automatically attaches: Authorization: Bearer <hermes_token>\nconst res = await authFetch(\"/api/projects\");\nconst data = await res.json();"
      ),
      p(t("authFetch also automatically clears the token and logs the user out on any "), code("401 Unauthorized"), t(" response.")),

      h2("Verifying auth state on page load"),
      p(t("On app mount, check whether the stored token is still valid before fetching the user:")),
      codeBlock("typescript",
        "const checkAuth = async () => {\n  const token = getToken();\n  if (!token) { clearUser(); return; }\n\n  // Check expiry locally before hitting the network\n  try {\n    const payload = JSON.parse(atob(token.split(\".\")[1]));\n    if (payload.exp * 1000 < Date.now()) {\n      clearToken(); clearUser(); return;\n    }\n  } catch {\n    clearToken(); clearUser(); return;\n  }\n\n  // Token looks valid — verify with server\n  const res = await authFetch(\"/auth/me\");\n  if (res.ok) {\n    const userData = await res.json();\n    setUser(userData); // store in Zustand\n  } else {\n    clearToken(); clearUser();\n  }\n};"
      ),

      h2("Token expiry"),
      p(t("Tokens expire after 7 days. On expiry, the user is automatically logged out on the next API request. There is no refresh token mechanism — the user must sign in again.")),
      p(t("To change the expiry duration, update the "), code("expiresIn"), t(" option in "), code("auth.ts"), t(" on the server:")),
      codeBlock("typescript",
        "const token = jwt.sign(\n  { _id: user._id, isAdmin: user.isAdmin },\n  process.env.SESSION_SECRET!,\n  { expiresIn: \"7d\" }, // change to \"30d\", \"1h\", etc.\n);"
      ),

      h2("Logout"),
      p(t("Logout is client-side only — just clear the token from localStorage:")),
      codeBlock("typescript",
        "import { clearToken } from \"@/lib/authFetch\";\nimport { useUserStore } from \"@/store/userStore\";\n\nconst { clearUser } = useUserStore();\n\nconst logout = () => {\n  clearToken();\n  clearUser();\n  window.location.href = \"/\";\n};"
      ),
    ),
  },

  {
    title: "Deployment",
    slug: "hermes-deployment",
    category: "project-hermes",
    order: 30,
    content: doc(
      h1("Deployment"),
      p(t("Hermes consists of two independently deployed services: the server (Node.js + Express + Socket.io) and the client (React + Vite SPA). Both are deployed to Vercel.")),

      h2("Server deployment (Vercel)"),
      p(t("The server is deployed as a Vercel serverless function via the "), code("@vercel/node"), t(" builder.")),

      h3("vercel.json"),
      codeBlock("json",
        "{\n  \"version\": 2,\n  \"builds\": [{ \"src\": \"src/index.ts\", \"use\": \"@vercel/node\" }],\n  \"routes\": [{ \"src\": \"/(.*)\", \"dest\": \"src/index.ts\" }]\n}"
      ),

      h3("Required environment variables"),
      p(t("Set these in Vercel Dashboard → your server project → Settings → Environment Variables:")),
      codeBlock("bash",
        "MONGO_URI=mongodb+srv://...\nSESSION_SECRET=your-long-random-secret\nSERVER_URL=https://project-hermes-server.vercel.app\nFRONTEND_URL=https://hermes-sdk.vercel.app\nCLIENT_ORIGIN=https://hermes-sdk.vercel.app\nGOOGLE_CLIENT_ID=...\nGOOGLE_CLIENT_SECRET=...\nGITHUB_CLIENT_ID=...\nGITHUB_CLIENT_SECRET=..."
      ),

      h3("Why SERVER_URL matters"),
      p(t("OAuth callback URLs in Passport.js must be absolute. If you use a relative path like "), code("/auth/google/callback"), t(", it resolves incorrectly on Vercel's serverless environment. Always use the absolute URL:")),
      codeBlock("typescript",
        "// src/config/passport.ts\nnew GoogleStrategy({\n  clientID: process.env.GOOGLE_CLIENT_ID!,\n  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,\n  callbackURL: `${process.env.SERVER_URL}/auth/google/callback`, // ✅\n  // callbackURL: \"/auth/google/callback\", // ❌ breaks on Vercel\n})"
      ),

      h2("Client deployment (Vercel)"),
      p(t("The client is a plain Vite SPA. The only required env var is:")),
      codeBlock("bash",
        "VITE_SERVER_ENDPOINT=https://project-hermes-server.vercel.app"
      ),

      h3("vercel.json"),
      p(t("The client needs a catch-all rewrite so React Router handles all routes:")),
      codeBlock("json",
        "{\n  \"version\": 2,\n  \"framework\": \"vite\",\n  \"rewrites\": [{ \"source\": \"/(.*)\", \"destination\": \"/index.html\" }]\n}"
      ),

      h2("Google Cloud Console setup"),
      p(t("In Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client ID:")),
      h3("Authorized JavaScript Origins"),
      codeBlock("bash",
        "https://hermes-sdk.vercel.app\nhttp://localhost:5173"
      ),
      h3("Authorised Redirect URIs"),
      codeBlock("bash",
        "https://project-hermes-server.vercel.app/auth/google/callback\nhttp://localhost:8080/auth/google/callback"
      ),
      p(t("These must exactly match (no trailing slash, correct protocol). Google takes a few minutes to propagate changes.")),

      h2("CORS configuration"),
      p(t("The server's CORS setup accepts a comma-separated list of origins in the "), code("CLIENT_ORIGIN"), t(" env var, supporting both local dev and production:")),
      codeBlock("typescript",
        "// src/app.ts\nconst allowedOrigins = (process.env.CLIENT_ORIGIN || \"\")\n  .split(\",\")\n  .map((o) => o.trim())\n  .filter(Boolean);\n\napp.use(cors({\n  origin: (origin, callback) => {\n    if (!origin) return callback(null, true); // allow Postman / curl\n    if (allowedOrigins.includes(origin)) return callback(null, true);\n    callback(new Error(`CORS: origin '${origin}' not allowed`));\n  },\n  credentials: true,\n}));"
      ),
    ),
  },
];

// ─── SDK DOCS — category: "hermes-chat-react" ────────────────────────────────

const sdkDocs = [
  {
    title: "Quick Start & Architecture",
    slug: "sdk-quick-start",
    category: "hermes-chat-react",
    order: 100,
    content: doc(
      h1("Quick Start & Architecture"),
      p(t("The Hermes Chat SDK ("), code("hermes-chat-react"), t(") provides a suite of deeply integrated React components and a lightweight JavaScript client to power real-time messaging applications.")),

      h2("1. Installation"),
      p(t("Install the library using your package manager. The SDK ships with its own TypeScript definitions.")),
      codeBlock("bash", "npm install hermes-chat-react\n# or\nyarn add hermes-chat-react"),

      h2("2. Architecture Overview"),
      p(t("The Hermes SDK uses a strict parent-child Context Architecture to prevent prop-drilling:")),
      ol(
        [bold("The Core Client"), t(": You initialize a "), code("HermesClient"), t(" to manage WebSockets and REST requests.")],
        [bold("The Global Context ("), code("<Chat>"), bold(")"), t(": Wrap your application in the "), code("<Chat>"), t(" provider. This passes the "), code("HermesClient"), t(" and user state to all child components.")],
        [bold("The Room Context ("), code("<Room>"), bold(")"), t(": To render conversations, wrap your view components in "), code("<Room roomId={id}>"), t(". This automates message fetching, typing indicators, and WebSocket subscriptions for that specific channel.")],
        [bold("UI Components"), t(": Components like "), code("<MessageList>"), t(" and "), code("<ChatInput>"), t(" require almost no props — they automatically infer state from the nearest "), code("<Room>"), t(" provider.")],
      ),

      h2("3. Hello World: Your First Chat App"),
      p(t("Here is a complete, minimal React application demonstrating the SDK:")),
      codeBlock("tsx",
        "import React, { useState, useEffect } from \"react\";\nimport {\n  HermesClient,\n  Chat,\n  RoomList,\n  Room,\n  Window,\n  MessageList,\n  ChatInput\n} from \"hermes-chat-react/react\";\n\nconst App = () => {\n  const [client, setClient] = useState<HermesClient | null>(null);\n  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);\n\n  useEffect(() => {\n    const initHermes = async () => {\n      const hClient = new HermesClient({\n        endpoint: \"https://api.yourdomain.com\",\n        apiKey: \"YOUR_API_KEY\",\n        secret: \"YOUR_SECRET_KEY\",\n        userId: \"user-123\",\n        displayName: \"Alice\"\n      });\n      await hClient.connect();\n      setClient(hClient);\n    };\n    initHermes();\n    return () => { if (client) client.disconnect(); };\n  }, []);\n\n  if (!client) return <div>Connecting to Hermes...</div>;\n\n  return (\n    <Chat client={client}>\n      <div style={{ display: \"flex\", height: \"100vh\" }}>\n        <div style={{ width: \"320px\", borderRight: \"1px solid #ccc\" }}>\n          <RoomList onSelectRoom={(room) => setActiveRoomId(room._id)} />\n        </div>\n        <div style={{ flex: 1 }}>\n          {activeRoomId ? (\n            <Room roomId={activeRoomId}>\n              <Window>\n                <MessageList />\n                <ChatInput />\n              </Window>\n            </Room>\n          ) : (\n            <div style={{ margin: \"auto\" }}>Select a chat to get started.</div>\n          )}\n        </div>\n      </div>\n    </Chat>\n  );\n};\n\nexport default App;"
      ),
      p(t("Notice how lean the UI code is. You did not need to pass an "), code("onSendMessage"), t(" callback to "), code("<ChatInput>"), t(", nor did you pass a "), code("messages"), t(" array to "), code("<MessageList>"), t(". Because they sit inside "), code("<Room>"), t(", the SDK automatically tracks state, handles pagination, and listens for WebSocket events.")),
    ),
  },

  {
    title: "Initialization & Users",
    slug: "sdk-init-users",
    category: "hermes-chat-react",
    order: 110,
    content: doc(
      h1("Initialization & Users"),
      p(t("Before interacting with chat UI components, you must initialize the "), code("HermesClient"), t(" and authenticate your user session. The SDK handles both initial HTTP authentication and underlying WebSocket connections seamlessly.")),

      h2("Authentication strategies"),
      p(t("To connect to Hermes, you have two strategies:")),
      ol(
        [bold("API Key & Secret"), t(" — primarily for backend or development environments.")],
        [bold("JWT Token"), t(" — best practice for production client-side applications.")],
      ),

      h3("Connecting with API Key & Secret"),
      p(t("If you are prototyping, pass your project's raw credentials directly to the client:")),
      codeBlock("typescript",
        "import { HermesClient } from \"hermes-chat-react\";\n\nconst client = new HermesClient({\n  endpoint: \"https://api.yourdomain.com\",\n  apiKey: \"YOUR_API_KEY\",\n  secret: \"YOUR_SECRET_KEY\",\n  userId: \"user-123\",\n  displayName: \"Alice\",\n  avatar: \"https://example.com/alice.jpg\", // optional\n  email: \"alice@example.com\",              // optional\n});\n\n// Await connection to receive the hydrated HermesUser object\nconst user = await client.connect();\nconsole.log(\"Connected as:\", user.displayName);"
      ),

      h3("Connecting with a Pre-Generated JWT"),
      p(t("In production, never expose your "), code("secret"), t(" on the client side. Instead, your backend generates a JWT and passes it to the frontend:")),
      codeBlock("typescript",
        "const client = new HermesClient({\n  endpoint: \"https://api.yourdomain.com\",\n  token: \"eyJhbGciOiJIUzI1NiIsInR5...\", // secure JWT from your backend\n});\n\nawait client.connect();"
      ),

      h2("Error handling"),
      p(t("Wrap your connection logic in a try/catch to handle missing endpoints or declined credentials:")),
      codeBlock("typescript",
        "try {\n  await client.connect();\n} catch (error) {\n  console.error(\"Failed to authenticate with Hermes:\", error.message);\n}"
      ),

      h2("Querying the user directory"),
      p(t("To search for other members to start a conversation, use "), code("client.getUsers()"), t(". This requires an active connection:")),
      codeBlock("typescript",
        "// Fetches all available HermesUsers in the workspace\nconst directory = await client.getUsers();\n\ndirectory.forEach(user => {\n  console.log(user.userId, user.displayName, user.avatar);\n});"
      ),

      h2("Providing context to React"),
      p(t("Once your "), code("HermesClient"), t(" is connected, pass it to the "), code("<Chat>"), t(" component. This injects the "), code("HermesUser"), t(" payload throughout the React tree:")),
      codeBlock("tsx",
        "import { Chat } from \"hermes-chat-react/react\";\n\n<Chat client={client}>\n  {/* The rest of your app */}\n</Chat>"
      ),

      h2("The HermesUser type"),
      codeBlock("typescript",
        "interface HermesUser {\n  userId: string;       // your own user ID (email, UUID, etc.)\n  displayName: string;\n  avatar?: string;      // URL to profile picture\n  email?: string;\n}"
      ),
    ),
  },

  {
    title: "Channels (Rooms)",
    slug: "sdk-channels",
    category: "hermes-chat-react",
    order: 120,
    content: doc(
      h1("Channels (Rooms)"),
      p(t("Channels (referred to as \"Rooms\" internally in Hermes) are the foundational containers for conversation. The SDK allows you to query existing rooms, create new direct messages, group chats, and read member lists.")),

      h2("The <RoomList> component"),
      p(t("The easiest way to display available channels is via the "), code("<RoomList>"), t(" component, which automatically fetches the user's active rooms on mount:")),
      codeBlock("tsx",
        "import React, { useState } from \"react\";\nimport { RoomList } from \"hermes-chat-react/react\";\n\nexport const HermesSidebar = () => {\n  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);\n\n  return (\n    <div className=\"flex flex-col h-full w-[300px] border-r\">\n      <div className=\"p-4 font-bold border-b\">Conversations</div>\n      <div className=\"flex-1 overflow-y-auto\">\n        <RoomList\n          onSelectRoom={(room) => {\n            console.log(\"Joined:\", room.name || room._id);\n            setActiveRoomId(room._id);\n          }}\n        />\n      </div>\n    </div>\n  );\n};"
      ),

      h2("Manual querying (headless)"),
      p(t("To fetch the raw room list outside the React context tree, call "), code("client.getRooms()"), t(":")),
      codeBlock("typescript",
        "const rooms = await hermesClient.getRooms();\nconsole.log(`User is a member of ${rooms.length} rooms.`);\n\nrooms.forEach((room) => {\n  console.log(`Room ID: ${room._id}`);\n  console.log(`Members: ${room.members.join(\", \")}`);\n});"
      ),

      h2("Creating channels"),

      h3("Creating a direct room (1-on-1)"),
      p(t("Pass the "), code("targetUserId"), t(" to "), code("createDirectRoom"), t(". A new channel is created on the backend and its ID can immediately be passed to the "), code("<Room>"), t(" context provider:")),
      codeBlock("tsx",
        "import { useChatContext } from \"hermes-chat-react/react\";\n\nexport const StartChatButton = ({ targetUser, onRoomCreated }) => {\n  const { client } = useChatContext();\n  const [isCreating, setIsCreating] = useState(false);\n\n  const handleNewChat = async () => {\n    setIsCreating(true);\n    try {\n      const room = await client.createDirectRoom({\n        targetUserId: targetUser.userId,\n      });\n      onRoomCreated(room);\n    } catch (error) {\n      console.error(\"Failed creating chat:\", error);\n    } finally {\n      setIsCreating(false);\n    }\n  };\n\n  return (\n    <button disabled={isCreating} onClick={handleNewChat}>\n      {isCreating ? \"Initializing...\" : `Message ${targetUser.displayName}`}\n    </button>\n  );\n};"
      ),

      h3("Creating a group room"),
      codeBlock("typescript",
        "const group = await client.createGroupRoom({\n  name: \"Design Team\",\n  memberIds: [\"user-1\", \"user-2\", \"user-3\"],\n});\n\nconsole.log(\"Group created:\", group._id);"
      ),

      h2("The <Room> context provider"),
      p(t("Once you have a valid "), code("roomId"), t(", mount a "), code("<Room>"), t(" provider around your messaging view. If you skip this, components like "), code("<MessageList>"), t(" and "), code("<ChatInput>"), t(" will fail — they have no parent context to read from.")),
      codeBlock("tsx",
        "import { Room, Window, MessageList, ChatInput } from \"hermes-chat-react/react\";\n\nconst ConversationFeed = ({ roomId }) => {\n  if (!roomId) return <div>Select a room to get started.</div>;\n\n  return (\n    <Room roomId={roomId}>\n      <Window>\n        <MessageList />\n        <ChatInput />\n      </Window>\n    </Room>\n  );\n};"
      ),

      h2("The Room type"),
      codeBlock("typescript",
        "interface Room {\n  _id: string;\n  type: \"direct\" | \"group\";\n  projectId: string;\n  name?: string;          // group rooms only\n  members: string[];      // array of userId strings (not full user objects)\n  isActive: boolean;\n  lastActivity: string;   // ISO timestamp\n  unreadCount: number;\n  lastMessage?: Message;\n}"
      ),
      p(t("The "), code("members"), t(" array contains string IDs, not fully hydrated user objects. To resolve names or avatars, cross-reference against the directory using "), code("await client.getUsers()"), t(".")),
    ),
  },

  {
    title: "Messages",
    slug: "sdk-messages",
    category: "hermes-chat-react",
    order: 130,
    content: doc(
      h1("Messages"),
      p(t("This section covers the lifecycle and UI presentation of individual messages inside a Hermes conversation.")),

      h2("Rendering the message feed"),
      p(t("Mount "), code("<MessageList>"), t(" anywhere inside a "), code("<Room>"), t(" provider. It automatically binds to the WebSocket layer and renders new messages instantly:")),
      codeBlock("tsx",
        "import { Room, Window, MessageList, ChatInput } from \"hermes-chat-react/react\";\n\nexport const MainChatArea = ({ activeRoomId }) => {\n  if (!activeRoomId) return <div className=\"m-auto\">No Chat Active</div>;\n\n  return (\n    <Room roomId={activeRoomId}>\n      <Window className=\"flex flex-col h-full w-full bg-white relative\">\n        <div className=\"flex-1 overflow-y-auto p-4\">\n          <MessageList />\n        </div>\n        <div className=\"p-4 border-t shrink-0\">\n          <ChatInput\n            className=\"flex text-sm w-full\"\n            inputClassName=\"flex-1 rounded-2xl bg-gray-100 px-4 py-2 outline-none\"\n            placeholder=\"Type your message...\"\n          />\n        </div>\n      </Window>\n    </Room>\n  );\n};"
      ),
      p(t("Under the hood, "), code("<MessageList>"), t(" maps over "), code("<Message>"), t(" components. Each message checks "), code("isOwn"), t(" (sent by the connected user) to float it to the correct side of the container — your messages on the right, others on the left.")),

      h2("Sending messages programmatically"),
      p(t("To send a message without the "), code("<ChatInput>"), t(" component, call "), code("client.sendMessage()"), t(" directly:")),
      codeBlock("typescript",
        "// Inside a component wrapped by <Room>\nconst { sendMessage } = useRoomActionContext();\n\nawait sendMessage({\n  text: \"Hello, world!\",\n  type: \"text\",\n});"
      ),

      h2("Image & file uploads"),
      p(t("Upload logic is natively integrated into "), code("<ChatInput>"), t(". The React interface checks the message "), code("type"), t(" payload and switches the internal renderer:")),
      ul(
        [code("type === 'image'"), t(" → renders a full "), code("<img src={url} />")],
        [code("type === 'video'"), t(" → renders an HTML5 "), code("<video controls />")],
        [code("type === 'document'"), t(" → renders a downloadable "), code("<a>"), t(" link with the fileName")],
      ),
      p(t("To build a custom uploader entirely from scratch:")),
      codeBlock("tsx",
        "import { useChatContext, useRoomActionContext } from \"hermes-chat-react/react\";\n\nconst CustomFileUploader = () => {\n  const { client } = useChatContext();\n  const { sendMessage } = useRoomActionContext();\n\n  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {\n    const file = e.target.files?.[0];\n    if (!file) return;\n\n    // Step 1: Upload the file to a storage endpoint to get a URL\n    const formData = new FormData();\n    formData.append(\"file\", file);\n    const uploadRes = await fetch(\"https://api.yourdomain.com/upload\", {\n      method: \"POST\",\n      body: formData,\n    });\n    const { fileUrl } = await uploadRes.json();\n\n    // Step 2: Broadcast a media message into the current room\n    await sendMessage({\n      text: \"I sent a file!\",\n      type: \"image\", // \"document\", \"video\", etc.\n      url: fileUrl,\n    });\n  };\n\n  return <input type=\"file\" onChange={handleFileChange} />;\n};"
      ),

      h2("Threads & replies"),
      p(t("Thread branching allows secondary conversations isolated from the main message feed. Mount a "), code("<Thread>"), t(" sibling next to "), code("<MessageList>"), t(". When a user clicks \"Reply in Thread\", the context signals the "), code("<Thread>"), t(" panel to render:")),
      codeBlock("tsx",
        "import { Room, Window, MessageList, ChatInput, Thread } from \"hermes-chat-react/react\";\n\nconst SplitViewChat = ({ roomId }) => (\n  <Room roomId={roomId}>\n    <div className=\"flex w-full h-full\">\n      {/* Main feed */}\n      <Window className=\"flex-1 flex flex-col border-r\">\n        <MessageList className=\"flex-1 overflow-y-auto\" />\n        <ChatInput className=\"shrink-0 p-3\" />\n      </Window>\n\n      {/* Thread panel — renders null until a thread is triggered */}\n      <div className=\"w-[350px] h-full hidden lg:block bg-gray-50\">\n        <Thread autoFocus={true} />\n      </div>\n    </div>\n  </Room>\n);"
      ),

      h2("Reactions"),
      p(t("Emoji reactions are supported natively via the "), code("<MessageActions>"), t(" hover component. By default, the SDK injects an "), code("<OnlineBadge>"), t(" and a "), code("<ReactionPicker>"), t(" contextually onto the "), code("<Message>"), t(" object.")),
      p(t("Clicking an emoji dispatches a "), code("message.reaction"), t(" mutation up the active WebSocket context. "), code("<MessageList>"), t(" subscribes to this delta and repaints immediately without a full re-render.")),

      h2("The Message type"),
      codeBlock("typescript",
        "interface Message {\n  _id: string;\n  roomId: string;\n  senderId: string;\n  type: \"text\" | \"image\" | \"video\" | \"audio\" | \"document\" | \"link\";\n  text?: string;       // present for type === \"text\"\n  url?: string;        // present for media types\n  fileName?: string;   // present for type === \"document\"\n  fileSize?: number;\n  replyTo?: string;    // _id of the parent message in a thread\n  reactions?: Reaction[];\n  isDeleted?: boolean;\n  createdAt: string;   // ISO timestamp\n  editedAt?: string;\n}"
      ),
    ),
  },

  {
    title: "Core React Components",
    slug: "sdk-core-components",
    category: "hermes-chat-react",
    order: 140,
    content: doc(
      h1("Core React Components"),
      p(t("The Hermes React SDK is a hierarchy of structural components. To use them correctly, you must understand how they nest together.")),

      h2("1. Global providers"),

      h3("<Chat>"),
      p(t("The "), code("<Chat>"), t(" component initializes the theme and the "), code("HermesClient"), t(" context globally. It is the highest-level wrapper for any chat interface.")),
      p(bold("Props:")),
      codeBlock("typescript",
        "interface ChatProps {\n  client: HermesClient;          // Required — the initialized client\n  theme?: \"light\" | \"dark\";     // Default: \"light\"\n  customClasses?: CustomClasses; // Granular layout overrides\n}"
      ),
      codeBlock("tsx",
        "import { Chat, HermesClient } from \"hermes-chat-react/react\";\n\nconst ChatAppWrapper = ({ children }) => {\n  const [chatClient, setChatClient] = useState<HermesClient | null>(null);\n\n  useEffect(() => {\n    const init = async () => {\n      const client = new HermesClient({\n        endpoint: \"https://api.myapp.com\",\n        apiKey: \"PUBLIC_KEY\",\n        userId: \"user-42\",\n      });\n      await client.connect();\n      setChatClient(client);\n    };\n    init();\n  }, []);\n\n  if (!chatClient) return <div>Connecting...</div>;\n\n  return (\n    <Chat\n      client={chatClient}\n      theme=\"dark\"\n      customClasses={{ chat: \"h-screen w-full flex bg-gray-900\" }}\n    >\n      {children}\n    </Chat>\n  );\n};"
      ),

      hr(),
      h2("2. Conversation controllers"),

      h3("<Room>"),
      p(t("The "), code("<Room>"), t(" wrapper subscribes the data layer for a specific chat room. It does not render visible DOM nodes — it fetches historical data, joins the WebSocket channel, and maps typing indicators.")),
      p(bold("Props:")),
      codeBlock("typescript",
        "interface RoomProps {\n  roomId: string;              // Required — the channel's MongoDB _id\n  Message?: ComponentType;     // Optional full visual replacement for message nodes\n}"
      ),
      codeBlock("tsx",
        "import { Room, Window, MessageList, ChatInput } from \"hermes-chat-react/react\";\n\nconst ActiveConversation = ({ currentRoomId }) => {\n  if (!currentRoomId) return <div>No chat selected.</div>;\n\n  // When currentRoomId changes, Room automatically unsubscribes the old\n  // WebSocket channel and fetches the history for the new one.\n  return (\n    <Room roomId={currentRoomId}>\n      <Window>\n        <MessageList />\n        <ChatInput />\n      </Window>\n    </Room>\n  );\n};"
      ),

      hr(),
      h2("3. Structural layout"),

      h3("<Window>"),
      p(t("Renders a CSS Flexbox-column "), code("div"), t(" that strictly structures the conversation feed above the composer. Should always wrap "), code("<MessageList>"), t(" and "), code("<ChatInput>"), t(".")),
      codeBlock("tsx",
        "import { Window, MessageList, ChatInput } from \"hermes-chat-react/react\";\n\n// Window forces MessageList to stretch and ChatInput to stick to bottom\n<Window className=\"flex-1 flex flex-col h-full bg-white\">\n  <div className=\"chat-header h-16 border-b\">Room Header</div>\n  <MessageList />\n  <ChatInput className=\"shrink-0 p-4 border-t\" />\n</Window>"
      ),

      h3("<RoomList>"),
      p(t("Automatically maps and renders the user's active rooms from "), code("ChatContext"), t(":")),
      codeBlock("tsx",
        "import { RoomList } from \"hermes-chat-react/react\";\n\nconst Sidebar = ({ setRoomId }) => (\n  <div className=\"w-80 h-full border-r overflow-y-auto shrink-0\">\n    <h2 className=\"p-4 font-bold text-lg\">My Chats</h2>\n    <RoomList\n      onSelectRoom={(room) => {\n        console.log(`Clicked: ${room.name}`);\n        setRoomId(room._id);\n      }}\n    />\n  </div>\n);"
      ),

      hr(),
      h2("4. Interaction engines"),

      h3("<MessageList> & <ChatInput>"),
      p(t("These are the core UI workhorses. Because they inherit state from "), code("<Room>"), t(", you do not need to pass them logic handlers:")),
      codeBlock("tsx",
        "import { Room, Window, MessageList, ChatInput } from \"hermes-chat-react/react\";\n\nconst FullView = ({ activeId }) => (\n  <Room roomId={activeId}>\n    <Window>\n      {/* Renders message history with dates and typing indicators */}\n      <MessageList className=\"flex-1 overflow-y-auto p-4\" />\n\n      {/* Handles text input, file attachments, and Enter key submission */}\n      <div className=\"p-3 bg-gray-50\">\n        <ChatInput\n          placeholder=\"Send a message...\"\n          inputClassName=\"w-full rounded-2xl border px-4 py-2\"\n        />\n      </div>\n    </Window>\n  </Room>\n);"
      ),

      h3("<Thread>"),
      p(t("The thread panel component. Renders "), code("null"), t(" until a thread context event is triggered from the main message list. Place it as a sibling to "), code("<Window>"), t(" inside "), code("<Room>"), t(":")),
      codeBlock("tsx",
        "<Room roomId={roomId}>\n  <div className=\"flex w-full h-full\">\n    <Window className=\"flex-1\">\n      <MessageList />\n      <ChatInput />\n    </Window>\n    <div className=\"w-[350px] hidden lg:block\">\n      <Thread autoFocus />\n    </div>\n  </div>\n</Room>"
      ),
    ),
  },

  {
    title: "React Hooks Reference",
    slug: "sdk-hooks",
    category: "hermes-chat-react",
    order: 150,
    content: doc(
      h1("React Hooks Reference"),
      p(t("The SDK exposes several hooks for reactive, context-driven data access. All hooks must be called within the appropriate provider tree.")),

      h2("useChatContext()"),
      p(t("Provides low-level access to the "), code("HermesClient"), t(" instance and the currently authenticated user. Available anywhere inside "), code("<Chat>"), t(".")),
      codeBlock("tsx",
        "import { useChatContext } from \"hermes-chat-react/react\";\n\nfunction ConnectionStatus() {\n  const { client, currentUser } = useChatContext();\n\n  return (\n    <div>\n      {client.isConnected\n        ? `✅ Online as ${currentUser?.displayName}`\n        : \"🔄 Connecting...\"}\n    </div>\n  );\n}"
      ),
      p(bold("Returns:")),
      ul(
        [code("client"), t(" (HermesClient) — the core engine instance")],
        [code("currentUser"), t(" (HermesUser) — the currently authenticated user")],
      ),

      hr(),
      h2("useRoomStateContext()"),
      p(t("Provides the active room object and a websocket-synced message list. Must be called inside "), code("<Room>"), t(".")),
      codeBlock("tsx",
        "import { useRoomStateContext } from \"hermes-chat-react/react\";\n\nfunction RoomHeader() {\n  const { room, messages } = useRoomStateContext();\n\n  return (\n    <div className=\"p-4 border-b\">\n      <h2>{room?.name || \"Direct Message\"}</h2>\n    </div>\n  );\n}"
      ),
      p(bold("Returns:")),
      ul(
        [code("room"), t(" (Room) — the active room object")],
        [code("messages"), t(" (Message[]) — the real-time message list")],
        [code("hasMore"), t(" (boolean) — whether more historical messages exist")],
      ),

      hr(),
      h2("useRoomActionContext()"),
      p(t("Provides methods associated with a given Room. Must be called inside "), code("<Room>"), t(".")),
      codeBlock("tsx",
        "import { useRoomActionContext } from \"hermes-chat-react/react\";\n\nfunction Actions() {\n  const { loadMore, sendMessage } = useRoomActionContext();\n  // ...\n}"
      ),
    ),
  },

  {
    title: "UI Customization & Theming",
    slug: "sdk-customization",
    category: "hermes-chat-react",
    order: 160,
    content: doc(
      h1("UI Customization & Theming"),
      p(t("Hermes components have strict internal structure but do not enforce colors. You can heavily modify UI presentation using three approaches: CSS variables, the "), code("customClasses"), t(" prop, and render props.")),

      h2("1. CSS variables"),
      p(t("The recommended approach. Target the "), code(".hermes-chat"), t(" class in your "), code("index.css"), t(":")),
      codeBlock("css",
        "/* index.css */\n:root {\n  --brand-bg: #0a0a0a;\n  --brand-text: #ffffff;\n  --brand-accent: #111113;\n}\n\n.hermes-chat--dark {\n  background-color: var(--brand-bg);\n  color: var(--brand-text);\n}"
      ),

      h2("2. customClasses prop"),
      p(t("If your UI is suffering from layout or container issues, the global "), code("<Chat>"), t(" container accepts a "), code("customClasses"), t(" prop. Pass raw CSS utility strings directly into the component's internal wrappers:")),
      codeBlock("tsx",
        "<Chat\n  client={client}\n  theme=\"dark\"\n  customClasses={{\n    chat: \"w-full h-full flex flex-col items-center\",\n    room: \"flex-1 w-full min-w-0\",\n  }}\n>"
      ),

      h2("3. renderMessage — full bubble override"),
      p(t("For total control over message presentation, pass a "), code("renderMessage"), t(" render prop to "), code("<MessageList>"), t(". The SDK disables its internal "), code("<Message>"), t(" structure and uses your renderer instead:")),
      codeBlock("tsx",
        "<MessageList\n  className=\"h-full\"\n  renderMessage={(message, isOwn) => {\n    if (message.isDeleted) {\n      return <div className=\"italic text-gray-400\">Message deleted.</div>;\n    }\n\n    return (\n      <div className={`flex ${isOwn ? \"flex-row-reverse\" : \"flex-row\"} mb-3 gap-2`}>\n        {!isOwn && <div className=\"w-8 h-8 rounded-full bg-gray-600\" />}\n        <div\n          className={`px-4 py-2 rounded-2xl ${\n            isOwn ? \"bg-blue-600 text-white\" : \"bg-gray-800 text-gray-100\"\n          }`}\n        >\n          {message.type === \"text\" && <p>{message.text}</p>}\n          {message.type === \"image\" && <img src={message.url} alt=\"attachment\" />}\n        </div>\n      </div>\n    );\n  }}\n/>"
      ),

      h2("4. renderRoomItem — custom room list items"),
      p(t("Override how each room appears in the sidebar list:")),
      codeBlock("tsx",
        "<RoomList\n  onSelectRoom={handleSelect}\n  renderRoomItem={(room, isActive) => (\n    <div\n      className={`p-4 rounded-xl cursor-pointer transition-colors ${\n        isActive ? \"bg-blue-600 text-white\" : \"bg-transparent hover:bg-gray-800\"\n      }`}\n    >\n      <span className=\"font-bold\">{room.name || \"Direct Message\"}</span>\n      <span className=\"text-xs opacity-60 block\">\n        {room.members.length} members\n      </span>\n      {room.lastMessage && (\n        <p className=\"text-xs mt-1 truncate opacity-50\">\n          {room.lastMessage.text}\n        </p>\n      )}\n    </div>\n  )}\n/>"
      ),

      h2("CustomClasses type reference"),
      codeBlock("typescript",
        "interface CustomClasses {\n  chat?: string;        // outermost <Chat> wrapper\n  room?: string;        // <Room> container\n  window?: string;      // <Window> flex column\n  messageList?: string; // <MessageList> scroll container\n  chatInput?: string;   // <ChatInput> outer wrapper\n  inputEl?: string;     // the actual <textarea> element\n  roomList?: string;    // <RoomList> scroll container\n  roomItem?: string;    // individual room row\n}"
      ),
    ),
  },

  {
    title: "Types Reference",
    slug: "sdk-types",
    category: "hermes-chat-react",
    order: 170,
    content: doc(
      h1("Types Reference"),
      p(t("All core types exported by the "), code("hermes-chat-react"), t(" SDK.")),

      h2("HermesConfig"),
      codeBlock("typescript",
        "type HermesConfig =\n  | {\n      endpoint: string;\n      token: string; // JWT from your backend\n    }\n  | {\n      endpoint: string;\n      apiKey: string;\n      secret: string;\n      userId: string;\n      displayName?: string;\n      avatar?: string;\n      email?: string;\n    };"
      ),

      h2("HermesUser"),
      codeBlock("typescript",
        "interface HermesUser {\n  userId: string;       // your own user ID from your system\n  displayName: string;\n  avatar?: string;      // URL\n  email?: string;\n}"
      ),

      h2("Room"),
      codeBlock("typescript",
        "interface Room {\n  _id: string;\n  type: \"direct\" | \"group\";\n  projectId: string;\n  name?: string;          // group rooms only\n  members: string[];      // userId strings, not full user objects\n  isActive: boolean;\n  lastActivity: string;   // ISO 8601 timestamp\n  unreadCount: number;\n  lastMessage?: Message;\n  metadata?: Record<string, any>; // custom data\n}"
      ),

      h2("Message"),
      codeBlock("typescript",
        "interface Message {\n  _id: string;\n  roomId: string;\n  senderId: string;     // userId of the sender\n  type: \"text\" | \"image\" | \"video\" | \"audio\" | \"document\" | \"link\";\n  text?: string;        // present when type === \"text\"\n  url?: string;         // present for media types\n  fileName?: string;    // present when type === \"document\"\n  fileSize?: number;    // bytes\n  replyTo?: string;     // parent message _id in a thread\n  reactions?: Reaction[];\n  isDeleted?: boolean;\n  createdAt: string;    // ISO 8601 timestamp\n  editedAt?: string;\n}"
      ),

      h2("Reaction"),
      codeBlock("typescript",
        "interface Reaction {\n  emoji: string;       // e.g. \"👍\"\n  userIds: string[];   // who reacted\n  count: number;\n}"
      ),

      h2("CustomClasses"),
      codeBlock("typescript",
        "interface CustomClasses {\n  chat?: string;\n  room?: string;\n  window?: string;\n  messageList?: string;\n  chatInput?: string;\n  inputEl?: string;\n  roomList?: string;\n  roomItem?: string;\n}"
      ),

      h2("CreateDirectRoomInput"),
      codeBlock("typescript",
        "interface CreateDirectRoomInput {\n  targetUserId: string; // the other user's userId\n}"
      ),

      h2("CreateGroupRoomInput"),
      codeBlock("typescript",
        "interface CreateGroupRoomInput {\n  name: string;\n  memberIds: string[]; // userIds to add (excluding yourself)\n}"
      ),

      h2("SendMessageInput"),
      codeBlock("typescript",
        "interface SendMessageInput {\n  roomId: string;\n  text?: string;\n  type?: \"text\" | \"image\" | \"video\" | \"audio\" | \"document\" | \"link\";\n  url?: string;       // required for media types\n  fileName?: string;  // for documents\n  fileSize?: number;\n  replyTo?: string;   // _id of message being replied to\n}"
      ),
    ),
  },
];

// ─── Seed all docs ────────────────────────────────────────────────────────────

async function seedDocs() {
  try {
    console.log("\n🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("   ✅ Connected\n");

    // ── Platform docs ──────────────────────────────────────────────────────────
    console.log("📖  Seeding platform docs  [project-hermes]");
    console.log("─".repeat(50));
    await Doc.deleteMany({ category: "project-hermes" });
    for (const docData of platformDocs) {
      await Doc.create({ ...docData, lastUpdated: new Date(), status: "published" });
      console.log(`   ✅  ${docData.title}`);
    }

    // ── SDK docs ───────────────────────────────────────────────────────────────
    console.log("\n📦  Seeding SDK docs  [hermes-chat-react]");
    console.log("─".repeat(50));
    await Doc.deleteMany({ category: "hermes-chat-react" });
    for (const docData of sdkDocs) {
      await Doc.create({ ...docData, lastUpdated: new Date(), status: "published" });
      console.log(`   ✅  ${docData.title}`);
    }

    const total = platformDocs.length + sdkDocs.length;
    console.log("\n" + "═".repeat(50));
    console.log(`🎉  Done! ${total} documents seeded to MongoDB.`);
    console.log("═".repeat(50) + "\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding docs:", error);
    process.exit(1);
  }
}

seedDocs();
