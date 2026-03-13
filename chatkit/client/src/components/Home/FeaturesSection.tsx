import React from "react";
import { MessageSquare, BarChart3 } from "lucide-react";

const FeaturesSection = () => {
  return (
    <div className="w-full max-w-[1280px] px-6 md:px-10 py-24">
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-4 text-center items-center">
          <h2 className="text-white text-4xl md:text-5xl font-black tracking-tight max-w-[800px]">
            Everything you need to{" "}
            <span className="text-brand-primary">scale</span>
          </h2>
          <p className="text-brand-muted text-lg max-w-[700px]">
            Hermes provides the core infrastructure so you can focus on building
            your unique user experience.
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
              Real-time messaging with rich media support, typing indicators,
              read receipts, and industry-leading end-to-end encryption. Built
              for reliability at any scale.
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
              Monitor active users, message volume, and performance metrics in
              real-time. Gain deep insights into how your users interact and
              communicate.
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
  );
};

export default FeaturesSection;
