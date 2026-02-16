import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Spinner from "../../components/RequestHandler/Spinner";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import usePostDataNoLang from "../../Hooks/usePostDataNoLang";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import HeaderBack from "../../components/navigation/HeaderBack";
import logo from "../../Assests/logos/dclass.png";

const GiftCode = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isRTL = i18n.language === "ar";

  // States
  const [giftCode, setGiftCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [validatedPlan, setValidatedPlan] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { postData } = usePostDataNoLang();

  // Format gift code input (auto-uppercase and add dashes)
  const formatGiftCode = (text) => {
    // Remove any non-alphanumeric characters except dash
    let cleaned = text.toUpperCase().replace(/[^A-Z0-9-]/g, "");

    // If user is typing and code doesn't start with GIFT-, help them
    if (cleaned.length > 0 && !cleaned.startsWith("GIFT-")) {
      if (cleaned.startsWith("GIFT")) {
        cleaned = "GIFT-" + cleaned.slice(4);
      }
    }

    setGiftCode(cleaned);
  };

  // Validate the gift code
  const handleValidate = async () => {
    if (!giftCode.trim()) {
      setErrorMessage(t("gift.enter_code"));
      return;
    }

    setIsValidating(true);
    setErrorMessage("");

    try {
      const response = await postData("gift/validate", {
        code: giftCode.trim(),
      });

      if (response.success) {
        setValidatedPlan(response.data);
        setIsValidated(true);
      } else {
        setErrorMessage(response.message || t("gift.invalid_code"));
      }
    } catch (error) {
      setErrorMessage(t("gift.validation_error"));
    } finally {
      setIsValidating(false);
    }
  };

  // Navigate to login with gift code
  const handleLogin = () => {
    navigation.navigate("GiftLogin", {
      giftCode: giftCode.trim(),
      planInfo: validatedPlan,
    });
  };

  // Navigate to register with gift code
  const handleRegister = () => {
    navigation.navigate("GiftRegister", {
      giftCode: giftCode.trim(),
      planInfo: validatedPlan,
    });
  };

  // Go back to enter different code
  const handleBack = () => {
    setIsValidated(false);
    setValidatedPlan(null);
    setGiftCode("");
    setErrorMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <HeaderBack screenName="redeem_code" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => navigation.navigate("Main")}
        >
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        {/* Card */}
        <View style={styles.card}>
          {!isValidated ? (
            // Step 1: Enter Gift Code
            <>
              {/* Header */}
              <View style={styles.headerContainer}>
                <View style={styles.giftIconContainer}>
                  <MaterialIcons
                    name="card-giftcard"
                    size={40}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.title}>{t("gift.redeem_title")}</Text>
                <Text style={styles.subtitle}>{t("gift.redeem_subtitle")}</Text>
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Gift Code Input */}
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <MaterialIcons
                    name="card-giftcard"
                    size={20}
                    color={COLORS.darkWhite}
                    style={[styles.inputIcon, isRTL && styles.inputIconRTL]}
                  />
                  <TextInput
                    style={[styles.input, isRTL && styles.inputRTL]}
                    placeholder="GIFT-XXXX-XXXX"
                    placeholderTextColor={COLORS.darkWhite}
                    value={giftCode}
                    onChangeText={formatGiftCode}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={14}
                  />
                </View>
              </View>

              {/* Validate Button */}
              <TouchableOpacity
                style={[styles.button, isValidating && styles.buttonDisabled]}
                onPress={handleValidate}
                disabled={isValidating}
              >
                {isValidating ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  <Text style={styles.buttonText}>{t("gift.check_code")}</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>{t("auth.login.or")}</Text>
                <View style={styles.divider} />
              </View>

              {/* Back to Login/Register */}
              <View style={styles.linksContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.linkText}>{t("auth.login.title")}</Text>
                </TouchableOpacity>
                <Text style={styles.linkSeparator}>|</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.linkText}>
                    {t("auth.register.title")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Step 2: Code Validated - Choose Login or Register
            <>
              {/* Success Header */}
              <View style={styles.headerContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={50} color="#22c55e" />
                </View>
                <Text style={styles.title}>{t("gift.valid_code")}</Text>
                <Text style={styles.subtitle}>{t("gift.you_received")}</Text>
              </View>

              {/* Plan Info Card */}
              <View style={styles.planCard}>
                <Text style={styles.planTitle}>
                  {isRTL
                    ? validatedPlan?.plan?.title_ar
                    : validatedPlan?.plan?.title}
                </Text>
                <Text style={styles.planDuration}>
                  {validatedPlan?.billingCycle === "yearly"
                    ? t("gift.one_year")
                    : t("gift.one_month")}
                </Text>
                <View style={styles.planFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="people" size={16} color={COLORS.primary} />
                    <Text style={styles.featureText}>
                      {validatedPlan?.plan?.profilesAllowed}{" "}
                      {t("gift.profiles")}
                    </Text>
                  </View>
                  {validatedPlan?.plan?.canDownload && (
                    <View style={styles.featureItem}>
                      <Ionicons
                        name="download"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.featureText}>
                        {t("gift.downloads_included")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Question */}
              <Text style={styles.questionText}>
                {t("gift.have_account_question")}
              </Text>

              {/* Login Button */}
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>{t("gift.yes_login")}</Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRegister}
              >
                <Text style={styles.secondaryButtonText}>
                  {t("gift.no_create_account")}
                </Text>
              </TouchableOpacity>

              {/* Back Link */}
              <TouchableOpacity style={styles.backLink} onPress={handleBack}>
                <Text style={styles.backLinkText}>
                  {t("gift.use_different_code")}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.sm,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    padding: SPACING.sm,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  logo: {
    height: 48,
    width: 150,
  },
  card: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  giftIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  successIconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkWhite,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  inputIconRTL: {
    marginRight: 0,
    marginLeft: SPACING.md,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: SPACING.lg,
    textAlign: "center",
    letterSpacing: 2,
  },
  inputRTL: {
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    color: COLORS.darkWhite,
    paddingHorizontal: SPACING.lg,
    fontSize: 14,
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  linkSeparator: {
    color: COLORS.darkWhite,
    marginHorizontal: SPACING.lg,
  },
  planCard: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  planDuration: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  planFeatures: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: SPACING.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  featureText: {
    color: COLORS.darkWhite,
    fontSize: 13,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  backLink: {
    marginTop: SPACING.lg,
    alignItems: "center",
  },
  backLinkText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
});

export default GiftCode;
