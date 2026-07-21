import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
      colors: {
        primary: "#FE6D06",
        "primary-hover": "#E55F00",
        "primary-tint": "#FFF1E6",
        ink: "#14141F",
        "body-text": "#4B4B57",
        cream: "#F7F5F1",
        "app-bg": "#F5F6F8",
        surface: "#FFFFFF",
        line: "#ECEAE5",
        "line-app": "#E7E9EE",
        "success-bg": "#E7F7EC",
        "success-text": "#1E9E4D",
        "danger-bg": "#FDEAEA",
        "danger-text": "#E13B3B",
        "pending-bg": "#FDECEC",
        "pending-text": "#E2685F",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(20,20,31,0.06)",
        lift: "0 10px 30px rgba(20,20,31,0.10)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: false,
    base: false,
    logs: false,
  },
};
