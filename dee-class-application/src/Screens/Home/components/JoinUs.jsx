import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import logo from "../../../Assests/logos/small-logo.png";
import COLORS from "../../../styles/colors";
import { useNavigation } from "@react-navigation/native";

const JoinUs = ({ isAuthenticated, allowedProfiles, joinUs }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (isAuthenticated && allowedProfiles) {
    return null;
  }

  const handleRedirect = () => {
    navigation.navigate("Plans");
  };

  // Use dynamic data from API or fallback to translations
  const title = joinUs?.title || t("general.join_us");
  const description = joinUs?.text || t("general.join_us_subtitle");

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topLine} />

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.description}>{description}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleRedirect} style={styles.button}>
            <Text style={styles.buttonText}>{t("navigation.sign_up")}</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.bottomLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    position: "relative",
  },
  topLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  bottomLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.white,
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    marginTop: 16,
    marginHorizontal: "auto",
    fontSize: 14,
    color: COLORS.lightWhite,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 32,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },
  logoContainer: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.darkGrey,
    borderRadius: 9999,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 20,
    height: 20,
  },
});

export default JoinUs;
