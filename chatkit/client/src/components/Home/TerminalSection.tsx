import { motion } from "motion/react";
import { Terminal, type TerminalStep } from "../ui/Terminal";

const SCRIPT: TerminalStep[] = [
  { type: "command", text: "npm install hermes-chat-react" },
  { type: "output", text: "added 1 package in 1s" },
  { type: "output", text: "npm notice hermes-chat@2.4.1 installed" },
  { type: "blank", text: "" },
  { type: "command", text: "npx hermes-config init" },
  { type: "output", text: "✔  Added Config" },
  { type: "output", text: "✔ Connected to Hermes Engine" },
  { type: "output", text: "✔ SDK ready. Happy building!" },
  { type: "blank", text: "" },
];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: "easeOut" },
};

export default function TerminalSection() {
  return (
    <section className="w-full max-w-[1280px] px-6 md:px-10 py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left — copy */}
        <motion.div {...fadeUp}>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-5 bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #ffffff 20%, #8a8a90 100%)",
            }}
          >
            Up and running in minutes.
          </h2>
          <p className="text-brand-muted text-lg leading-relaxed mb-8 max-w-md">
            Install the SDK, initialise your project, and you're live. Real-time
            messaging, rooms, presence, all baked in.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "One-line install via npm",
              "Zero config WebSocket setup",
              "Preparing connection to Hermes mothership",
              "Initializing distributed WebSocket broker",
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
        </motion.div>

        {/* Right — animated terminal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <Terminal
            script={SCRIPT}
            prompt="~/hermes $ "
            typingSpeed={80}
            pauseAfterCommand={400}
            delayBetweenCommands={800}
            loop={false}
            loopDelay={3000}
          />
        </motion.div>
      </div>
    </section>
  );
}
