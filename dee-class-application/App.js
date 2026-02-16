import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { LoginAuthProvider } from "./src/context/Authentication/LoginAuth";
import AppNavigator from "./src/navigation/AppNavigator";
import { loadSavedLanguage } from "./src/translations/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./src/translations/i18n";
import { NetworkProvider } from "./src/context/Network";
import { DownloadProvider } from "./src/context/Download/DownloadContext";
import SplashScreen from "./src/Screens/Splash";

export default function App() {
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    const initLanguage = async () => {
      await loadSavedLanguage();
      setIsLanguageLoaded(true);
    };
    initLanguage();
  }, []);

  if (!isLanguageLoaded) {
    return <View style={styles.loadingContainer} />;
  }

  if (!isSplashDone) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
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
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});

// sky
// com.dowgroup.deeClass
