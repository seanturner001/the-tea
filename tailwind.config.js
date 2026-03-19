/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: "#FF1B8D",
        gold: "#C9A84C",
        bg: "#0C0A0B",
        card: "#161214",
        "text-primary": "#F2EFF0",
        "text-muted": "#666666",
        "text-sub": "#999999",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
