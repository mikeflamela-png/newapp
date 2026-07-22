import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
          extend: {
                  colors: {
                            ink: "#12141a",
                            paper: "#fafaf9",
                            accent: {
                                        DEFAULT: "#2563eb",
                                        soft: "#dbeafe",
                            },
                            warm: "#f59e0b",
                            cold: "#94a3b8",
                            danger: "#dc2626",
                            success: "#16a34a",
                  },
                  borderRadius: {
                            xl2: "1.25rem",
                  },
          },
    },
    plugins: [],
} satisfies Config;
