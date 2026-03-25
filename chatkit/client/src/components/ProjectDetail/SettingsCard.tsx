import React from "react";

interface SettingsCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

// Card wrapper for settings sections
const SettingsCard = ({ title, icon, children }: SettingsCardProps) => (
  <div className="bg-brand-card border border-white/10 rounded-2xl p-6 lg:p-8">
    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
      <div className="text-slate-400 bg-white/5 p-2 rounded-lg">{icon}</div>
      <h3 className="font-sans text-lg font-bold text-white tracking-tight">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

export default SettingsCard;
