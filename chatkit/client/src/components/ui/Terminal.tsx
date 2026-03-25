import { useEffect, useRef, useState } from "react";

// ── TYPES ──
export interface TerminalStep {
  type: "command" | "output" | "blank";
  text: string;
}

interface TerminalProps {
  script: TerminalStep[];
  prompt?: string;
  typingSpeed?: number;
  pauseAfterCommand?: number;
  delayBetweenCommands?: number;
  loop?: boolean;
  loopDelay?: number;
  className?: string;
}

// ── COMPONENT ──
export function Terminal({
  script,
  prompt = "$ ",
  typingSpeed = 60,
  pauseAfterCommand = 400,
  delayBetweenCommands = 800,
  loop = false,
  loopDelay = 3000,
  className = "",
}: TerminalProps) {
  const [history, setHistory] = useState<TerminalStep[]>([]);
  const [currentTyping, setCurrentTyping] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Blinking cursor effect
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, currentTyping]);

  // Main animation loop
  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function runStep() {
      // 1. Check if we reached the end of the script
      if (stepIndex >= script.length) {
        if (loop) {
          await sleep(loopDelay);
          if (cancelled) return;
          setHistory([]);
          setCurrentTyping("");
          setStepIndex(0);
        }
        return;
      }

      const step = script[stepIndex];

      // 2. Handle commands (typing effect)
      if (step.type === "command") {
        await sleep(delayBetweenCommands); // Wait before starting to type

        for (let i = 1; i <= step.text.length; i++) {
          if (cancelled) return;
          setCurrentTyping(step.text.slice(0, i));

          // Calculate typing speed with slight randomness for realism
          const msPerChar = 1000 / typingSpeed;
          await sleep(msPerChar + (Math.random() - 0.5) * (msPerChar * 0.5));
        }

        if (cancelled) return;
        await sleep(pauseAfterCommand); // Wait after typing completes
        setHistory((prev) => [...prev, step]); // Move to history
        setCurrentTyping(""); // Clear typing buffer
        setStepIndex((prev) => prev + 1);
      }
      // 3. Handle outputs & blanks (instant render)
      else {
        if (cancelled) return;
        setHistory((prev) => [...prev, step]);
        setStepIndex((prev) => prev + 1);
      }
    }

    runStep();

    return () => {
      cancelled = true;
    };
  }, [
    stepIndex,
    script,
    loop,
    loopDelay,
    delayBetweenCommands,
    pauseAfterCommand,
    typingSpeed,
  ]);

  return (
    <div
      className={`relative bg-brand-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[350px] ${className}`}
    >
      {/* Mac OS Window Header */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-white/[0.02] shrink-0">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d4a017]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#14ae2e]" />
        <span className="ml-auto text-[10px] font-mono text-white/20 tracking-wider select-none">
          bash — hermes-sdk
        </span>
      </div>

      {/* Terminal Body */}
      <div
        ref={containerRef}
        className="p-5 font-mono text-[13px] leading-relaxed overflow-y-auto flex-1 scrollbar-hide"
      >
        {/* Render History */}
        {history.map((line, i) => (
          <div key={i} className="flex min-h-[1.5rem]">
            {line.type === "command" && (
              <>
                <span className="text-brand-primary/50 shrink-0 select-none mr-2">
                  {prompt}
                </span>
                <span className="text-white font-medium">{line.text}</span>
              </>
            )}
            {line.type === "output" && (
              <span className="text-white/40">{line.text}</span>
            )}
            {line.type === "blank" && <span className="h-4" />}
          </div>
        ))}

        {/* Render Current Typing Line */}
        {stepIndex < script.length && script[stepIndex].type === "command" && (
          <div className="flex min-h-[1.5rem]">
            <span className="text-brand-primary/50 shrink-0 select-none mr-2">
              {prompt}
            </span>
            <span className="text-white font-medium">{currentTyping}</span>
            <span
              className="inline-block w-[7px] h-[14px] ml-[1px] rounded-[2px] self-center"
              style={{
                background: cursorVisible
                  ? "rgba(255,255,255,0.75)"
                  : "transparent",
                transition: "background 0.1s",
              }}
            />
          </div>
        )}

        {/* Render Idle Cursor when done */}
        {stepIndex >= script.length && (
          <div className="flex min-h-[1.5rem]">
            <span className="text-brand-primary/50 shrink-0 select-none mr-2">
              {prompt}
            </span>
            <span
              className="inline-block w-[7px] h-[14px] ml-[1px] rounded-[2px] self-center"
              style={{
                background: cursorVisible
                  ? "rgba(255,255,255,0.75)"
                  : "transparent",
                transition: "background 0.1s",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
