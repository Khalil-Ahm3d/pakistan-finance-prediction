
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        finance: {
          dark: "#0B1220",
          navy: "#111C32",
          green: "#16A36A",
          light: "#F4F7FB"
        }
      }
    }
  },
  plugins: []
};
