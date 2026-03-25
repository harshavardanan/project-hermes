import React from "react";
import Spark from "./Spark";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  spark?: number[];
  accent?: string;
}

// Metric card displayed in the overview grid
const StatCard = ({
  icon,
  label,
  value,
  sub,
  trend,
  spark,
  accent = "#ffffff",
}: StatCardProps) => (
  <div className="bg-brand-card border border-white/10 rounded-xl p-5 flex flex-col gap-1 relative overflow-hidden group hover:border-white/20 transition-colors">
    <div
      className="absolute top-0 left-0 right-0 h-0.5 opacity-50 group-hover:opacity-100 transition-opacity"
      style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
    />
    <div className="flex justify-between items-start">
      <div className="text-slate-500 mb-2 group-hover:text-slate-300 transition-colors">
        {icon}
      </div>
      {spark && <Spark data={spark} color={accent} />}
    </div>
    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
      {label}
    </div>
    <div className="text-2xl font-black text-white font-mono tracking-tight leading-tight mt-1">
      {value}
    </div>
    <div className="flex items-center gap-2 mt-1">
      {sub && (
        <span className="text-[10px] text-slate-400 font-medium font-sans">
          {sub}
        </span>
      )}
      {trend && (
        <span
          className="text-[10px] font-bold font-mono tracking-wide"
          style={{ color: accent }}
        >
          {trend}
        </span>
      )}
    </div>
  </div>
);

export default StatCard;
