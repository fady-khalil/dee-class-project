import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./en";
import ar from "./ar";
import { I18nManager, Alert, Platform } from "react-native";

const LANGUAGE_STORAGE_KEY = "@app_language";

// Initialize i18n
i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: "ar", // Default language
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

// Helper function to restart the app
const restartApp = async () => {
  try {
    // For development mode, try DevSettings
    if (__DEV__) {
      const DevSettings = require("react-native").DevSettings;
      if (DevSettings && DevSettings.reload) {
        DevSettings.reload();
        return;
      }
    }
  } catch (error) {
    console.log("DevSettings.reload failed:", error);
  }

  // Final fallback - show manual restart message
  Alert.alert(
    "Restart Required",
    "Please close and reopen the app to apply the language change.",
    [{ text: "OK" }]
  );
};

// Function to change the language with full restart
export const changeLanguage = async (language) => {
  try {
    // Get current language before changing
    const currentLanguage = i18n.language;

    // Only proceed if actually changing language
    if (currentLanguage !== language) {
      // Set the app's layout direction BEFORE saving
      const isRTL = language === "ar";

      // Force RTL settings - these take effect on restart
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);

      // Store the selected language
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);

      // Set the language in i18n
      await i18n.changeLanguage(language);

      // Restart app immediately without showing alert
      restartApp();
    }
  } catch (error) {
    console.error("Failed to change language:", error);
  }
};

// Load saved language on app start
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (savedLanguage) {
      const isRTL = savedLanguage === "ar";

      // Set the app's layout direction based on saved language
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);

      // Set the language in i18n
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error("Failed to load saved language:", error);
  }
};

export default i18n;
