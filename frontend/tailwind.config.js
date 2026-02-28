/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Inter", "system-ui", "sans-serif"],
            },
            colors: {
                brand: {
                    50: "#ECFDF5",
                    100: "#E8F7EE",
                    200: "#D1FAE5",
                    300: "#A7F3D0",
                    400: "#6EE7B7",
                    500: "#34D399",
                    600: "#10B981",
                    700: "#059669",
                    800: "#047857",
                    900: "#065F46",
                },
                ink: {
                    50: "#F8FAFC",
                    100: "#F1F5F9",
                    200: "#E2E8F0",
                    300: "#CBD5E1",
                    400: "#94A3B8",
                    500: "#64748B",
                    600: "#475569",
                    700: "#334155",
                    800: "#1E293B",
                    900: "#0F172A",
                },
                surface: "#FFFFFF",
                page: "#F7FAFC",
                border: "#E2E8F0",
                background: "#F7FAFC",
                foreground: "#0F172A",
            },
            borderRadius: {
                lg: "0.75rem",
                xl: "1rem",
                "2xl": "1.25rem",
                "3xl": "1.75rem",
                card: "1.75rem", // 28px
            },
            boxShadow: {
                card: "0 10px 40px rgba(15, 23, 42, 0.06)",
                cardHover: "0 18px 50px rgba(15, 23, 42, 0.08)",
                soft: "0 4px 16px rgba(15, 23, 42, 0.04)",
                pill: "0 4px 14px rgba(16, 185, 129, 0.25)",
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-1000px 0" },
                    "100%": { backgroundPosition: "1000px 0" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.4s ease-out",
                shimmer: "shimmer 2s linear infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
