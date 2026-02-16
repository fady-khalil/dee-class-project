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
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Spinner from "../../components/RequestHandler/Spinner";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import { usePostData } from "../../Hooks/usePostData";
import usePostDataNoLang from "../../Hooks/usePostDataNoLang";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import HeaderBack from "../../components/navigation/HeaderBack";
import logo from "../../Assests/logos/dclass.png";

const GiftLogin = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { giftCode, planInfo } = route.params || {};
  const { loginHandler } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { postData, isLoading } = usePostData();
  const { postData: postDataNoLang } = usePostDataNoLang();

  // Form state
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailIsValid = emailRegex.test(emailInput);
  const passwordIsValid = passwordInput.trim().length >= 8;
  const formIsValid = emailIsValid && passwordIsValid;

  const handleLogin = async () => {
    setIsSubmitted(true);
    setErrorMessage("");

    if (!formIsValid) return;

    const userData = {
      email: emailInput,
      password: passwordInput,
    };

    try {
      const response = await postData("auth/login", userData);

      if (response.success) {
        const user = response.data?.user;
        const token = response.data?.token;
        const profiles = user?.profiles || [];
        const hasActiveSubscription = user?.hasActiveSubscription || false;
        const allowedProfiles = user?.subscription?.profilesAllowed || 0;
        const purchasedCourses = user?.purchasedItems?.courses?.map(c => c.courseId || c._id) || [];
        const userIsVerified = user?.verified === true;

        // Check if user is verified
        if (!userIsVerified) {
          loginHandler(token, user, false, purchasedCourses, profiles);
          navigation.navigate("GiftVerifyEmail", {
            email: emailInput,
            giftCode: giftCode,
            planInfo: planInfo
          });
          return;
        }

        // Now redeem the gift code
        setIsRedeeming(true);
        try {
          const redeemResponse = await postDataNoLang("gift/redeem", {
            code: giftCode,
            user_id: user._id,
          });

          if (redeemResponse.success) {
            // Update login with new subscription data
            const newAllowedProfiles = redeemResponse.data?.subscription?.profilesAllowed || allowedProfiles;

            loginHandler(
              token,
              { ...user, subscription: redeemResponse.data?.subscription },
              newAllowedProfiles,
              purchasedCourses,
              profiles
            );

            // Navigate to success/profiles
            navigation.reset({
              index: 0,
              routes: [{
                name: "GiftSuccess",
                params: { planInfo: planInfo }
              }],
            });
          } else {
            setErrorMessage(redeemResponse.message || t("gift.redeem_error"));
            // Still login but show error
            loginHandler(
              token,
              user,
              hasActiveSubscription ? allowedProfiles : 0,
              purchasedCourses,
              profiles
            );
          }
        } catch (redeemError) {
          setErrorMessage(t("gift.redeem_error"));
          // Still login but show error
          loginHandler(
            token,
            user,
            hasActiveSubscription ? allowedProfiles : 0,
            purchasedCourses,
            profiles
          );
        }
        setIsRedeeming(false);
      } else {
        setErrorMessage(response.message || t("auth.login.error"));
      }
    } catch (error) {
      setErrorMessage(t("auth.login.error"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <HeaderBack screenName="login" />
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

        {/* Gift Info Banner */}
        <View style={styles.giftBanner}>
          <MaterialIcons name="card-giftcard" size={20} color={COLORS.primary} />
          <Text style={styles.giftBannerText}>
            {t("gift.redeeming")}: {isRTL ? planInfo?.plan?.title_ar : planInfo?.plan?.title}
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{t("auth.login.title")}</Text>
            <Text style={styles.subtitle}>{t("gift.login_to_redeem")}</Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View style={[styles.inputContainer, (isSubmitted && !emailIsValid) && styles.inputError]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.darkWhite}
                style={[styles.inputIcon, isRTL && styles.inputIconRTL]}
              />
              <TextInput
                style={[styles.input, isRTL && styles.inputRTL]}
                placeholder={t("auth.login.emailPlaceholder")}
                placeholderTextColor={COLORS.darkWhite}
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {isSubmitted && !emailIsValid && (
              <Text style={styles.fieldError}>{t("auth.login.emailError")}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <View style={[styles.inputContainer, (isSubmitted && !passwordIsValid) && styles.inputError]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.darkWhite}
                style={[styles.inputIcon, isRTL && styles.inputIconRTL]}
              />
              <TextInput
                style={[styles.input, isRTL && styles.inputRTL]}
                placeholder={t("auth.login.passwordPlaceholder")}
                placeholderTextColor={COLORS.darkWhite}
                value={passwordInput}
                onChangeText={setPasswordInput}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={[styles.eyeIcon, isRTL && styles.eyeIconRTL]}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.darkWhite}
                />
              </TouchableOpacity>
            </View>
            {isSubmitted && !passwordIsValid && (
              <Text style={styles.fieldError}>{t("auth.login.passwordError")}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, (isLoading || isRedeeming) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading || isRedeeming}
          >
            {isLoading || isRedeeming ? (
              <View style={styles.loadingContainer}>
                <Spinner isSmall={true} isWhite={true} />
                <Text style={styles.loadingText}>
                  {isRedeeming ? t("gift.activating") : t("auth.login.logging_in")}
                </Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{t("gift.login_and_activate")}</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>
              {t("auth.login.forgotPassword")}
            </Text>
          </TouchableOpacity>
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
    marginBottom: SPACING.lg,
  },
  logo: {
    height: 48,
    width: 150,
  },
  giftBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  giftBannerText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.sm,
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
  inputError: {
    borderColor: "#ef4444",
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
    fontSize: 16,
    paddingVertical: 14,
  },
  inputRTL: {
    textAlign: "right",
  },
  eyeIcon: {
    padding: 4,
  },
  eyeIconRTL: {
    marginLeft: 0,
    marginRight: SPACING.sm,
  },
  fieldError: {
    color: "#f87171",
    fontSize: 12,
    marginTop: 6,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: "center",
    marginTop: SPACING.lg,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});

export default GiftLogin;
