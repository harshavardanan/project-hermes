import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import our new modular components
import HeroSection from "./Home/Hero";
import LiveStatsBar from "./Home/LiveStatsbar";
import FeaturesSection from "./Home/FeaturesSection";
import LiveDemoChat from "./Home/LiveDemoChat"; // <-- Imported the new chat component
import Footer from "./Home/Footer";

interface HomeProps {
  user: any;
  onSignInClick: () => void;
}

const Home: React.FC<HomeProps> = ({ user, onSignInClick }) => {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  // Poll Hermes Engine Health Endpoint every 15 seconds to avoid rate limiting
  useEffect(() => {
    const fetchHealth = async () => {
      const start = Date.now();
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_ENDPOINT || "http://localhost:8080"}/hermes/health`,
        );
        if (res.ok) {
          const data = await res.json();
          setHealthData(data);
          setLatency(Date.now() - start); // Calculate actual round-trip latency
        }
      } catch (err) {
        console.error("Hermes engine unreachable");
      }
    };

    fetchHealth();
    // CHANGED: 3000 -> 15000 (15 seconds) so your backend doesn't block you!
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Smart routing: Go to dashboard if logged in, otherwise open Auth modal
  const handleCtaClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      onSignInClick();
    }
  };

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans selection:bg-brand-primary/30 flex flex-col overflow-x-hidden">
      <main className="flex flex-col items-center">
        <HeroSection
          user={user}
          onCtaClick={handleCtaClick}
          healthData={healthData}
        />

        <LiveStatsBar healthData={healthData} latency={latency} />

        <FeaturesSection />

        {/* Replaced BottomCTA with the interactive LiveDemoChat */}
        <LiveDemoChat user={user} onSignInClick={onSignInClick} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
