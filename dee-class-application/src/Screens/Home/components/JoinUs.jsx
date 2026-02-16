import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import logo from "../../../Assests/logos/small-logo.png";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";
import { useNavigation } from "@react-navigation/native";
import { I18nText } from "../../../components/common/I18nComponents";

const JoinUs = ({
  isAuthenticated,
  allowedProfiles,
  allowedCourses,
  isVerified,
  user,
  joinUs,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isLoggedIn = !!user;
  const emailVerified = isVerified || user?.verified || user?.email_verified;

  // Hide section if user already has active plan or purchased courses
  if (allowedProfiles > 0 || allowedCourses?.length > 0) return null;

  const getButtonConfig = () => {
    if (!isLoggedIn) {
      return {
        text: t("navigation.sign_up"),
        icon: "user-plus",
        onPress: () => navigation.navigate("Register"),
      };
    }
    if (!emailVerified) {
      return {
        text: t("verify_email.verify_button"),
        icon: "mail",
        onPress: () =>
          navigation.navigate("VerifyEmail", { email: user?.email }),
      };
    }
    return {
      text: t("general.finish_sign_up"),
      icon: null,
      onPress: () => navigation.navigate("Plans"),
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(237,26,77,0.08)", "transparent", "rgba(237,26,77,0.08)"]}
        style={styles.bgGradient}
      />
      <View style={styles.card}>
        <I18nText style={styles.title}>
          {joinUs?.title || t("general.join_us")}
        </I18nText>
        <I18nText style={styles.description}>
          {joinUs?.text || t("general.join_us_subtitle")}
        </I18nText>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={buttonConfig.onPress}
            style={styles.button}
          >
            {buttonConfig.icon && (
              <Icon
                name={buttonConfig.icon}
                size={16}
                color={COLORS.white}
                style={styles.buttonIcon}
              />
            )}
            <I18nText style={styles.buttonText}>{buttonConfig.text}</I18nText>
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.white,
  },
  description: {
    textAlign: "center",
    marginTop: SPACING.md,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.darkWhite,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },
  logoCircle: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 20,
    height: 20,
  },
});

export default JoinUs;
