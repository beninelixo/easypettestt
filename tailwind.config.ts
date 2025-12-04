import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        "plan-gold": {
          primary: "hsl(var(--plan-gold-primary))",
          secondary: "hsl(var(--plan-gold-secondary))",
          accent: "hsl(var(--plan-gold-accent))",
          foreground: "hsl(var(--plan-gold-foreground))",
          dark: "hsl(var(--plan-gold-dark))",
        },
        "plan-platinum": {
          primary: "hsl(var(--plan-platinum-primary))",
          secondary: "hsl(var(--plan-platinum-secondary))",
          accent: "hsl(var(--plan-platinum-accent))",
          foreground: "hsl(var(--plan-platinum-foreground))",
          dark: "hsl(var(--plan-platinum-dark))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionDuration: {
        '250': '250ms',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-left": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "slide-right": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.97)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "zoom-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px hsl(var(--primary) / 0.15)" },
          "50%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.25)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        "shine": {
          "0%": { left: "-100%" },
          "100%": { left: "100%" }
        },
        "spring": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "spring-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" }
        },
        "float-badge": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        "blob-morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%", transform: "rotate(0deg)" },
          "50%": { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%", transform: "rotate(90deg)" }
        },
        "blink-cursor": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" }
        },
        "icon-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" }
        },
        "count-up-glow": {
          "0%": { textShadow: "0 0 0 transparent" },
          "50%": { textShadow: "0 0 15px hsl(var(--primary) / 0.4)" },
          "100%": { textShadow: "0 0 5px hsl(var(--primary) / 0.2)" }
        },
        "wave": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 10px hsl(var(--primary) / 0.15)" },
          "50%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.25)" },
        },
        "bounce-enter": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.98)", boxShadow: "0 0 0 0 hsl(var(--primary) / 0.4)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 8px hsl(var(--primary) / 0)" },
          "100%": { transform: "scale(0.98)", boxShadow: "0 0 0 0 hsl(var(--primary) / 0)" },
        },
        "counter-glow": {
          "0%, 100%": { textShadow: "0 0 5px hsl(var(--primary) / 0.3)" },
          "50%": { textShadow: "0 0 12px hsl(var(--primary) / 0.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.4s ease-out",
        "slide-left": "slide-left 0.4s ease-out",
        "slide-right": "slide-right 0.4s ease-out",
        "scale-in": "scale-in 0.25s ease-out",
        "zoom-in": "zoom-in 0.4s ease-out",
        "bounce-subtle": "bounce-subtle 3s ease-in-out infinite",
        "float": "float 5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "shine": "shine 2s ease-in-out infinite",
        "spring": "spring 0.25s ease-out",
        "spring-out": "spring-out 0.2s ease-in",
        "float-badge": "float-badge 5s ease-in-out infinite",
        "gradient-flow": "gradient-flow 6s ease infinite",
        "blob-morph": "blob-morph 15s ease-in-out infinite",
        "blink-cursor": "blink-cursor 1s step-end infinite",
        "icon-bounce": "icon-bounce 0.4s ease-in-out",
        "count-up-glow": "count-up-glow 0.4s ease-out",
        "wave": "wave 25s linear infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "bounce-enter": "bounce-enter 0.4s ease-out forwards",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "counter-glow": "counter-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
