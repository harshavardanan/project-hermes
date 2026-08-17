import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface DemoMessage {
  id: number;
  from: "them" | "me";
  name: string;
  text: string;
}

const SCRIPT: Omit<DemoMessage, "id">[] = [
  { from: "them", name: "Ava", text: "is the socket stable on reconnect?" },
  { from: "me", name: "You", text: "yeah, auto reconnect + backoff built in" },
  { from: "them", name: "Ava", text: "and presence updates live too?" },
  { from: "me", name: "You", text: "typing + online status, both real-time" },
  { from: "them", name: "Ava", text: "shipping this today 🔥" },
];

const TYPING_MS = 1100;
const GAP_MS = 650;

function initials(name: string) {
  return name.slice(0, 1).toUpperCase();
}

export default function LiveChatDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const runStep = (i: number) => {
      if (cancelled) return;
      const step = SCRIPT[i % SCRIPT.length];
      const isLast = i % SCRIPT.length === SCRIPT.length - 1;

      if (step.from === "them") setTyping(step.name);

      timer = setTimeout(
        () => {
          if (cancelled) return;
          setTyping(null);
          idRef.current += 1;
          setMessages((prev) => [...prev, { id: idRef.current, ...step }]);
          if (!isLast) {
            timer = setTimeout(() => runStep(i + 1), GAP_MS);
          }
        },
        step.from === "them" ? TYPING_MS : 250,
      );
    };

    runStep(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -inset-6 bg-accent/20 blur-[70px] rounded-full -z-10" />

      <div className="rounded-2xl border border-brand-border bg-brand-card/90 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          </div>
          <div className="text-[11px] font-semibold text-brand-muted tracking-tight">
            # engineering
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
            </span>
            Live
          </div>
        </div>

        {/* Messages */}
        <div className="h-[280px] px-4 py-4 flex flex-col justify-end gap-3 overflow-hidden">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`flex items-end gap-2 ${
                  m.from === "me" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    m.from === "me"
                      ? "bg-accent text-accent-fg"
                      : "bg-white/10 text-brand-text"
                  }`}
                >
                  {initials(m.name)}
                </div>
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug font-medium ${
                    m.from === "me"
                      ? "bg-accent text-accent-fg rounded-br-sm"
                      : "bg-white/[0.06] text-brand-text rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-end gap-2"
              >
                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/10 text-brand-text">
                  {initials(typing)}
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-white/[0.06] px-3.5 py-2.5 flex items-center gap-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-brand-muted animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
