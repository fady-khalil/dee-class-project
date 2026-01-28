import React from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { I18nView, I18nText } from "../../components/common/I18nComponents";
import COLORS from "../../styles/colors";

const SettingsScreen = () => {
  const { t } = useTranslation();
  return (
    <I18nView style={styles.container}>
      <I18nText style={styles.text}>
        {t("settings.screen") || "Settings Screen"}
      </I18nText>
    </I18nView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
  },
  text: {
    color: COLORS.white,
    fontSize: 24,
  },
});

export default SettingsScreen;
