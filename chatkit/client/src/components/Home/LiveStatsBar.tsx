import React from "react";

interface LiveStatsBarProps {
  healthData: any;
  latency: number | null;
}

// Helper to format uptime from seconds into readable string
const formatUptime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

const LiveStatsBar: React.FC<LiveStatsBarProps> = ({ healthData, latency }) => {
  return (
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
  );
};

export default LiveStatsBar;
