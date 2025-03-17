module.exports = {
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "spin-1000": "spin 1s linear infinite",
        "spin-2000": "spin 2s linear infinite",
        "spin-3000": "spin 3s linear infinite",
        "spin-4000": "spin 4s linear infinite",
        "spin-5000": "spin 5s linear infinite",
      },
      keyframes: {
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      fontFamily: {
        sans: ["Inter", "Geist", "sans-serif"],
        mono: ["Reddit Mono", "Geist Mono", "Consolas", "monospace"],
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
