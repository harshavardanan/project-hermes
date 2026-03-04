/** @type {import('tailwindcss').Config} */
eexport default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0B0F14",        // main background
          card: "#111827",      // sidebar / panels
          border: "#1F2937",    // subtle borders
          primary: "#22C55E",   // soft green accent
          text: "#E5E7EB",      // main text
          muted: "#9CA3AF",     // secondary text
        },
      },
      borderRadius: {
        brand: "12px",
      },
    },
  },
  plugins: [],
};

