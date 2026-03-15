import { useEffect, useRef, useState } from "react";

export interface TerminalLine {
  type: "command" | "output" | "blank";
  text: string;
  /** Custom prompt — defaults to the prop-level prompt */
  prompt?: string;
}

export interface TerminalProps {
  /** Full script: commands (typed char-by-char) + their output (appears instantly) */
  script: TerminalLine[];
  prompt?: string;
  /** Characters per second for the typing animation (default: 55) */
  typingSpeed?: number;
  /** ms to pause after a command finishes before showing output (default: 350) */
  pauseAfterCommand?: number;
  /** ms to pause between a command block and the next prompt (default: 700) */
  delayBetweenCommands?: number;
  /** Loop the animation (default: true) */
  loop?: boolean;
  /** ms to wait before looping (default: 2500) */
  loopDelay?: number;
  className?: string;
}

interface RenderedLine {
  type: "command" | "output" | "blank";
  prompt?: string;
  /** For command lines — how many chars are revealed so far */
  revealed: number;
  fullText: string;
  done: boolean;
}

export function Terminal({
  script,
  prompt = "~/hermes $ ",
  typingSpeed = 55,
  pauseAfterCommand = 350,
  delayBetweenCommands = 700,
  loop = true,
  loopDelay = 2500,
  className = "",
}: TerminalProps) {
  const [rows, setRows] = useState<RenderedLine[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Blinking cursor independent of typing
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const msPerChar = 1000 / typingSpeed;

    function sleep(ms: number) {
      return new Promise<void>((r) => setTimeout(r, ms));
    }

    async function runScript() {
      // Reset
      setRows([]);
      await sleep(400);

      for (let i = 0; i < script.length; i++) {
        if (cancelled) return;
        const line = script[i];

        if (line.type === "blank") {
          setRows((prev) => [
            ...prev,
            { type: "blank", revealed: 0, fullText: "", done: true },
          ]);
          await sleep(120);
          continue;
        }

        if (line.type === "output") {
          setRows((prev) => [
            ...prev,
            {
              type: "output",
              revealed: line.text.length,
              fullText: line.text,
              done: true,
            },
          ]);
          await sleep(60);
          continue;
        }

        // type === "command" — type char by char
        const rowPrompt = line.prompt ?? prompt;
        // Push an empty command row first
        setRows((prev) => [
          ...prev,
          {
            type: "command",
            prompt: rowPrompt,
            revealed: 0,
            fullText: line.text,
            done: false,
          },
        ]);

        for (let j = 1; j <= line.text.length; j++) {
          if (cancelled) return;
          await sleep(msPerChar + (Math.random() - 0.5) * (msPerChar * 0.5));
          setRows((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.type === "command") {
              next[next.length - 1] = { ...last, revealed: j };
            }
            return next;
          });
        }

        // Mark command done (cursor moves to end, pauses)
        setRows((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last) next[next.length - 1] = { ...last, done: true };
          return next;
        });

        await sleep(pauseAfterCommand);
      }

      // Finished script
      if (loop) {
        await sleep(loopDelay);
        if (!cancelled) runScript();
      }
    }

    runScript();
    return () => {
      cancelled = true;
    };
  }, [script, prompt, typingSpeed, pauseAfterCommand, delayBetweenCommands, loop, loopDelay]);

  // Scroll container without scrollIntoView
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rows]);

  const isLastRow = (i: number) => i === rows.length - 1;

  return (
    <div
      className={`relative bg-[#111113] rounded-2xl border border-white/[0.07] overflow-hidden ${className}`}
    >
      {/* macOS chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05] bg-white/[0.015]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d4a017]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#14ae2e]" />
        <span className="ml-auto text-[10px] font-mono text-white/15 tracking-wider select-none">
          zsh
        </span>
      </div>

      {/* Body */}
      <div
        ref={containerRef}
        className="p-5 font-mono text-[13px] leading-relaxed max-h-72 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.07) transparent" }}
      >
        {rows.map((row, i) => {
          if (row.type === "blank") {
            return <div key={i} className="h-1.5" />;
          }

          if (row.type === "output") {
            const isSuccess =
              row.fullText.startsWith("✔") ||
              row.fullText.startsWith("added") ||
              row.fullText.startsWith("npm notice");
            const isWarn =
              row.fullText.startsWith("warn") || row.fullText.startsWith("⚠");
            const isErr =
              row.fullText.startsWith("✗") || row.fullText.startsWith("error");
            return (
              <div
                key={i}
                className={`pl-0 ${
                  isSuccess
                    ? "text-emerald-400"
                    : isWarn
                    ? "text-amber-400"
                    : isErr
                    ? "text-red-400"
                    : "text-white/40"
                }`}
              >
                {row.fullText}
              </div>
            );
          }

          // command row
          const typed = row.fullText.slice(0, row.revealed);
          const isActive = isLastRow(i) && !row.done;
          const isDoneAndLast = isLastRow(i) && row.done;

          return (
            <div key={i} className="flex">
              <span className="text-white/25 shrink-0 select-none">
                {row.prompt ?? prompt}
              </span>
              <span className="text-white font-medium">{typed}</span>
              {/* Cursor — blinking on the active (last) command row */}
              {(isActive || isDoneAndLast) && (
                <span
                  className="inline-block w-[7px] h-[14px] ml-[1px] rounded-[2px] self-center"
                  style={{
                    background: cursorVisible ? "rgba(255,255,255,0.75)" : "transparent",
                    transition: "background 0.1s",
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Idle cursor when script is done and not looping */}
        {rows.length === 0 && (
          <div className="flex items-center">
            <span className="text-white/25 select-none">{prompt}</span>
            <span
              className="inline-block w-[7px] h-[14px] ml-[1px] rounded-[2px]"
              style={{ background: cursorVisible ? "rgba(255,255,255,0.75)" : "transparent" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
