import { useRef } from "react";

// SDK feature cards — one per cube face
const FACES = [
  {
    icon: "⚡",
    title: "WebSockets",
    desc: "Bidirectional real-time messaging. Sub-50ms delivery across 45 edge regions.",
    tag: "TRANSPORT",
  },
  {
    icon: "🏠",
    title: "Rooms",
    desc: "Create, join, and manage chat rooms dynamically. Public, private, or invite-only.",
    tag: "CHANNELS",
  },
  {
    icon: "🟢",
    title: "Presence",
    desc: "Live online/offline status, typing indicators, and last-seen tracking built in.",
    tag: "AWARENESS",
  },
  {
    icon: "📜",
    title: "History",
    desc: "Infinite paginated message history. Retrieve, search, and replay past messages.",
    tag: "PERSISTENCE",
  },
  {
    icon: "🔐",
    title: "Auth",
    desc: "JWT-based token authentication. Role management and per-room ACL controls.",
    tag: "SECURITY",
  },
  {
    icon: "😂",
    title: "Reactions",
    desc: "Emoji reactions, threaded replies, read receipts — the full messaging toolkit.",
    tag: "ENGAGEMENT",
  },
];

export default function FeaturesSection() {
  const cubeRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full max-w-[1280px] px-6 md:px-10 py-24 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-20">
        <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest mb-4">
          SDK Primitives
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter max-w-[700px] mx-auto">
          Everything you need to scale.
        </h2>
        <p className="text-brand-muted text-lg max-w-[560px] mx-auto mt-4">
          Hermes ships every building block. You focus on your product.
        </p>
      </div>

      {/* 3D Cube + feature grid */}
      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* 3D spinning cube */}
        <div className="shrink-0 flex items-center justify-center" style={{ perspective: "900px", width: 280, height: 280 }}>
          <div ref={cubeRef} className="hermes-cube" style={{ width: 160, height: 160, transformStyle: "preserve-3d", animation: "hermesSpinY 16s linear infinite", position: "relative" }}>
            {/* 6 faces */}
            {([
              "translateZ(80px)",
              "rotateY(180deg) translateZ(80px)",
              "rotateY(90deg) translateZ(80px)",
              "rotateY(-90deg) translateZ(80px)",
              "rotateX(90deg) translateZ(80px)",
              "rotateX(-90deg) translateZ(80px)",
            ] as const).map((transform, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 160,
                  height: 160,
                  transform,
                  backfaceVisibility: "visible",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: 16,
                }}
              >
                <span style={{ fontSize: 28 }}>{FACES[i].icon}</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: "-0.02em", textAlign: "center" }}>
                  {FACES[i].title}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {FACES[i].tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {FACES.map((f) => (
            <div
              key={f.title}
              className="group relative bg-white/[0.02] hover:bg-white/[0.045] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl p-5 transition-all duration-300 cursor-default"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl leading-none">{f.icon}</span>
                <span className="text-[9px] font-mono font-bold tracking-widest text-white/20 uppercase border border-white/[0.08] rounded px-1.5 py-0.5">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-white font-bold text-base mb-1.5 tracking-tight">
                {f.title}
              </h3>
              <p className="text-brand-muted text-[13px] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframes injected locally */}
      <style>{`
        @keyframes hermesSpinY {
          from { transform: rotateY(0deg) rotateX(8deg); }
          to   { transform: rotateY(-360deg) rotateX(8deg); }
        }
      `}</style>
    </section>
  );
}
