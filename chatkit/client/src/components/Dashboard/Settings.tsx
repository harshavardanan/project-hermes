import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-brand-border pb-6 mb-8">
        <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-text mb-1">
            Global Settings
          </h1>
          <p className="text-brand-muted text-sm max-w-2xl leading-relaxed">
            Configure your dashboard preferences and application themes.
          </p>
        </div>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-brand-text mb-6">Appearance</h2>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-semibold text-brand-text">Theme Preference</h3>
            <p className="text-sm text-brand-muted mt-1">
              Choose how the Hermes dashboard looks for you.
            </p>
          </div>
          
          <div className="flex items-center p-1 bg-black/10 border border-brand-border rounded-lg">
            <div className="text-sm font-medium text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-md">
              Dark Theme (Default)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
