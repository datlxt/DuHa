/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: "#7A0013",
        wine: "#8B0F1A",
        ruby: "#A31621",
        cherry: "#5C0010",
        ivory: "#FAF6EF",
        beige: "#EFE3D5",
        charcoal: "#241A1A",
        muted: "#6B5C5C",
      },
    },
  },
  plugins: [],
};
