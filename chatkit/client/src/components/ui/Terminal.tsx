import { useEffect, useRef, useState } from "react";

interface RenderedLine {
  revealed: number;
  done: boolean;
}

export function Terminal({ className = "" }: { className?: string }) {
  const command = "npm i hermes-chat-react";
  const [row, setRow] = useState<RenderedLine>({ revealed: 0, done: false });
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const msPerChar = 1000 / 55;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    async function run() {
      await sleep(600);
      for (let j = 1; j <= command.length; j++) {
        if (cancelled) return;
        await sleep(msPerChar + (Math.random() - 0.5) * (msPerChar * 0.5));
        setRow({ revealed: j, done: false });
      }
      setRow({ revealed: command.length, done: true });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`relative bg-[#111113] rounded-2xl border border-white/[0.07] overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05] bg-white/[0.015]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d4a017]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#14ae2e]" />
        <span className="ml-auto text-[10px] font-mono text-white/15 tracking-wider select-none">
          zsh
        </span>
      </div>

      <div
        ref={containerRef}
        className="p-5 font-mono text-[13px] leading-relaxed"
      >
        <div className="flex">
          <span className="text-white/25 shrink-0 select-none">
            ~/hermes ${" "}
          </span>
          <span className="text-white font-medium">
            {command.slice(0, row.revealed)}
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
      </div>
    </div>
  );
}
