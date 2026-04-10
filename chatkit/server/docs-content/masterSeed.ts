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
  // ─── INTRODUCTION ────────────────────────────────────────────────────────
  {
    title: "What is Hermes?",
    slug: "what-is-hermes",
    category: "1. Introduction",
    order: 10,
    content: doc(
      h1("What is Hermes?"),
      p(t("Hermes is a powerful, self-hosted real-time messaging engine and React SDK that lets developers add rich chat, notifications, and live collaboration features to any application in minutes.")),
      p(t("Building a scalable chat backend from scratch means dealing with WebSockets, message persistence, presence tracking, thread management, and complex state synchronization. Hermes provides a production-ready solution that handles all of this infrastructure, leaving you to focus entirely on your core product.")),

      h2("What can you build?"),
      ul(
        [bold("In-app chat"), t(" — Seamless 1-on-1 or group messaging")],
        [bold("Customer support"), t(" — Live chat channels between agents and customers")],
        [bold("Collaborative spaces"), t(" — Real-time event broadcasting and shared state")],
        [bold("Live feeds"), t(" — Fleeting comments, emoji reactions, and read receipts")],
      ),

      h2("Architectural Tenets"),
      p(t("Hermes is built strictly around three components:")),
      ol(
        [bold("The Node.js Engine"), t(" — A scalable Socket.io + MongoDB backend. You own your data. Messages never hit third-party servers. Deploy the engine to Vercel, AWS, or Heroku, and point your frontend to it.")],
        [bold("The React SDK"), t(" (hermes-chat-react) — A beautifully designed, highly optimized context-provider architecture for React and Next.js applications.")],
        [bold("Admin Dashboard"), t(" — A unified UI to manage global API keys, trace project limits, and enforce authentication credentials.")],
      ),
      p(t("Let's dive into setting up your workspace and connecting your first client."))
    )
  },
  {
    title: "Core Architecture",
    slug: "core-architecture",
    category: "1. Introduction",
    order: 11,
    content: doc(
      h1("Core Architecture"),
      p(t("Hermes separates the transport layer (WebSockets and event ingestion) from the visual rendering pipeline (React context and virtualized lists). Unpacking this architecture will help you customize the behavior to your exact needs.")),
      
      h2("1. The Data Flow"),
      p(t("Everything revolves around the "), code("HermesClient"), t(" singleton. It acts as an orchestrator.")),
      codeBlock("tsx",
        "const client = new HermesClient({\n  endpoint: \"api.your-deployed-server.com\",\n  apiKey: \"proj_abc123\",\n  userId: \"uuid-999\"\n});"
      ),
      p(t("When connected, the client establishes an upgradeable WebSocket handshake. It binds core routing listeners ("), code("message:receive"), t(", "), code("user:online"), t(") and normalizes the incoming binary payloads into strictly typed structured events.")),

      h2("2. Context Provision"),
      p(t("React needs a way to reactively bind to these Socket events. The SDK accomplishes this via specific Context Providers:")),
      ul(
        [code("<Chat>"), t(" — Mounts near the top of your React tree. Exposes "), code("client"), t(" and the authenticated user.")],
        [code("<Room>"), t(" — The conversation orchestrator! This component does "), bold("no DOM rendering"), t(". It solely acts as a declarative WebSocket subscriber. Mount "), code("<Room roomId={id}>"), t(", and the client quietly joins that channel, pulls history, flags seen receipts, and routes typing indicators.")],
      ),
      
      h2("3. Dumb View Components"),
      p(t("Because "), code("<Room>"), t(" manages state, your UI layers become purely visual:")),
      codeBlock("tsx",
        "// <MessageList> simply reaches up to the nearest <Room> context \n// and renders the messages injected by the WebSocket engine.\n<Room roomId=\"123\">\n  <MessageList />\n</Room>"
      )
    )
  },

  // ─── QUICK SETUP ────────────────────────────────────────────────────────
  {
    title: "Installation & Setup",
    slug: "installation-setup",
    category: "2. Quick Setup",
    order: 20,
    content: doc(
      h1("Installation & Setup"),
      p(t("Get up and running with Hermes in a React or Next.js environment. Hermes requires React 17 or higher.")),

      h2("1. Install the SDK package"),
      codeBlock("bash", "npm install hermes-chat-react\n# or\nyarn add hermes-chat-react\n# or\npnpm add hermes-chat-react"),
      
      h2("2. Required stylesheet"),
      p(t("To take advantage of out-of-the-box layout properties, include the CSS file in your application root (e.g. "), code("App.tsx"), t(" or "), code("main.tsx"), t("). You can completely override this later.")),
      codeBlock("tsx",
        "import \"hermes-chat-react/dist/index.css\";"
      ),

      h2("3. Generating Credentials"),
      p(t("Hermes uses a secure API perimeter. To connect a frontend application:")),
      ul(
        [t("Launch your self-hosted Admin Panel")],
        [t("Click \"Create Project\" and grant it a recognizable name.")],
        [t("Copy the generated "), code("API Key"), t(" and "), code("Secret"), t(". Guard your secret—it has admin mutation privileges on your chat backend.")],
      ),
      
      h2("4. Testing the Connection"),
      codeBlock("tsx",
        "import { useState, useEffect } from \"react\";\nimport { HermesClient, Chat } from \"hermes-chat-react/react\";\n\nconst App = () => {\n  const [client, setClient] = useState<HermesClient | null>(null);\n\n  useEffect(() => {\n    const c = new HermesClient({\n      endpoint: \"http://localhost:8080\", // Your backend server\n      apiKey: \"YOUR_KEY\",\n      secret: \"YOUR_SECRET\",\n      userId: \"test_user_01\", // Mock identity\n      displayName: \"Alice\"\n    });\n    \n    c.connect().then(() => setClient(c));\n  }, []);\n\n  if (!client) return <div>Connecting to Hermes engine...</div>;\n\n  return (\n    <Chat client={client}>\n      ✅ We are connected and authenticated!\n    </Chat>\n  );\n};"
      )
    )
  },
  {
    title: "10-Minute Chat App Guide",
    slug: "10-minute-chat-app",
    category: "2. Quick Setup",
    order: 21,
    content: doc(
      h1("Build a Chat App in 10 Minutes"),
      p(t("In this tutorial, we will build a fully functioning Chat Interface that looks and feels like Discord. We cover user impersonation, room selection, the unified window layer, and sending messages.")),

      h2("Step 1: The App Shell"),
      p(t("Wrap our layout in the "), code("<Chat>"), t(" provider. We will force a layout that prevents browser scrolling to ensure the chat window occupies the full viewport.")),
      codeBlock("tsx",
        "import React, { useState, useEffect } from \"react\";\nimport { \n  HermesClient, Chat, RoomList, Room, Window, MessageList, ChatInput \n} from \"hermes-chat-react/react\";\nimport \"hermes-chat-react/dist/index.css\";\n\nexport const DesktopChatLayout = () => {\n  const [client, setClient] = useState(null);\n  const [activeRoomId, setActiveRoomId] = useState(null);\n\n  useEffect(() => {\n    const initialize = async () => {\n      const c = new HermesClient({\n        endpoint: \"https://hermes-engine.example.com\",\n        apiKey: \"pk_test_123\",\n        secret: \"sk_secret_123\",\n        userId: \"user-1002\",\n        displayName: \"Charlie\"\n      });\n      await c.connect();\n      setClient(c);\n    };\n    initialize();\n  }, []);\n\n  if (!client) return <div className=\"animate-pulse text-center mt-20\">Loading Discord Clone...</div>;\n\n  return (\n    <Chat client={client} theme=\"dark\" customClasses={{ chat: \"h-screen w-screen flex overflow-hidden\" }}>\n      {/* Step 2 will go here */}\n    </Chat>\n  );\n};"
      ),

      h2("Step 2: The Navigation Sidebar"),
      p(t("Inject a dark, collapsible styling block for the list of rooms the user belongs to.")),
      codeBlock("tsx",
        "// Inserted as a child of <Chat>\n<div className=\"w-[320px] bg-gray-900 border-r border-gray-800 flex flex-col\">\n  <div className=\"p-5 font-bold text-gray-100 shadow-md z-10\">\n    Channels\n  </div>\n  <div className=\"flex-1 overflow-y-auto\">\n    <RoomList\n      onSelectRoom={(room) => setActiveRoomId(room._id)}\n      renderRoomItem={(room, isActive) => (\n        <div className={`p-3 mx-2 my-1 rounded-md cursor-pointer ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>\n          # {room.name || 'Direct Message'}\n        </div>\n      )}\n    />\n  </div>\n</div>"
      ),
      p(t("Using "), code("renderRoomItem"), t(" let us override the exact visual appearance of an unread or active room while letting the SDK handle real-time activity and unread counting.")),

      h2("Step 3: The Conversation Engine"),
      p(t("Now to build the main feed. If an ID is selected, wrap the area constraint in a "), code("<Room>"), t(" provider. We use the "), code("<Window>"), t(" component to force Flexbox boundaries. Flow dictates that the message list pushes the chat input to the absolute bottom naturally.")),
      codeBlock("tsx",
        "// Inserted next to the Sidebar Div\n<div className=\"flex-1 bg-[#36393f] flex\">\n  {activeRoomId ? (\n    <Room roomId={activeRoomId}>\n      <Window className=\"flex flex-col w-full h-full\">\n\n        {/* Channel Header Header */}\n        <div className=\"h-14 border-b border-gray-900 flex items-center px-4 font-bold tracking-wide text-gray-100 shrink-0 shadow-sm\">\n           Live Conversation\n        </div>\n\n        {/* Virtualized Message Scroll */}\n        <MessageList className=\"flex-1 overflow-y-auto\" />\n\n        {/* Composer Layer */}\n        <div className=\"p-4 shrink-0 bg-transparent\">\n          <ChatInput \n             inputClassName=\"w-full bg-[#40444b] text-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-1 ring-indigo-500\"\n             placeholder=\"Message channel...\"\n          />\n        </div>\n\n      </Window>\n    </Room>\n  ) : (\n    <div className=\"m-auto text-gray-500 font-medium\">\n       Select a channel on the left to begin.\n    </div>\n  )}\n</div>"
      ),
      
      h2("Conclusion"),
      p(t("Done! That is literally the entire codebase needed to provide auto-pagination, real-time message broadcasting, typing indicator synchronization, inline error boundaries, and socket reconnect logic constraints."))
    )
  },

  // ─── REACT HOOKS ────────────────────────────────────────────────────────
  {
    title: "1. Core Context Hooks",
    slug: "hooks-core-context",
    category: "3. React Hooks",
    order: 30,
    content: doc(
      h1("Core Context Hooks"),
      p(t("The Hermes SDK relies on multiple layered React contexts to ensure specific subtrees only re-render when granular target data is mutated.")),

      h2("useChatContext()"),
      p(t("Exposes global variables. It is the topmost pipeline and updates infrequently. Must be inside "), code("<Chat>"), t(".")),
      codeBlock("tsx",
        "import { useChatContext } from \"hermes-chat-react/react\";\n\nconst SettingsButton = () => {\n  const { client, currentUser, theme } = useChatContext();\n\n  return (\n    <button>\n       Signed in as {currentUser?.displayName} (Status: {client.isConnected ? 'OK' : 'FAIL'})\n    </button>\n  );\n};"
      ),

      h2("useRoomStateContext()"),
      p(t("A reactive slice pointing strictly to the current active room state. This hook re-renders when a message arrives, someone types, or thread states alter. Must be inside "), code("<Room>"), t(".")),
      codeBlock("tsx",
        "import { useRoomStateContext } from \"hermes-chat-react/react\";\n\nconst RoomMonitor = () => {\n  const { room, messages, loading, loadingMore, hasMore } = useRoomStateContext();\n\n  if (loading) return <span>Mounting WebSocket subscriptions...</span>;\n\n  return <span>{messages.length} messages received so far in {room.name}.</span>;\n};"
      ),
      p(bold("Properties Exported:")),
      ul(
        [code("room: Room"), t(" — The MongoDB hydrated model of this channel")],
        [code("messages: Message[]"), t(" — The sorted, cached subset sequence")],
        [code("thread: Message | null"), t(" — Which message is currently scoped into the thread sidebar UI.")],
      ),

      h2("useRoomActionContext()"),
      p(t("A lightweight wrapper for invoking remote procedural methods against the Room. Because "), code("useRoomActionContext()"), t(" pointers do not rapidly alter, invoking it causes far fewer React re-renders than attaching to "), code("useRoomStateContext()"), t(".")),
      codeBlock("tsx",
        "import { useRoomActionContext } from \"hermes-chat-react/react\";\n\nconst CustomPanicButton = () => {\n  const { deleteMessage, loadMore } = useRoomActionContext();\n\n  return <button onClick={() => deleteMessage(\"msg_bad123\")}>Delete Message</button>;\n};"
      )
    )
  },
  {
    title: "2. Data Retrieval Hooks",
    slug: "hooks-data-retrieval",
    category: "3. React Hooks",
    order: 31,
    content: doc(
      h1("Data Retrieval Hooks"),
      p(t("For developers building a highly bespoke interface (headless mode) without relying on Context. You can extract the logic controllers entirely independently by passing the Client directly! The Context Providers literally wrap these exact hooks.")),

      h2("useRooms(client)"),
      p(t("Subscribes globally to room updates.")),
      codeBlock("tsx",
        "import { useRooms } from \"hermes-chat-react/react\";\n\nconst Dashboard = ({ client }) => {\n  const { rooms, loading, error, createDirect, deleteRoom } = useRooms(client);\n\n  const startChat = async () => {\n     await createDirect({ targetUserId: \"other-guy-uuid\" });\n  };\n\n  return <ul>{rooms.map(r => <li key={r._id}>{r.name}</li>)}</ul>;\n};"
      ),

      h2("useMessages(client, roomId)"),
      p(t("The atomic message processor. It tracks presence, reactions, edits, deletes natively.")),
      codeBlock("tsx",
        "import { useMessages } from \"hermes-chat-react/react\";\n\nconst RawFeed = ({ client, roomId }) => {\n  const { \n    messages, \n    typingUsers, \n    sendMessage, \n    addReaction \n  } = useMessages(client, roomId);\n\n  if (typingUsers.length > 0) {\n     console.log(\"Someone is typing!\", typingUsers);\n  }\n\n  return <div>Messages: {messages.length}</div>;\n};"
      ),

      h2("useUpload(client)"),
      p(t("Abstracts the binary handling and chunking parameters for File objects uploading to Hermes Engine.")),
      codeBlock("tsx",
        "import { useUpload } from \"hermes-chat-react/react\";\n\nconst Uploader = ({ roomId }) => {\n  const { sendFile, uploading } = useUpload(client);\n\n  const handleMount = async (nativeEvent) => {\n     const f = nativeEvent.target.files[0];\n     await sendFile(roomId, f);\n  };\n\n  return <input type=\"file\" onChange={handleMount} disabled={uploading} />;\n};"
      )
    )
  },

  // ─── COMPONENTS ────────────────────────────────────────────────────────
  {
    title: "<RoomList> Component",
    slug: "component-roomlist",
    category: "4. UI Components",
    order: 40,
    content: doc(
      h1("<RoomList> Component"),
      p(t("The "), code("<RoomList>"), t(" component handles parsing and visualizing channel arrays automatically.")),
      
      h2("Props Interface"),
      codeBlock("typescript",
        "interface RoomListProps {\n  /** Optional. If missing, pulls rooms[] from context */\n  rooms?: Room[];\n  /** Required callback when user taps a room */\n  onSelectRoom: (room: Room) => void;\n  /** Completely override rendering algorithm of individual items */\n  renderRoomItem?: (room: Room, isActive: boolean) => React.ReactNode;\n  /** Loading node override */\n  renderLoading?: () => React.ReactNode;\n}"
      ),

      h2("Built-In Empty State Handlers"),
      p(t("If "), code("rooms") , t(" evaluates to empty arrays, an internal SVG block explicitly alerts the user to start a conversation. You can map behavior directly onto its DOM using Context Overrides described in the Advanced chapter.")),

      h2("Handling Multiple Interfaces"),
      p(t("Since "), code("RoomList"), t(" inherits generic types, you could instantiate two instances pointing to distinct filters if you are managing them headlessly!")),
      codeBlock("tsx",
        "import { RoomList } from \"hermes-chat-react/react\";\n\nconst DualPanels = ({ directRooms, groupRooms }) => (\n  <div>\n    <h3>Direct Messages</h3>    \n    <RoomList rooms={directRooms} onSelectRoom={selectBehavior} />\n\n    <h3>Team Groups</h3>\n    <RoomList rooms={groupRooms} onSelectRoom={selectBehavior} />\n  </div>\n);"
      )
    )
  },
  {
    title: "<MessageList> Component",
    slug: "component-messagelist",
    category: "4. UI Components",
    order: 41,
    content: doc(
      h1("<MessageList> Component"),
      p(t("The most complex component in Hermes. The MessageList automates virtualization, conditional render grouping, date demarcation, timestamp formatting, and inline reply hierarchies.")),

      h2("Algorithmic GroupStyle Aggregation"),
      p(t("A prominent problem in Chat interfaces is handling back-to-back sequential messages emitted by the identical author inside a few minutes. MessageList parses incoming array histories automatically into a "), code("groupStyle"), t(" index ("), code("'top' | 'middle' | 'bottom' | 'single'"), t("), assigning bubble tails properly along CSS vectors.")),

      h2("Implementation Constraints"),
      p(t("The message view MUST be assigned an explicit constraint in CSS height, or it must be rendered inside a bounded Flex. Without a bounding wrapper, AutoScroll computations will collapse and crash infinite-scroll DOM math.")),
      codeBlock("tsx",
        "// GOOD\n<div className=\"flex-1 overflow-y-auto\" style={{ height: '500px' }}>\n  <MessageList />\n</div>\n\n// BAD (causes page-level layout shifting)\n<div>\n  <MessageList />\n</div>"
      ),

      h2("Date Separators"),
      p(t("Because humans intuitively demarcate conversation by cycles, "), code("<MessageList>"), t(" mounts "), code("<DateSeparator>"), t(" dividers. You can disable this by assigning "), code("disableDateSeparator={true}"), t("."))
    )
  },
  {
    title: "<ChatInput> Component",
    slug: "component-chatinput",
    category: "4. UI Components",
    order: 42,
    content: doc(
      h1("<ChatInput> Component"),
      p(t("An interactive Textarea-based composer component equipped with debounced typing indicators.")),

      h2("Typing Indicators"),
      p(t("Every keystroke triggers a heuristic delay algorithm (debounced by ~2 seconds). If the user changes variables, Hermes emits a "), code("typing:started"), t(" socket layer dispatch to siblings, showing up as typing feedback to clients online. The SDK halts and issues "), code("typing:stopped"), t(" gracefully when blurred or after long delays.")),

      h2("Styling The TextArea directly"),
      p(t("Use "), code("inputClassName"), t(" to style the inner target container. Use "), code("className"), t(" for the enclosing flex perimeter.")),
      codeBlock("tsx",
        "import { ChatInput } from \"hermes-chat-react/react\";\n\n<ChatInput \n  className=\"border-t border-gray-400 bg-white p-2\" \n  inputClassName=\"w-full resize-none font-sans text-sm rounded bg-gray-100 p-2\" \n  placeholder=\"Type a super important message...\"\n/>"
      )
    )
  },

  // ─── ADVANCED ────────────────────────────────────────────────────────
  {
    title: "Overriding Defaults (Inversion of Control)",
    slug: "advanced-components",
    category: "5. Advanced & Overrides",
    order: 50,
    content: doc(
      h1("Contextual Inversion of Control"),
      p(t("Hermes exports a completely isolated module called the "), code("ComponentContext"), t(". This prevents you from constantly prop-drilling renderers across dozens of sub-components and threads.")),
      
      h2("The Global Provider Approach"),
      p(t("If you dislike how Hermes defaults render the Date Dividers, or if you despise the default Loader SVG, rewrite them globally.")),
      codeBlock("tsx",
        "import { ComponentProvider, Chat, MessageList } from \"hermes-chat-react/react\";\n\n// 1. Write an alternative React element\nconst MyCoolLoader = () => <div className=\"spinner\">Please hold!...</div>;\n\n// 2. Wrap via Provider across your layout\nconst Layout = ({ client }) => (\n  <Chat client={client}>\n    <ComponentProvider value={{ LoadingIndicator: MyCoolLoader }}>\n        {/* Anywhere SDK fetches data, MyCoolLoader acts as the view */}\n        <MessageList /> \n    </ComponentProvider>\n  </Chat>\n);"
      ),
      p(t("What you can override via ComponentProvider:")),
      ul(
        [code("Message"), t(" - Entire singular message row")],
        [code("LoadingIndicator"), t(" - Default spinner state")],
        [code("EmptyStateIndicator"), t(" - Ghost SVG mapping missing data")],
        [code("DateSeparator"), t(" - Label across feed days")],
        [code("TypingIndicator"), t(" - Floating dot syntax at feed floor")]
      )
    )
  },
  {
    title: "Server Customization",
    slug: "advanced-server",
    category: "5. Advanced & Overrides",
    order: 51,
    content: doc(
      h1("Modifying the Hermes Server"),
      p(t("Because Hermes Engine runs entirely inside Node.js, rewriting schemas or adding authentication logic parameters is as simple as overriding a route handler.")),

      h2("Intercepting Metadata"),
      p(t("By default, the SDK transmits string definitions. You can alter the Hermes User Schema in "), code("src/models/User.ts"), t(" to accept additional properties (Title, Organization, etc.) and transmit them globally across presence vectors.")),

      h2("File Size Caps"),
      p(t("The Hermes Server leverages Express Multer to capture binaries. Navigate to "), code("server/src/routes/hermes/uploadRoute.ts"), t(" to lock restrictions or redirect binaries away from standard buffer allocation towards AWS S3 or GCP.")),
      codeBlock("typescript",
        "// Example multer modification for AWS S3 direct stream\nimport multerS3 from \"multer-s3\";\n\nconst upload = multer({\n  storage: multerS3({\n    s3: s3Config,\n    bucket: 'my-hermes-chat-attachments',\n    key: function (req, file, cb) {\n      cb(null, Date.now().toString())\n    }\n  })\n});"
      )
    )
  }
];

// ─── Seed all docs ────────────────────────────────────────────────────────────
async function seedExternalDocs() {
  try {
    console.log("\\n🔌 Connecting to MongoDB for Extended Population...");
    await mongoose.connect(MONGO_URI);
    console.log("   ✅ Connected\\n");

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

    console.log("\\n" + "═".repeat(50));
    console.log(`🎉  Done! ${allDocs.length} ultra-detailed documents seeded.`);
    console.log("═".repeat(50) + "\\n");
    process.exit(0);
  } catch (error) {
    console.error("\\n❌ Error seeding docs:", error);
    process.exit(1);
  }
}

seedExternalDocs();
