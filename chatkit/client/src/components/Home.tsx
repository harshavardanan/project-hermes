import { useState, useEffect } from "react";

import Hero from "./Home/Hero";
import LiveStatsBar from "./Home/LiveStatsBar";
import FeaturesSection from "./Home/FeaturesSection";
import TerminalSection from "./Home/TerminalSection";
import Stats from "./Home/Stats";
import Footer from "./Home/Footer";
import { useAppConfig } from "../store/appConfig";
import type { UserData } from "../types";

export default function Home({
  onSignInClick,
  user,
  loading,
}: {
  onSignInClick: () => void;
  user?: UserData | null;
  loading?: boolean;
}) {
  const [healthData, setHealthData] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const endpoint = useAppConfig((s) => s.endpoint);

  useEffect(() => {
    const fetchHealth = async () => {
      const start = Date.now();
      try {
        const res = await fetch(`${endpoint}/hermes/health`);
        if (res.ok) {
          const data = await res.json();
          setHealthData(data);
          setLatency(Date.now() - start);
        }
      } catch {
        console.error("Hermes engine unreachable");
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [endpoint]);

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans selection:bg-brand-primary/30 flex flex-col overflow-x-hidden">
      <main className="flex flex-col items-center">
        <Hero onSignInClick={onSignInClick} user={user} loading={loading} />
        <LiveStatsBar healthData={healthData} latency={latency} />
        <FeaturesSection />
        <TerminalSection />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}
