import { useNavigate } from "react-router-dom";
import type { UserData } from "../../types";

export default function BottomCTA({
  onSignInClick,
  user,
}: {
  onSignInClick: () => void;
  user: UserData | null;
}) {
  const navigate = useNavigate();

  return (
    <div className="w-full px-6 md:px-10 py-24">
      <div className="max-w-[1280px] mx-auto bg-brand-primary rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center shadow-[0_0_50px_rgba(255,255,255,0.08)]">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <svg
            height="100%"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            width="100%"
          >
            <path
              d="M0 0 L100 100 M100 0 L0 100"
              stroke="black"
              strokeWidth="0.5"
            ></path>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col gap-8 max-w-[720px]">
          <h2 className="text-black text-4xl md:text-6xl font-black leading-tight">
            Ready to build the future of chat?
          </h2>
          <p className="text-black/80 text-lg md:text-xl font-medium">
            Join thousands of developers building the next generation of
            communication apps with Hermes SDK.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button
              onClick={onSignInClick}
              className="bg-black text-brand-primary px-8 h-14 rounded-xl text-lg font-black hover:bg-zinc-900 transition-all active:scale-95 shadow-xl"
            >
              {user ? "Go to Dashboard" : "Start Building Now"}
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="bg-transparent border-2 border-black text-black px-8 h-14 rounded-xl text-lg font-black hover:bg-black/5 transition-all"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
