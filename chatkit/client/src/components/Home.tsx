import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, BarChart3, Share2, Rss, Zap } from "lucide-react";

interface HomeProps {
  user: any;
  onSignInClick: () => void;
}

// Helper to format uptime from seconds into readable string
const formatUptime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

const Home: React.FC<HomeProps> = ({ user, onSignInClick }) => {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  // Poll Hermes Engine Health Endpoint every 3 seconds
  useEffect(() => {
    const fetchHealth = async () => {
      const start = Date.now();
      try {
        const res = await fetch("http://localhost:8080/hermes/health");
        if (res.ok) {
          const data = await res.json();
          setHealthData(data);
          setLatency(Date.now() - start); // Calculate actual round-trip latency
        }
      } catch (err) {
        console.error("Hermes engine unreachable");
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  // Smart routing: Go to dashboard if logged in, otherwise open Auth modal
  const handleCtaClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      onSignInClick();
    }
  };

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans selection:bg-brand-primary/30 flex flex-col overflow-x-hidden">
      <main className="flex flex-col items-center">
        {/* ── HERO SECTION ── */}
        <div className="w-full max-w-[1280px] px-6 md:px-10 py-16 md:py-24 mt-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-8 flex-1">
              <div className="flex flex-col gap-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                  </span>
                  {healthData?.status === "ok"
                    ? `Engine v${healthData.version} Online`
                    : "Connecting to Engine..."}
                </span>

                <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                  Build the next Messenger with{" "}
                  <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(57,255,20,0.4)]">
                    Hermes SDK
                  </span>
                </h1>

                <p className="text-brand-muted text-lg md:text-xl leading-relaxed max-w-[600px]">
                  The most reliable chat infrastructure for developers.
                  Real-time messaging, rich media support, and enterprise-grade
                  security out of the box.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCtaClick}
                  className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-brand-primary text-black text-lg font-bold shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all active:scale-95"
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                </button>
                <button
                  onClick={() => navigate("/documentation")}
                  className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 border border-brand-border bg-brand-card text-white text-lg font-bold hover:bg-zinc-900 transition-all"
                >
                  View Docs
                </button>
              </div>

              <div className="flex items-center gap-4 text-brand-muted text-sm font-medium mt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-brand-bg bg-brand-card flex items-center justify-center overflow-hidden"
                    >
                      <img
                        className="w-full h-full object-cover opacity-80"
                        src={`https://ui-avatars.com/api/?name=Dev+${i}&background=0A0A0A&color=39FF14`}
                        alt={`Dev ${i}`}
                      />
                    </div>
                  ))}
                </div>
                <span>Trusted by 2,000+ development teams</span>
              </div>
            </div>

            {/* Right Content (Code Mockup) */}
            <div className="flex-1 w-full max-w-[600px] relative">
              <div className="absolute -inset-4 bg-brand-primary/20 blur-[100px] rounded-full opacity-40"></div>
              <div className="relative bg-brand-card rounded-2xl shadow-2xl border border-brand-border overflow-hidden">
                <div className="bg-black/50 px-4 py-3 flex items-center gap-2 border-b border-brand-border">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-red-500/50"></div>
                    <div className="size-3 rounded-full bg-yellow-500/50"></div>
                    <div className="size-3 rounded-full bg-brand-primary/50"></div>
                  </div>
                  <div className="text-[10px] text-brand-muted font-mono flex-1 text-center tracking-widest">
                    hermes-init.ts
                  </div>
                </div>
                <div className="p-6 font-mono text-sm leading-loose overflow-x-auto text-brand-muted">
                  <div className="text-brand-primary">
                    <span className="text-pink-500">import</span> &#123;
                    HermesClient &#125;{" "}
                    <span className="text-pink-500">from</span> '@hermes/sdk';
                  </div>
                  <br />
                  <div>
                    <span className="text-pink-500">const</span> client ={" "}
                    <span className="text-pink-500">new</span>{" "}
                    <span className="text-blue-400">HermesClient</span>(&#123;
                  </div>
                  <div className="pl-4">
                    apiKey:{" "}
                    <span className="text-yellow-300">
                      'pk_live_800627bd6...'
                    </span>
                    ,
                  </div>
                  <div className="pl-4">
                    userId: <span className="text-yellow-300">'agent_007'</span>
                  </div>
                  <div>&#125;);</div>
                  <br />
                  <div className="text-green-400">
                    // Establish secure connection
                  </div>
                  <div>
                    <span className="text-pink-500">await</span> client.
                    <span className="text-blue-400">connect</span>();
                  </div>
                  <br />
                  <div>
                    client.<span className="text-blue-400">sendMessage</span>
                    (&#123;
                  </div>
                  <div className="pl-4">
                    roomId:{" "}
                    <span className="text-yellow-300">'mission_control'</span>,
                  </div>
                  <div className="pl-4">
                    text:{" "}
                    <span className="text-yellow-300">
                      'System optimal. Commencing launch.'
                    </span>
                  </div>
                  <div>&#125;);</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── LIVE STATS BAR ── */}
        <div className="w-full bg-brand-card/50 border-y border-brand-border py-12">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-1">
              <p className="text-brand-primary text-3xl font-black drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                {healthData ? formatUptime(healthData.uptime) : "..."}
              </p>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">
                Live Uptime
              </p>
            </div>

            <div className="h-12 w-px bg-brand-border hidden md:block"></div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-brand-primary text-3xl font-black drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                {healthData?.memory ? `${healthData.memory.used} MB` : "..."}
              </p>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">
                Active Memory
              </p>
            </div>

            <div className="h-12 w-px bg-brand-border hidden md:block"></div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-brand-primary text-3xl font-black drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                {latency !== null ? `${latency}ms` : "..."}
              </p>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">
                Edge Latency
              </p>
            </div>

            <div className="h-12 w-px bg-brand-border hidden md:block"></div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-brand-primary text-3xl font-black drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                {healthData?.status === "ok" ? "SECURE" : "E2EE"}
              </p>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">
                Security
              </p>
            </div>
          </div>
        </div>

        {/* ── FEATURES SECTION ── */}
        <div className="w-full max-w-[1280px] px-6 md:px-10 py-24">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-4 text-center items-center">
              <h2 className="text-white text-4xl md:text-5xl font-black tracking-tight max-w-[800px]">
                Everything you need to{" "}
                <span className="text-brand-primary">scale</span>
              </h2>
              <p className="text-brand-muted text-lg max-w-[700px]">
                Hermes provides the core infrastructure so you can focus on
                building your unique user experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Feature 1 */}
              <div className="group flex flex-col bg-brand-card rounded-3xl p-8 border border-brand-border hover:border-brand-primary/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.15)] transition-all duration-300">
                <div className="size-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_0_10px_rgba(57,255,20,0.1)]">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-white text-2xl font-bold mb-4">
                  Powerful Chat SDK
                </h3>
                <p className="text-brand-muted leading-relaxed mb-8 flex-1">
                  Real-time messaging with rich media support, typing
                  indicators, read receipts, and industry-leading end-to-end
                  encryption. Built for reliability at any scale.
                </p>
                <div className="w-full bg-[#050505] rounded-2xl aspect-video overflow-hidden border border-brand-border p-4 flex flex-col justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="bg-brand-card border border-brand-border w-3/4 rounded-xl rounded-bl-none p-3 self-start">
                    <div className="h-2 w-1/2 bg-brand-muted/30 rounded mb-2"></div>
                    <div className="h-2 w-3/4 bg-brand-muted/20 rounded"></div>
                  </div>
                  <div className="bg-brand-primary/10 border border-brand-primary/30 w-3/4 rounded-xl rounded-br-none p-3 self-end">
                    <div className="h-2 w-2/3 bg-brand-primary/60 rounded mb-2"></div>
                    <div className="h-2 w-1/2 bg-brand-primary/40 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group flex flex-col bg-brand-card rounded-3xl p-8 border border-brand-border hover:border-brand-primary/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.15)] transition-all duration-300">
                <div className="size-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_0_10px_rgba(57,255,20,0.1)]">
                  <BarChart3 size={32} />
                </div>
                <h3 className="text-white text-2xl font-bold mb-4">
                  Insightful Dashboard
                </h3>
                <p className="text-brand-muted leading-relaxed mb-8 flex-1">
                  Monitor active users, message volume, and performance metrics
                  in real-time. Gain deep insights into how your users interact
                  and communicate.
                </p>
                <div className="w-full bg-[#050505] rounded-2xl aspect-video overflow-hidden border border-brand-border p-6 flex items-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                  {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-brand-primary/20 rounded-t-sm relative group-hover:bg-brand-primary/40 transition-colors"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary rounded-t-sm drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="w-full px-6 md:px-10 py-24">
          <div className="max-w-[1280px] mx-auto bg-brand-primary rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center shadow-[0_0_50px_rgba(57,255,20,0.2)]">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <svg
                height="100%"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                width="100%"
              >
                <path
                  d="M0 0 L100 100 M100 0 L0 100"
                  stroke="black"
                  strokeWidth="0.5"
                ></path>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col gap-8 max-w-[720px]">
              <h2 className="text-black text-4xl md:text-6xl font-black leading-tight">
                Ready to build the future of chat?
              </h2>
              <p className="text-black/80 text-lg md:text-xl font-medium">
                Join thousands of developers building the next generation of
                communication apps with Hermes SDK.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <button
                  onClick={handleCtaClick}
                  className="bg-black text-brand-primary px-8 h-14 rounded-xl text-lg font-black hover:bg-zinc-900 transition-all active:scale-95 shadow-xl"
                >
                  {user ? "Go to Dashboard" : "Start Building Now"}
                </button>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-transparent border-2 border-black text-black px-8 h-14 rounded-xl text-lg font-black hover:bg-black/5 transition-all"
                >
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-brand-bg border-t border-brand-border py-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
            <div className="col-span-2 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="size-8 flex items-center justify-center bg-brand-primary rounded-lg text-black">
                  <Zap size={20} fill="currentColor" />
                </div>
                <h2 className="text-white text-xl font-extrabold tracking-tight uppercase">
                  Hermes
                </h2>
              </div>
              <p className="text-brand-muted text-sm max-w-[300px] leading-relaxed">
                The ultimate chat infrastructure for developers who care about
                speed, security, and scalability.
              </p>
              <div className="flex gap-4 mt-2">
                <button className="size-10 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-primary hover:border-brand-primary transition-all">
                  <Share2 size={18} />
                </button>
                <button className="size-10 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-primary hover:border-brand-primary transition-all">
                  <Rss size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">
                Product
              </h4>
              <button
                onClick={() => navigate("/pricing")}
                className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left"
              >
                Pricing
              </button>
              <button
                onClick={() => navigate("/documentation")}
                className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left"
              >
                SDK Docs
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left"
              >
                Dashboard
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">
                Resources
              </h4>
              <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
                Blog
              </button>
              <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
                Help Center
              </button>
              <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
                Security
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">
                Company
              </h4>
              <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
                About
              </button>
              <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
                Contact
              </button>
              <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
                Terms
              </button>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-brand-muted/50 text-xs font-mono">
              © {new Date().getFullYear()} HERMES INFRASTRUCTURE INC. BUILT FOR
              SPEED.
            </p>
            <div className="flex gap-8">
              <button className="text-brand-muted/50 hover:text-brand-primary text-xs transition-colors">
                Privacy Policy
              </button>
              <button className="text-brand-muted/50 hover:text-brand-primary text-xs transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
