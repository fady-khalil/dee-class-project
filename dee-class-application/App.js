import React, { useEffect, useState } from "react";
import { StyleSheet, SafeAreaView, View, Text, ActivityIndicator } from "react-native";
import * as Linking from "expo-linking";
import { LoginAuthProvider } from "./src/context/Authentication/LoginAuth";
import AppNavigator from "./src/navigation/AppNavigator";
import { loadSavedLanguage } from "./src/translations/i18n";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "./src/translations/i18n";
import { NetworkProvider } from "./src/context/Network";
import { DownloadProvider } from "./src/context/Download/DownloadContext";
// "scheme": "deeclass", app.json에 있음

// Get the Expo development URL prefix for Expo Go
const expoPrefix = Linking.createURL("/");
console.log("Expo deep link prefix:", expoPrefix);

export const linking = {
  // Include Expo Go prefix for development AND production scheme
  prefixes: [expoPrefix, "deeclass://", "https://yourwebsite.com"],
  config: {
    screens: {
      PaymentSuccess: {
        path: "payment/success",
        parse: {
          session_id: (session_id) => session_id,
          type: (type) => type,
        },
      },
      Main: {
        screens: {
          Home: "home",
          Library: "library",
          MyProgress: "my-progress",
          Profile: "profile",
        },
      },
      CourseDetails: {
        path: "course/:slug",
        parse: {
          slug: (slug) => slug,
        },
      },
    },
  },
};

export default function App() {
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  useEffect(() => {
    const initLanguage = async () => {
      await loadSavedLanguage();
      setIsLanguageLoaded(true);
    };
    initLanguage();
  }, []);

  // Show loading screen while language settings are being loaded
  // This ensures RTL direction is properly set before rendering the UI
  if (!isLanguageLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <NetworkProvider>
        <LoginAuthProvider>
          <DownloadProvider>
            <AppNavigator />
          </DownloadProvider>
        </LoginAuthProvider>
      </NetworkProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
});

// sky
// com.dowgroup.deeClass
