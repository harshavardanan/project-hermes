import { Terminal, type TerminalStep } from "../ui/Terminal"; // <-- Updated import

const SCRIPT: TerminalStep[] = [
  // <-- Updated Type
  { type: "command", text: "npm install hermes-chat-react" },
  { type: "output", text: "added 1 package in 1s" },
  { type: "output", text: "npm notice hermes-chat@2.4.1 installed" },
  { type: "blank", text: "" },
  { type: "command", text: "npx hermes-config init" },
  { type: "output", text: "✔  Added Config" },
  { type: "output", text: "✔ Connected to Hermes Engine" },
  { type: "output", text: "✔ SDK ready — happy building!" },
  { type: "blank", text: "" },
];

export default function TerminalSection() {
  return (
    <section className="w-full max-w-[1280px] px-6 md:px-10 py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left — copy */}
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-5">
            Quick Start
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.1] mb-5">
            Up and running <span className="text-white/60">in minutes.</span>
          </h2>
          <p className="text-brand-muted text-lg leading-relaxed mb-8 max-w-md">
            Install the SDK, initialise your project, and you're live. Real-time
            messaging, rooms, presence — all baked in.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "One-line install via npm",
              "Zero config WebSocket setup",
              "React hooks for every feature",
              "Edge-deployed in 30+ regions",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 text-sm text-white/70 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right — animated terminal */}
        <Terminal
          script={SCRIPT}
          prompt="~/hermes $ "
          typingSpeed={60}
          pauseAfterCommand={400}
          delayBetweenCommands={800}
          loop={false}
          loopDelay={3000}
        />
      </div>
    </section>
  );
}
