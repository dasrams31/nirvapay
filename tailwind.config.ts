import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        astro: {
          dark: "#0b0d13",
          card: "#121620",
          cardHover: "#181d2a",
          border: "#232938",
          purple: "#7c3aed",
          purpleGlow: "#8b5cf6",
          gold: "#f59e0b",
          cyan: "#06b6d4",
          emerald: "#10b981",
          rose: "#f43f5e",
          slate: "#94a3b8",
          text: "#f8fafc",
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(124, 58, 237, 0.3)",
        soft: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
