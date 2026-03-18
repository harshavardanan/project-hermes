import { useEffect, useRef } from "react";

const FEATURES = [
  {
    tag: "TRANSPORT",
    title: "WebSockets",
    desc: "Persistent bidirectional connection between client and server. Messages delivered in under 50ms with automatic reconnection.",
    method: "client.connect()",
    code: `const client = new HermesClient({
  endpoint: process.env.HERMES_URL,
  apiKey:   process.env.API_KEY,
  secret:   process.env.SECRET,
  userId:   user.id,
});

await client.connect();

client.on("connected", () => {
  console.log("Socket open");
});`,
  },
  {
    tag: "CHANNELS",
    title: "Rooms",
    desc: "Create group or direct rooms on the fly. Members can join, leave, and receive messages in real time.",
    method: "client.createGroupRoom()",
    code: `const room = await client.createGroupRoom({
  name:      "engineering",
  memberIds: ["u_1", "u_2", "u_3"],
});

await client.joinRoom(room._id);

client.on("room:created", (room) => {
  console.log("Joined:", room.name);
});`,
  },
  {
    tag: "MESSAGING",
    title: "Send & Receive",
    desc: "Send text, images, or files. Every message is persisted and broadcast to all room members instantly.",
    method: "client.sendMessage()",
    code: `await client.sendMessage({
  roomId: room._id,
  type:   "text",
  text:   "Hello, world!",
});

client.on("message:receive", (msg) => {
  console.log(msg.senderName, msg.text);
});`,
  },
  {
    tag: "AWARENESS",
    title: "Presence",
    desc: "Know who is online, typing, or idle. Typing indicators and online status update in real time across all clients.",
    method: "client.startTyping()",
    code: `client.startTyping(roomId);

client.on("typing:started", ({
  userId, displayName
}) => {
  showTypingIndicator(displayName);
});

client.on("user:online",
  ({ userId }) => setOnline(userId));`,
  },
  {
    tag: "PERSISTENCE",
    title: "History",
    desc: "Paginated message history from MongoDB. Load the last N messages or paginate backwards through any room.",
    method: "client.getHistory()",
    code: `const { messages } = await client.getHistory(
  roomId,
  undefined,
  50
);

messages.forEach((msg) => {
  renderMessage(msg);
});`,
  },
  {
    tag: "SECURITY",
    title: "Auth",
    desc: "JWT tokens issued per user session. Role-based access control and per-room ACL baked in from day one.",
    method: "client.connect({ apiKey })",
    code: `const client = new HermesClient({
  apiKey:      API_KEY,
  secret:      SECRET,
  userId:      user.email,
  displayName: user.name,
});

const hermesUser = await client.connect();
// hermesUser.userId — internal ID
// hermesUser.token  — JWT`,
  },
  {
    tag: "ENGAGEMENT",
    title: "Reactions",
    desc: "Emoji reactions on any message. Reaction counts sync in real time across all connected clients in the room.",
    method: "client.addReaction()",
    code: `await client.addReaction(
  messageId,
  roomId,
  "👍"
);

client.on("reaction:updated", ({
  messageId, reactions
}) => {
  updatePills(messageId, reactions);
});`,
  },
  {
    tag: "UPLOADS",
    title: "File Sharing",
    desc: "Upload images and files via Cloudinary. The SDK handles auth, upload, and returns a CDN URL ready to use.",
    method: "client.uploadFile()",
    code: `const result = await client.uploadFile(file);

await client.sendMessage({
  roomId,
  type:     "image",
  url:      result.url,
  fileName: file.name,
  fileSize: file.size,
  mimeType: file.type,
});`,
  },
];

const COPIES = 3;
const CARD_W = 280;
const CARD_GAP = 24;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  life: number;
  decay: number;
}

