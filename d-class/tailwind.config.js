/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#000",
        primary: "#ed1a4d",
        darkPrimary: "#700821",
        grey: "#232122",
        lightGrey: "#3f3d3e",
        darkGrey: "#1A1C22",
        lightWhite: "#bbb",
      },
      spacing: {
        primary: "7.2rem",
        secondary: "3.6rem",
        pageTop: "3.2rem",
        firstSectionMobile: "1.2rem",
      },
    },
    screens: {
      xs: "320px",
      ss: "420px",
      sm: "578px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      xsl: "1300px",
      xxl: "1440px",
      xll: "1550px",
      xxll: "1750px",
    },
    fontFamily: {
      name1: [""],
      name2: [""],
    },
  },
  plugins: [],
};
