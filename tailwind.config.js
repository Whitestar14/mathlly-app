module.exports = {
  darkMode: "class",
  content: ["./public/**/*.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#818cf8",
          light: "#a5b4fc",
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
          dark: "#111827",
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
  plugins: [],
};
