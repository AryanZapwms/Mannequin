import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // ── Mannequin Care brand tokens ──────────────────────────────
        brand: {
          gold: {
            50: "#FFFDF0",
            100: "#FFF9D6",
            200: "#FFF0A0",
            300: "#FFE45A",
            400: "#FFD700",
            500: "#F5C400",
            600: "#E0A800",
            700: "#B8860B",
          },
          cream: "#FDF6EC",
          linen: "#F5ECD7",
          sand: "#E8D5B0",
          mocha: "#8B6914",
          espresso: "#3D2B1F",
          blush: "#F9C7C7",
          sage: "#B5C9A8",
          copper: "#C47A2B",
          body: "#5C4033",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sub: ["var(--font-jost)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
        logo: ["var(--font-quicksand)", "sans-serif"],
      },
      fontSize: {
        hero: ["clamp(2.625rem, 6vw, 5rem)", { lineHeight: "1.05" }],
        display: ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.1" }],
        heading: ["clamp(1.375rem, 3vw, 2.25rem)", { lineHeight: "1.2" }],
        subhead: ["clamp(0.8125rem, 1.5vw, 1rem)", { lineHeight: "1.4" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "16px",
        feature: "24px",
        thumb: "12px",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(61,43,31,0.06)",
        card: "0 8px 40px rgba(61,43,31,0.10)",
        hover: "0 16px 56px rgba(61,43,31,0.16)",
        gold: "0 4px 24px rgba(245,196,0,0.25)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spring-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        float: "float 4s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both",
        "spring-pop": "spring-pop 0.2s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
