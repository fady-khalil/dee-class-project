import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { I18nView, I18nText } from "../../components/common/I18nComponents";
import HeaderBack from "../../components/navigation/HeaderBack";
import COLORS from "../../styles/colors";

const SettingsScreen = () => {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBack screenName="settings" />
      <I18nView style={styles.container}>
        <I18nText style={styles.text}>
          {t("settings.screen") || "Settings Screen"}
        </I18nText>
      </I18nView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: COLORS.white,
    fontSize: 24,
  },
});

export default SettingsScreen;
