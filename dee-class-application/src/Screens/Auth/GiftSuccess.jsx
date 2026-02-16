import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import HeaderBack from "../../components/navigation/HeaderBack";
import logo from "../../Assests/logos/dclass.png";

const GiftSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { planInfo } = route.params || {};
  const isRTL = i18n.language === "ar";

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MyProfiles" }],
    });
  };

  return (
    <View style={styles.container}>
      <HeaderBack screenName="gift_success" />
      {/* Logo */}
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      {/* Success Card */}
      <View style={styles.card}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{t("gift.success_title")}</Text>
        <Text style={styles.subtitle}>{t("gift.success_subtitle")}</Text>

        {/* Plan Details */}
        <View style={styles.planCard}>
          <Text style={styles.planLabel}>{t("gift.your_plan")}</Text>
          <Text style={styles.planTitle}>
            {isRTL ? planInfo?.plan?.title_ar : planInfo?.plan?.title}
          </Text>
          <Text style={styles.planDuration}>
            {planInfo?.billingCycle === "yearly"
              ? t("gift.one_year")
              : t("gift.one_month")}
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <Ionicons name="people" size={18} color={COLORS.primary} />
              <Text style={styles.featureText}>
                {planInfo?.plan?.profilesAllowed} {t("gift.profiles")}
              </Text>
            </View>
            {planInfo?.plan?.canDownload && (
              <View style={styles.featureRow}>
                <Ionicons name="download" size={18} color={COLORS.primary} />
                <Text style={styles.featureText}>{t("gift.downloads_included")}</Text>
              </View>
            )}
            <View style={styles.featureRow}>
              <Ionicons name="infinite" size={18} color={COLORS.primary} />
              <Text style={styles.featureText}>{t("gift.unlimited_access")}</Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>{t("gift.start_watching")}</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.sm,
  },
  logo: {
    height: 48,
    width: 150,
    marginBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.grey,
    borderRadius: 20,
    padding: SPACING.lg,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkWhite,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  planCard: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 16,
    padding: SPACING.lg,
    width: "100%",
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    alignItems: "center",
  },
  planLabel: {
    fontSize: 12,
    color: COLORS.darkWhite,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  planDuration: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  featuresContainer: {
    width: "100%",
    gap: SPACING.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  featureText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xxl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    width: "100%",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default GiftSuccess;
