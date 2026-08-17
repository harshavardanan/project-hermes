import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Check,
  Loader2,
  Wifi,
  Copy,
  Terminal as TerminalIcon,
  ChevronRight,
  Rocket,
  ShieldCheck,
  X,
} from "lucide-react";
import LiveChatDemo from "./LiveChatDemo";
import { Terminal, type TerminalStep } from "../ui/Terminal";

// ─── Fake cursor ────────────────────────────────────────────────────────────

function Cursor({
  x,
  y,
  clicking,
  hidden,
}: {
  x: number;
  y: number;
  clicking: boolean;
  hidden?: boolean;
}) {
  return (
    <motion.div
      className="absolute z-[200] pointer-events-none"
      animate={{ left: x, top: y, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
      style={{ marginLeft: -2, marginTop: -2 }}
    >
      <motion.div
        animate={clicking ? { scale: [1, 0.7, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 20 20"
          fill="none"
          className="drop-shadow-md"
        >
          <path
            d="M2 2L8 17L10.5 10.5L17 8L2 2Z"
            fill="white"
            stroke="black"
            strokeWidth="1.5"
          />
        </svg>
        {clicking && (
          <motion.span
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-500/20"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Typed text hook ────────────────────────────────────────────────────────

function useTypedText(text: string, active: boolean, speed = 40) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) return;
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [active, text, speed]);
  return out;
}

// ─── Target measuring ───────────────────────────────────────────────────────

type Targets = Record<string, { x: number; y: number }>;

function useTargetReporter(contentRef: React.RefObject<HTMLDivElement | null>) {
  const [targets, setTargets] = useState<Targets>({});
  const report = useCallback(
    (name: string, el: HTMLElement | null) => {
      if (!el || !contentRef.current) return;
      const c = contentRef.current.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const x = r.left - c.left + r.width / 2;
      const y = r.top - c.top + r.height / 2;
      setTargets((prev) => {
        if (
          prev[name] &&
          Math.abs(prev[name].x - x) < 1 &&
          Math.abs(prev[name].y - y) < 1
        ) {
          return prev;
        }
        return { ...prev, [name]: { x, y } };
      });
    },
    [contentRef],
  );
  return { targets, report };
}

// ─── Exact Real UI Replicas ──────────────────────────────────────────────────

function ProjectsScreen({
  report,
}: {
  report: (n: string, el: HTMLElement | null) => void;
}) {
  return (
    <div className="p-8 h-full flex flex-col bg-[#0B0B0F]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">
            Projects
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Manage your Hermes SDK projects and environments.
          </p>
        </div>
        <button
          ref={(el) => report("newProjectBtn", el)}
          className="bg-white text-black hover:bg-gray-200 shadow-lg font-bold transition-colors duration-300 py-3.5 px-6 rounded-lg flex items-center"
        >
          <Plus size={18} strokeWidth={2.5} className="mr-2" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="group block h-[220px]">
          <div className="bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl transition-all duration-300 h-full flex flex-col overflow-hidden relative border-none">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 group-hover:bg-blue-500 transition-colors duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />
            <div className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex flex-row items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-black/40 text-white/50 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors duration-300">
                    <TerminalIcon size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-blue-500 transition-colors">
                    support-widget
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white text-white/30 transition-all duration-300">
                  <ChevronRight
                    size={16}
                    strokeWidth={2}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </div>

              <div className="space-y-6 mt-auto">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    Project ID
                  </span>
                  <p className="text-xs text-white/60 font-mono bg-black/40 py-2.5 px-3 rounded-lg truncate">
                    proj_8a2f3c91e91c
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateProjectModal({
  subScreen,
  typed,
  loading,
  copied,
  report,
}: {
  subScreen: string;
  typed: string;
  loading: boolean;
  copied: boolean;
  report: (n: string, el: HTMLElement | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0B0B0F] border border-white/10 rounded-2xl w-full max-w-[480px] relative shadow-2xl m-4"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-t-2xl" />
        <button className="absolute top-5 right-5 text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
          <X size={20} />
        </button>

        <div className="p-8">
          {subScreen === "create" ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <Rocket size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Initialize Project
                </h2>
              </div>
              <p className="text-white/50 text-sm mb-8">
                Give your project a name to generate your secure edge network
                keys.
              </p>

              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Project Name
                </label>
                <div
                  ref={(el) => report("nameInput", el)}
                  className="w-full h-[52px] border border-white/10 rounded-xl px-3.5 bg-black/50 text-white flex items-center font-mono text-sm"
                >
                  {typed}
                  <span className="inline-block w-[2px] h-4 bg-blue-500 ml-0.5 animate-pulse" />
                </div>
              </div>

              <button
                ref={(el) => report("createBtn", el)}
                className="w-full bg-white text-black font-bold rounded-xl h-[52px] flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />{" "}
                    Provisioning...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Project Ready
                </h2>
              </div>
              <p className="text-emerald-400/80 text-sm mb-6 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                <strong>Important:</strong> Save these keys now. Your API secret
                will not be shown again.
              </p>

              <div className="bg-black border border-white/10 rounded-xl overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                  <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                    <TerminalIcon size={14} />
                    config.js
                  </div>
                  <button
                    ref={(el) => report("copyBtn", el)}
                    className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied ? (
                      <span className="text-emerald-400">Copied!</span>
                    ) : (
                      "Copy"
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-xs font-mono leading-relaxed text-blue-200">
                    <code>
                      <span className="text-purple-400">const</span>{" "}
                      hermesConfig = {"{"}
                      <br />
                      {"  "}projectId:{" "}
                      <span className="text-emerald-300">
                        "proj_9e8b2a1..."
                      </span>
                      ,<br />
                      {"  "}apiKey:{" "}
                      <span className="text-emerald-300">
                        "hk_live_9f2a7cd3e19b4f2a9d7c8e21b3f4c71b"
                      </span>
                      ,<br />
                      {"  "}apiSecret:{" "}
                      <span className="text-emerald-300">"sec_live_6x..."</span>
                      <br />
                      {"}"};
                    </code>
                  </pre>
                </div>
              </div>

              <button className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/5 font-bold rounded-xl h-[52px] transition-colors">
                I've saved my keys
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Terminal and Code Scenes ───────────────────────────────────────────────

const INSTALL_SCRIPT: TerminalStep[] = [
  { type: "command", text: "npm install hermes-chat-react" },
  { type: "output", text: "✔ installed hermes-chat-react@latest" },
];

const RUN_SCRIPT: TerminalStep[] = [
  { type: "command", text: "npm run dev" },
  { type: "output", text: "✨ Vite + React + TypeScript Compiled" },
  { type: "output", text: "➜  Local:   http://localhost:5173/" },
];

function TerminalScene({ script }: { script: TerminalStep[] }) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <Terminal
        script={script}
        prompt="~/my-chat-app $ "
        typingSpeed={70}
        pauseAfterCommand={300}
        delayBetweenCommands={400}
        loop={false}
        className="h-[380px] w-full shadow-none border-white/5"
      />
    </div>
  );
}

type CodeStage = "open" | "keys" | "connect" | "compose";

function CodeScene({
  stage,
  connecting,
  showList,
  showInput,
  report,
}: {
  stage: CodeStage;
  connecting: boolean;
  showList: boolean;
  showInput: boolean;
  report: (n: string, el: HTMLElement | null) => void;
}) {
  const showKey = stage !== "open";
  const showConnectLine = stage === "connect" || stage === "compose";
  const connected = stage === "compose";

  return (
    <div className="p-6 font-mono text-[12px] leading-[1.7] text-slate-300 whitespace-pre-wrap relative h-full bg-[#07070A]">
      <span className="text-slate-500 select-none">
        // 1. Initialize Runtime Client Core
      </span>
      {"\n"}
      {`import { HermesClient } from "hermes-chat-react";\n\nconst client = new HermesClient({\n  apiKey: "`}
      <span
        ref={(el) => report("pastePoint", el)}
        className="text-emerald-400 font-bold"
      >
        {showKey ? "hk_live_9f2a7cd3e19b4f2a9d7c8e21b3f4c71b" : ""}
      </span>
      {!showKey && (
        <span className="inline-block w-[2px] h-3.5 bg-purple-500 ml-0.5 animate-pulse align-middle" />
      )}
      {`",\n});\n\n`}

      <AnimatePresence>
        {showConnectLine && (
          <motion.div
            ref={(el) => report("connectLine", el as HTMLElement | null)}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 text-purple-400 h-5"
          >
            <span>await client.connect();</span>
            {connected && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded"
              >
                <Wifi size={10} strokeWidth={2.5} /> WebSocket Live
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {stage === "compose" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          <span className="text-slate-500 select-none">
            // 2. Compose Reactive Component UIconcern Layer
          </span>
          {"\n"}
          {`import { MessageList, ChatInput } from "hermes-chat-react/react";\n\nexport default function ChatView() {\n  return (\n    <div className="flex flex-col h-full">\n`}

          <div className="h-5 overflow-hidden">
            <AnimatePresence>
              {showList && (
                <motion.span
                  ref={(el) => report("listLine", el as HTMLElement | null)}
                  initial={{
                    opacity: 0,
                    y: 4,
                    backgroundColor: "rgba(139,92,246,0.2)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: "rgba(139,92,246,0)",
                  }}
                  className="block text-purple-300 font-medium pl-6"
                >
                  {"<MessageList />"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="h-5 overflow-hidden">
            <AnimatePresence>
              {showInput && (
                <motion.span
                  ref={(el) => report("inputLine", el as HTMLElement | null)}
                  initial={{
                    opacity: 0,
                    y: 4,
                    backgroundColor: "rgba(139,92,246,0.2)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: "rgba(139,92,246,0)",
                  }}
                  className="block text-purple-300 font-medium pl-6"
                >
                  {"<ChatInput />"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {`    </div>\n  );\n}`}
        </motion.div>
      )}

      <AnimatePresence>
        {connecting && (
          <motion.div
            key="streak"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute left-0 right-0 h-[2px] pointer-events-none"
            style={{
              top: 138,
              transformOrigin: "left",
              background:
                "linear-gradient(90deg, transparent, #8b5cf6, #34d399, transparent)",
              boxShadow: "0 0 16px 3px rgba(139,92,246,0.5)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Timeline / Control Block ───────────────────────────────────────────────

type Screen =
  | "title"
  | "dashboard"
  | "terminal-install"
  | "code"
  | "terminal-run"
  | "phone"
  | "outro";
type ScreenStep = {
  screen: Screen;
  subScreen?: "projects" | "create" | "key";
  caption: string;
  codeStage?: CodeStage;
  target?: string;
  click?: boolean;
  type?: boolean;
  hold: number;
  hideCursor?: boolean;
};

const START = { x: 80, y: 60 };

const TIMELINE: ScreenStep[] = [
  {
    screen: "title",
    caption: "Building live interactive application chat layers?",
    hideCursor: true,
    hold: 1400,
  },
  {
    screen: "dashboard",
    subScreen: "projects",
    caption: "Spin up isolated scopes on the Hermes Dashboard engine.",
    hold: 700,
  },
  {
    screen: "dashboard",
    subScreen: "projects",
    caption: "Initialize a new decoupled environment instance.",
    target: "newProjectBtn",
    click: true,
    hold: 600,
  },
  {
    screen: "dashboard",
    subScreen: "create",
    caption: "Provide your distinct app configuration footprint identifier.",
    target: "nameInput",
    click: true,
    hold: 200,
  },
  {
    screen: "dashboard",
    subScreen: "create",
    caption: "Provide your distinct app configuration footprint identifier.",
    target: "nameInput",
    type: true,
    hold: 1100,
  },
  {
    screen: "dashboard",
    subScreen: "create",
    caption:
      "Provision backend collections, state listeners, and network channels.",
    target: "createBtn",
    click: true,
    hold: 1200,
  },
  {
    screen: "dashboard",
    subScreen: "key",
    caption:
      "Extract your secure, client-isolated revocable live secret token.",
    hold: 500,
  },
  {
    screen: "dashboard",
    subScreen: "key",
    caption:
      "Extract your secure, client-isolated revocable live secret token.",
    target: "copyBtn",
    click: true,
    hold: 800,
  },
  {
    screen: "terminal-install",
    caption:
      "Pull down our lightweight, production-ready frontend React client SDK core package bundle.",
    hideCursor: true,
    hold: 2300,
  },
  {
    screen: "code",
    caption: "Open your React index container template layer script pipeline.",
    codeStage: "open",
    hold: 600,
  },
  {
    screen: "code",
    caption:
      "Feed the newly extracted client configuration credential key straight into the token buffer setup runtime.",
    codeStage: "keys",
    target: "pastePoint",
    click: true,
    hold: 900,
  },
  {
    screen: "code",
    caption:
      "Instantly start a non-blocking WebSocket pipeline frame connect interface directly over the network node.",
    codeStage: "connect",
    target: "connectLine",
    click: true,
    hold: 1400,
  },
  {
    screen: "code",
    caption:
      "Drop down zero-configuration atomic UI list nodes directly mapping real-time streams.",
    codeStage: "compose",
    target: "listLine",
    hold: 700,
  },
  {
    screen: "code",
    caption:
      "Drop down modular input composition concerns with local pipeline event bindings already wired up.",
    codeStage: "compose",
    target: "inputLine",
    hold: 900,
  },
  {
    screen: "terminal-run",
    caption:
      "Fire up your fast bundle compilation script listener engine environment setup wrapper.",
    hideCursor: true,
    hold: 2300,
  },
  {
    screen: "phone",
    caption:
      "Boom! Your standalone zero-backend reactive full feature set application chat widget module is fully live.",
    hideCursor: true,
    hold: 3200,
  },
  {
    screen: "outro",
    caption:
      "Engine composition over low-level infrastructure building blocks. That's the power of Hermes.",
    hideCursor: true,
    hold: 2400,
  },
];

export default function DemoWalkthrough() {
  const [i, setI] = useState(-1);
  const [clicking, setClicking] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const { targets, report } = useTargetReporter(contentRef);

  const step = i >= 0 && i < TIMELINE.length ? TIMELINE[i] : null;
  const nameTyped = useTypedText(
    "my-chat-app",
    step?.screen === "dashboard" && step.subScreen === "create" && !!step.type,
  );

  const createStepIdx = TIMELINE.findIndex(
    (s) => s.subScreen === "create" && s.click && !s.type,
  );
  const connectStepIdx = TIMELINE.findIndex(
    (s) => s.codeStage === "connect" && s.click,
  );
  const listStepIdx = TIMELINE.findIndex((s) => s.target === "listLine");
  const inputStepIdx = TIMELINE.findIndex((s) => s.target === "inputLine");

  const creating = i === createStepIdx && clicking;
  const connecting = i === connectStepIdx && clicking;
  const showList = i >= listStepIdx;
  const showInput = i >= inputStepIdx;

  useEffect(() => {
    if (i < 0 || i >= TIMELINE.length) return;
    const s = TIMELINE[i];
    let clickTimer: ReturnType<typeof setTimeout> | undefined;

    if (s.click) {
      clickTimer = setTimeout(() => {
        setClicking(true);
        if (s.subScreen === "key" && s.target === "copyBtn") {
          setCopied(true);
        }
      }, 450);
    }

    const advance = setTimeout(
      () => {
        setClicking(false);
        setI((v) => v + 1);
      },
      s.hold + (s.click ? 450 : 0),
    );

    return () => {
      clearTimeout(advance);
      if (clickTimer) clearTimeout(clickTimer);
    };
  }, [i]);

  const start = () => {
    setI(0);
    setClicking(false);
    setCopied(false);
  };

  const cursorPos = step?.target ? (targets[step.target] ?? START) : START;

  const fileLabel: Partial<Record<Screen, string>> = {
    dashboard: "console.hermes.com/projects",
    "terminal-install": "terminal (bash)",
    "terminal-run": "terminal (bash)",
    code: "src/components/ChatLayout.tsx",
    phone: "localhost:5173",
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-20 select-none">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
          Deploy Production Chat Features in One Minute
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Watch the cursor walk through how the Hermes UI stack handles
          everything out-of-the-box.
        </p>
      </div>

      <motion.div
        className="relative mx-auto rounded-2xl border border-white/[0.06] bg-[#09090D]/90 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden"
        style={{ maxWidth: 740, height: 500 }}
        viewport={{ once: true, amount: 0.3 }}
        onViewportEnter={() => {
          if (!startedRef.current) {
            startedRef.current = true;
            start();
          }
        }}
      >
        {/* Window Bar Chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.01]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
          </div>
          <span className="text-[10px] font-mono text-slate-500 tracking-wide">
            {step ? (fileLabel[step.screen] ?? "hermes.dev") : "hermes.dev"}
          </span>
          <div className="w-12" />
        </div>

        {/* Content Runtime Box Container */}
        <div
          ref={contentRef}
          className="relative overflow-hidden"
          style={{ height: 500 - 37 - 40 }}
        >
          <AnimatePresence mode="popLayout">
            {step?.screen === "title" && (
              <motion.div
                key="title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center bg-[#07070A]"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Composing Embedded Chat Layers?
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Walkthrough starting sequence...
                  </p>
                </div>
              </motion.div>
            )}

            {step?.screen === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                {/* The Dashboard background stays static for all 3 subScreens (projects, create, key) 
                  while the modal animates on top of it, perfectly matching the real UI UX 
                */}
                <div className="w-full h-full bg-[#0B0B0F] text-slate-200 flex flex-col font-sans select-none overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-[10px] font-black text-white">
                        H
                      </div>
                      <span className="text-xs font-bold tracking-tight text-white">
                        Hermes Dashboard
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-transparent to-purple-950/5">
                    <ProjectsScreen report={report} />
                    <AnimatePresence>
                      {(step.subScreen === "create" ||
                        step.subScreen === "key") && (
                        <CreateProjectModal
                          subScreen={step.subScreen}
                          typed={nameTyped}
                          loading={creating}
                          copied={copied}
                          report={report}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {step?.screen === "terminal-install" && (
              <motion.div
                key="term-inst"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-[#050508]"
              >
                <TerminalScene script={INSTALL_SCRIPT} />
              </motion.div>
            )}

            {step?.screen === "code" && (
              <motion.div
                key="code-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <CodeScene
                  stage={step.codeStage ?? "open"}
                  connecting={connecting}
                  showList={showList}
                  showInput={showInput}
                  report={report}
                />
              </motion.div>
            )}

            {step?.screen === "terminal-run" && (
              <motion.div
                key="term-run"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-[#050508]"
              >
                <TerminalScene script={RUN_SCRIPT} />
              </motion.div>
            )}

            {step?.screen === "phone" && (
              <motion.div
                key="phone-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-[#08080C] flex flex-col items-center justify-center p-4"
              >
                <div className="w-[380px] h-[340px] rounded-2xl border border-white/[0.08] bg-black/60 shadow-2xl relative overflow-hidden flex flex-col">
                  <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.04] text-[10px] font-mono text-slate-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                    localhost:5173
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <LiveChatDemo />
                  </div>
                </div>
              </motion.div>
            )}

            {step?.screen === "outro" && (
              <motion.div
                key="outro-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-2 bg-[#07070A]"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-purple-500/20">
                  H
                </div>
                <h4 className="text-md font-bold text-white tracking-tight mt-2">
                  Hermes Chat Framework React Core
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Composition layer build pipeline absolute runtime.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent Absolute Canvas Floating Cursor */}
          {step && (
            <Cursor
              x={cursorPos.x}
              y={cursorPos.y}
              clicking={clicking}
              hidden={step.hideCursor}
            />
          )}
        </div>

        {/* Dynamic Context Narrator Caption Bar Footer */}
        <div className="border-t border-white/[0.05] px-5 py-2.5 h-10 flex items-center bg-white/[0.01]">
          <AnimatePresence mode="wait">
            {step && (
              <motion.p
                key={step.caption}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="text-xs text-slate-400 font-medium flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-purple-500" />
                {step.caption}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {i >= TIMELINE.length && (
        <div className="flex justify-center mt-5">
          <button
            onClick={start}
            className="text-xs font-bold text-slate-500 hover:text-purple-400 font-mono tracking-wide transition-colors uppercase border border-white/[0.04] px-3 py-1.5 rounded-xl bg-white/[0.01]"
          >
            Replay Loop ↻
          </button>
        </div>
      )}
    </section>
  );
}
