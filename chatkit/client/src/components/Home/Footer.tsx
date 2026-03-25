import { Share2, Rss, Terminal, Code2, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-brand-bg border-t border-brand-border py-16 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 flex items-center justify-center">
                <img src="/vite.svg" alt="Hermes Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]" />
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

          {/* Ecosystem Column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-6">
            <h3 className="text-white text-sm font-bold tracking-widest uppercase">
              Explore Ecosystem
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* SDK Card 1 */}
              <a
                href="https://www.npmjs.com/package/consoleartist"
                target="_blank"
                rel="noreferrer"
                className="group flex-1 flex flex-col justify-between p-5 rounded-xl border border-brand-border bg-white/[0.02] hover:bg-white/[0.04] hover:border-brand-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="size-8 rounded-md bg-black/50 border border-brand-border flex items-center justify-center text-brand-muted group-hover:text-brand-primary transition-colors">
                    <Terminal size={16} />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-brand-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-brand-primary transition-all duration-300"
                  />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm mb-1">
                    consoleartist
                  </h4>
                  <p className="text-brand-muted text-xs leading-relaxed">
                    Advanced terminal styling and ASCII engine.
                  </p>
                </div>
              </a>

              {/* SDK Card 2 */}
              <a
                href="https://www.npmjs.com/package/asyncfunctionhandler"
                target="_blank"
                rel="noreferrer"
                className="group flex-1 flex flex-col justify-between p-5 rounded-xl border border-brand-border bg-white/[0.02] hover:bg-white/[0.04] hover:border-brand-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="size-8 rounded-md bg-black/50 border border-brand-border flex items-center justify-center text-brand-muted group-hover:text-brand-primary transition-colors">
                    <Code2 size={16} />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-brand-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-brand-primary transition-all duration-300"
                  />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm mb-1">
                    asyncfunctionhandler
                  </h4>
                  <p className="text-brand-muted text-xs leading-relaxed">
                    Elegant promise wrapper and error handling utility.
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Giant watermark wordmark */}
      <div className="w-full overflow-hidden select-none pointer-events-none mt-10">
        <p
          className="text-center font-black uppercase leading-none tracking-tighter"
          style={{
            fontSize: "clamp(80px, 20vw, 260px)",
            color: "rgba(255,255,255,0.025)",
            letterSpacing: "-0.04em",
          }}
        >
          PROJECT
        </p>
        <p
          className="text-center font-black uppercase leading-none tracking-tighter"
          style={{
            fontSize: "clamp(80px, 20vw, 260px)",
            color: "rgba(255,255,255,0.025)",
            letterSpacing: "-0.04em",
          }}
        >
          HERMES
        </p>
      </div>
    </footer>
  );
};

export default Footer;
