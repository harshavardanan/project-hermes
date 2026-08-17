import { useEffect, useState } from "react";
import { motion } from "motion/react";
import LiveChatDemo from "./LiveChatDemo";

const PEOPLE = [
  { name: "Ava", online: true },
  { name: "Sam", online: true },
  { name: "Rin", online: true },
  { name: "Kai", online: false },
  { name: "Mo", online: false },
];

function PresenceCard() {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/90 backdrop-blur-md shadow-2xl shadow-black/40 p-5 h-full flex flex-col">
      <div className="text-[11px] font-bold uppercase tracking-widest text-brand-muted mb-4">
        Presence
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {PEOPLE.map((p) => (
          <div key={p.name} className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-brand-text">
                {p.name[0]}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-brand-card ${
                  p.online ? "bg-emerald-400" : "bg-white/20"
                }`}
              />
            </div>
            <span className="text-[13px] font-medium text-brand-text/90">
              {p.name}
            </span>
            <span className="ml-auto text-[10px] text-brand-muted">
              {p.online ? "online" : "offline"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const EMOJIS = ["🔥", "👍", "🎉"];

function ReactionsCard() {
  const [counts, setCounts] = useState([3, 1, 0]);

  useEffect(() => {
    const id = setInterval(() => {
      setCounts((c) => {
        const next = [...c];
        const i = Math.floor(Math.random() * next.length);
        next[i] += 1;
        return next;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/90 backdrop-blur-md shadow-2xl shadow-black/40 p-5 h-full flex flex-col">
      <div className="text-[11px] font-bold uppercase tracking-widest text-brand-muted mb-4">
        Reactions
      </div>
      <div className="rounded-xl bg-white/[0.04] border border-white/5 px-3.5 py-2.5 text-[13px] text-brand-text/90 font-medium mb-3">
        shipping this today 🔥
      </div>
      <div className="flex gap-2">
        {EMOJIS.map((e, i) => (
          <motion.div
            key={e}
            layout
            className="flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-1 text-[12px]"
          >
            <span>{e}</span>
            <motion.span
              key={counts[i]}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-bold text-brand-text/80 tabular-nums"
            >
              {counts[i]}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ProductBento() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-6 pb-0">
      <div
        className="relative md:h-[560px] overflow-hidden rounded-3xl p-6 sm:p-8 md:p-12 pt-10 md:pt-16"
        style={{
          background:
            "radial-gradient(at 15% 15%, rgba(167,139,250,0.85) 0, transparent 45%)," +
            "radial-gradient(at 85% 10%, rgba(96,165,250,0.6) 0, transparent 45%)," +
            "radial-gradient(at 90% 85%, rgba(236,72,153,0.35) 0, transparent 45%)," +
            "radial-gradient(at 10% 90%, rgba(79,70,229,0.75) 0, transparent 50%)," +
            "#1b1530",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-5"
        >
          <LiveChatDemo />
          <div className="grid grid-rows-2 gap-5 max-w-md w-full mx-auto md:mx-0">
            <PresenceCard />
            <ReactionsCard />
          </div>
        </motion.div>

        {/* Fade to page background at the very bottom edge — only where height is fixed */}
        <div
          className="hidden md:block absolute inset-x-0 bottom-0 h-24 pointer-events-none rounded-b-3xl"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--brand-bg) 96%)",
          }}
        />
      </div>
    </section>
  );
}