export default function FeaturesSection() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const scene = sceneRef.current!;
    const track = trackRef.current!;
    const scanner = scannerRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const totalW = (CARD_W + CARD_GAP) * FEATURES.length;
    let pos = 0,
      vel = -70;
    let dragging = false,
      lastX = 0,
      mouseVel = 0;
    let particles: Particle[] = [];
    let lastTs = 0,
      rafId = 0;

    const resize = () => {
      canvas.width = scene.offsetWidth;
      canvas.height = scene.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const scanX = () => scene.offsetWidth / 2;

    const updateClip = () => {
      const sx = scanX();
      track.querySelectorAll<HTMLElement>(".hs-wrap").forEach((wrap) => {
        const r = wrap.getBoundingClientRect();
        const sr = scene.getBoundingClientRect();
        const cl = r.left - sr.left;
        const cr = r.right - sr.left;
        const cw = r.width;
        const normal = wrap.querySelector<HTMLElement>(".hs-normal");
        const code = wrap.querySelector<HTMLElement>(".hs-code");
        if (!normal || !code) return;
        if (cl < sx + 2 && cr > sx - 2) {
          const pct = Math.max(0, Math.min(100, ((sx - cl) / cw) * 100));
          normal.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
          code.style.clipPath = `inset(0 0 0 ${pct}%)`;
        } else if (cr < sx) {
          normal.style.clipPath = "inset(0 0% 0 0)";
          code.style.clipPath = "inset(0 0 0 100%)";
        } else {
          normal.style.clipPath = "inset(0 100% 0 0)";
          code.style.clipPath = "inset(0 0 0 0%)";
        }
      });
    };

    const spawnParticle = () => {
      particles.push({
        x: scanX() + (Math.random() - 0.5) * 3,
        y: Math.random() * scene.offsetHeight,
        vx: Math.random() * 1.4 + 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.1 + 0.3,
        a: Math.random() * 0.6 + 0.3,
        life: 1,
        decay: Math.random() * 0.011 + 0.004,
      });
    };

    const tickParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const fade =
          Math.min(1, p.y / 40) * Math.min(1, (canvas.height - p.y) / 40);
        ctx.globalAlpha = p.a * p.life * fade;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#a78bfa";
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      if (particles.length < 500) for (let i = 0; i < 3; i++) spawnParticle();
    };

    const animate = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      if (!dragging) {
        vel = vel + (-70 - vel) * 0.018;
        pos += vel * dt;
        if (pos < -totalW) pos += totalW;
        if (pos > 0) pos -= totalW;
        track.style.transform = `translateX(${pos}px)`;
      }
      scanner.style.left = scanX() + "px";
      updateClip();
      tickParticles();
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame((ts) => {
      lastTs = ts;
      animate(ts);
    });

    const onMD = (e: MouseEvent) => {
      dragging = true;
      lastX = e.clientX;
      mouseVel = 0;
      track.style.transition = "none";
    };
    const onMM = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      mouseVel = dx * 60;
      pos += dx;
      lastX = e.clientX;
      track.style.transform = `translateX(${pos}px)`;
      updateClip();
    };
    const onMU = () => {
      if (!dragging) return;
      dragging = false;
      vel = Math.abs(mouseVel) > 30 ? mouseVel : -70;
    };

    track.addEventListener("mousedown", onMD);
    document.addEventListener("mousemove", onMM);
    document.addEventListener("mouseup", onMU);

    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener("mousedown", onMD);
      document.removeEventListener("mousemove", onMM);
      document.removeEventListener("mouseup", onMU);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const allCards = Array.from({ length: COPIES }, () => FEATURES).flat();

  return (
    <section className="w-full max-w-[1280px] px-6 md:px-10 py-24">
      <div className="text-center mb-16">
        <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest mb-4">
          SDK Primitives
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter max-w-[700px] mx-auto">
          Everything you need to scale.
        </h2>
        <p className="text-white/40 text-lg max-w-[560px] mx-auto mt-4">
          Hermes ships every building block. You focus on your product.
        </p>
      </div>

      <div
        ref={sceneRef}
        style={{
          background: "#000",
          height: 320,
          overflow: "hidden",
          position: "relative",
          borderRadius: 20,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 140,
            height: "100%",
            background: "linear-gradient(to right,#000,transparent)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 140,
            height: "100%",
            background: "linear-gradient(to left,#000,transparent)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            ref={trackRef}
            style={{
              display: "flex",
              gap: 24,
              willChange: "transform",
              cursor: "grab",
              userSelect: "none",
              alignItems: "center",
            }}
          >
            {allCards.map((f, i) => (
              <div
                key={i}
                className="hs-wrap"
                style={{
                  width: 280,
                  height: 240,
                  flexShrink: 0,
                  position: "relative",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {/* Normal side */}
                <div
                  className="hs-normal"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    padding: 22,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.22)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 4,
                      padding: "2px 7px",
                      width: "fit-content",
                    }}
                  >
                    {f.tag}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.02em",
                      marginTop: 4,
                    }}
                  >
                    {f.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,0.38)",
                      flex: 1,
                    }}
                  >
                    {f.desc}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: "rgba(160,120,255,0.6)",
                      border: "1px solid rgba(120,80,255,0.2)",
                      borderRadius: 4,
                      padding: "2px 7px",
                      width: "fit-content",
                    }}
                  >
                    {f.method}
                  </div>
                </div>
                {/* Code side */}
                <div
                  className="hs-code"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 14,
                    border: "1px solid rgba(120,80,255,0.25)",
                    background: "#0a0a12",
                    padding: 18,
                    overflow: "hidden",
                    fontFamily: "'Courier New',monospace",
                    fontSize: 10.5,
                    lineHeight: 1.65,
                    color: "#a78bfa",
                    whiteSpace: "pre",
                    pointerEvents: "none",
                  }}
                >
                  {f.code}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scanner */}
        <div
          ref={scannerRef}
          style={{
            position: "absolute",
            top: 0,
            width: 3,
            height: "100%",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom,transparent,rgba(255,255,255,0.95) 10%,#fff 50%,rgba(255,255,255,0.95) 90%,transparent)",
              borderRadius: 3,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              height: "100%",
              width: 18,
              left: -8,
              background: "rgba(120,80,255,0.35)",
              borderRadius: 9,
              filter: "blur(5px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              height: "100%",
              width: 38,
              left: -18,
              background: "rgba(120,80,255,0.13)",
              borderRadius: 20,
              filter: "blur(10px)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
