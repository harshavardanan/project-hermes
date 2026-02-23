import React from "react";
import { Shield, Zap, Globe } from "lucide-react";
import Hero from "./Hero";

const Home = () => {
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans selection:bg-brand-primary/30">
      <Hero />

      {/* Feature Grid */}
      <section className="py-24 px-6 border-t border-brand-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="text-brand-primary" />}
              title="Hermes Vault"
              desc="Military-grade AES-256-GCM encryption for your project secrets. Never exposed, always secure."
            />
            <FeatureCard
              icon={<Globe className="text-brand-primary" />}
              title="Global Mesh"
              desc="Automatic routing across us-east-1, eu-west-1, and more. Your data, delivered at light speed."
            />
            <FeatureCard
              icon={<Zap className="text-brand-primary" />}
              title="Instant Pulse"
              desc="Real-time configuration syncing across your entire stack. Update once, deploy everywhere."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-brand-card/30 py-16 border-y border-brand-border">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] mb-8">
            Engineered for the elite
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-125">
            <span className="text-2xl font-black italic text-white tracking-tighter">
              HERMES_LABS
            </span>
            <span className="text-2xl font-black italic text-white tracking-tighter">
              NET_CORE
            </span>
            <span className="text-2xl font-black italic text-white tracking-tighter">
              QUANTUM_API
            </span>
            <span className="text-2xl font-black italic text-white tracking-tighter">
              VELOCITY_JS
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="p-10 rounded-[2rem] bg-brand-card border border-brand-border hover:border-brand-primary/40 transition-all duration-300 group relative overflow-hidden">
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/5 blur-[60px] group-hover:bg-brand-primary/10 transition-all" />

    <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-brand-primary/20">
      {icon}
    </div>
    <h3 className="text-xl font-black text-white mb-4 tracking-tight">
      {title}
    </h3>
    <p className="text-brand-muted leading-relaxed text-sm font-medium">
      {desc}
    </p>
  </div>
);

export default Home;
