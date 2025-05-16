module.exports = {
  theme: {
    extend: {
      animation: {
        "spin-fast": "spin 1s linear infinite",
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
      keyframes: {
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      fontFamily: {
        sans: ["Geist", "-system-ui", "sans-serif"],
        mono: ["Geist Mono", "Consolas", "monospace"],
      },
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          light: "#818cf8",
          dark: "#6366f1",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          light: "#fca5a5",
          dark: "#dc2626",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#6b7280",
          light: "#9ca3af",
          dark: "#4b5563",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#818cf8",
          light: "#a5b4fc",
          dark: "#6366f1",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          light: "#f9fafb",
          dark: "#1f2937",
          foreground: "#6b7280",
        },
        background: {
          DEFAULT: "#ffffff",
          dark: "#1f2937",
        },
        border: {
          DEFAULT: "#e5e7eb",
          dark: "#374151",
        },
        ring: {
          DEFAULT: "#818cf8",
          dark: "#6366f1",
        },
      },
    },
  },
};
