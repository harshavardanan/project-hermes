import React from "react";
import { motion } from "motion/react";
import UptimeCard from "./UptimeCard";

interface HealthData {
  uptime: number;
  memory?: { used: number; [key: string]: unknown };
  status?: string;
}

interface LiveStatsBarProps {
  healthData?: HealthData | null;
  latency: number | null;
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/60 p-5 h-full flex flex-col justify-center items-center text-center">
      <p className="text-white text-3xl font-black mb-1">{value}</p>
      <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

const LiveStatsBar: React.FC<LiveStatsBarProps> = ({ healthData, latency }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="lg:col-span-2">
          <UptimeCard />
        </div>
        <StatCard
          value={healthData?.memory ? `${healthData.memory.used} MB` : "..."}
          label="Active Memory"
        />
        <StatCard
          value={latency !== null ? `${latency}ms` : "..."}
          label="Edge Latency"
        />
      </motion.div>
    </div>
  );
};

export default LiveStatsBar;
