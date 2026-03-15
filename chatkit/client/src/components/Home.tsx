import { useState, useEffect } from "react";

import Hero from "./Home/Hero";
import LiveStatsBar from "./Home/LiveStatsBar";
import FeaturesSection from "./Home/FeaturesSection";
import TerminalSection from "./Home/TerminalSection";
import LiveDemoChat from "./Home/LiveDemoChat";
import Footer from "./Home/Footer";
import type { UserData } from "../types";

export default function Home({
  user,
  onSignInClick,
}: {
  user: UserData | null;
  onSignInClick: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [healthData, setHealthData] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      const start = Date.now();
      try {
        const res = await fetch(
          `${import.meta.env.VITE_ENDPOINT}/hermes/health`,
        );
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
  }, []);

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans selection:bg-brand-primary/30 flex flex-col overflow-x-hidden">
      <main className="flex flex-col items-center">
        <Hero user={user} onSignInClick={onSignInClick} />

        <LiveStatsBar healthData={healthData} latency={latency} />

        <FeaturesSection />

        {/* SDK install terminal demo */}
        <TerminalSection />

        {/* Live demo chat */}
        <LiveDemoChat user={user} onSignInClick={onSignInClick} />
      </main>

      <Footer />
    </div>
  );
}
