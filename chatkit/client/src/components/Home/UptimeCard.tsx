import { motion } from "motion/react";

const DAYS = 45;

// Deterministic pseudo-pattern so the bars don't reshuffle on every render.
function statusFor(i: number): "ok" | "warn" | "down" {
  const seed = (i * 9301 + 49297) % 233280;
  const r = seed / 233280;
  if (i === DAYS - 6) return "down";
  if (r > 0.93) return "warn";
  return "ok";
}

const COLOR: Record<string, string> = {
  ok: "#34d399",
  warn: "#fbbf24",
  down: "#f472b6",
};

const BAR_HEIGHT: Record<string, number> = {
  ok: 28,
  warn: 18,
  down: 10,
};

export default function UptimeCard() {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/60 p-5 h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-5">
        <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">
          Live Uptime
        </span>
        <span className="text-white text-xl font-black tracking-tight">
          99.9%
        </span>
      </div>

      <motion.div
        className="flex items-end gap-[3px] flex-1"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={{
          visible: { transition: { staggerChildren: 0.014 } },
        }}
      >
        {Array.from({ length: DAYS }).map((_, i) => {
          const status = statusFor(i);
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                background: COLOR[status],
                height: BAR_HEIGHT[status],
                transformOrigin: "bottom",
              }}
              variants={{
                hidden: { scaleY: 0, opacity: 0 },
                visible: {
                  scaleY: 1,
                  opacity: 1,
                  transition: { duration: 0.35, ease: "easeOut" },
                },
              }}
            />
          );
        })}
      </motion.div>

      <div className="flex justify-between text-[10px] text-brand-muted mt-3">
        <span>{DAYS} days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
