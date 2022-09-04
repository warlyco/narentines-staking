/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./features/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        sm: "1.1rem",
      },
      backgroundImage: {
        "main-pattern": 'url("./images/bg-pattern.png")',
        "bg-black-image": 'url("./images/bg-black.png")',
      },
      boxShadow: {
        deep: "11px 20px 19px 0px rgba(0,0,0,0.53);",
        "deep-float": "8px 20px 24px 4px rgba(0,0,0,0.4)",
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
  safelist: ["pt-24", "max-w-5xl", "mx-auto"],
};
