import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Feather";

import logo from "../../../Assests/logos/small-logo.png";
import COLORS from "../../../styles/colors";
import { useNavigation } from "@react-navigation/native";

const JoinUs = ({ isAuthenticated, allowedProfiles, allowedCourses, isVerified, user, joinUs }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Check if email is verified
  const emailVerified = isVerified || user?.verified || user?.email_verified;

  // Scenario 3: Has active plan (allowedProfiles > 0) → Hide section
  if (allowedProfiles > 0) {
    return null;
  }

  // Scenario 2: Has purchased courses → Hide section (they have access)
  if (allowedCourses?.length > 0) {
    return null;
  }

  // Determine what to show based on scenarios
  const getContent = () => {
    // Scenario 1: Not verified → Show verify email prompt
    if (isAuthenticated && !emailVerified) {
      return {
        title: t("verify_email.title"),
        description: t("verify_email.description"),
        buttonText: t("verify_email.verify_button"),
        buttonIcon: "mail",
        onPress: () => navigation.navigate("VerifyEmail", { email: user?.email }),
      };
    }

    // Scenario 4: Verified but no plan/courses → Show sign up / complete registration
    return {
      title: joinUs?.title || t("general.join_us"),
      description: joinUs?.text || t("general.join_us_subtitle"),
      buttonText: isAuthenticated ? t("general.complete_registration") : t("navigation.sign_up"),
      buttonIcon: null,
      onPress: () => navigation.navigate("Plans"),
    };
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topLine} />

        <Text style={styles.title}>{content.title}</Text>

        <Text style={styles.description}>{content.description}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={content.onPress} style={styles.button}>
            {content.buttonIcon && (
              <Icon name={content.buttonIcon} size={18} color={COLORS.white} style={styles.buttonIcon} />
            )}
            <Text style={styles.buttonText}>{content.buttonText}</Text>
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
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 8,
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
