// src/i18n/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation JSON files
import enTranslations from "./en.json";
import arTranslations from "./ar.json";

// Define resources
const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
};

// Function to update direction
const updateDirection = (lng) => {
  if (lng === "ar") {
    document.body.setAttribute("dir", "rtl");
  } else {
    document.body.removeAttribute("dir");
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    resources,
    lng: localStorage.getItem("language") || "ar",
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    // Ensure that the language is set properly
    initImmediate: false,
  })
  .then(() => {
    // Set initial direction based on the loaded language
    updateDirection(i18n.language);
  });

// Listen for language changes
i18n.on("languageChanged", (lng) => {
  updateDirection(lng);
});

export default i18n;
