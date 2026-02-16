import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";

const PlanTitle = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("general.plans_title")}</Text>
      <Text style={styles.subtitle}>{t("general.plans_description")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkWhite,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default PlanTitle;
