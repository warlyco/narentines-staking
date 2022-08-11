/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./features/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "main-pattern": 'url("./images/bg-pattern.png")',
        "bg-black-image": 'url("./images/bg-black.png")',
      },
      colors: {
        amber: {
          200: "#e9cfa6",
          300: "#F7CCA3",
          400: "#d7ad6d",
        },
        green: {
          800: "#69754e",
        },
      },
    },
  },
  plugins: [],
  safelist: ["h-16", "-mt-16", "pt-16", "max-w-5xl", "mx-auto"],
};
