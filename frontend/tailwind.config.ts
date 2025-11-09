import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(255 60% 98%)",
        foreground: "hsl(259 63% 18%)",
        brand: {
          50: "#f4f2ff",
          100: "#ece6ff",
          200: "#d7c9ff",
          300: "#c1abff",
          400: "#aa8cff",
          500: "#916dff",
          600: "#6f49db",
          700: "#4d31b3",
          800: "#342484",
          900: "#1b1457",
        },
        aqua: {
          50: "#f1fbff",
          100: "#d9f5ff",
          200: "#b0ebff",
          300: "#7de0ff",
          400: "#3dd2ff",
          500: "#0bbde6",
          600: "#0092ba",
          700: "#006c89",
          800: "#00495c",
          900: "#022e3b",
        },
        card: "rgba(255,255,255,0.8)",
        muted: "rgba(255,255,255,0.6)",
      },
      boxShadow: {
        glow: "0 10px 50px rgba(145, 109, 255, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".glass": {
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      });
    }),
  ],
};

export default config;

