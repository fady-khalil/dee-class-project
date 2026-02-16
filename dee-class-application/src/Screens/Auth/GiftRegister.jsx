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

const GiftRegister = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { giftCode, planInfo } = route.params || {};
  const { loginHandler } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { postData, isLoading } = usePostData();

  // Form state
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailIsValid = emailRegex.test(emailInput);
  const passwordIsValid = passwordInput.trim().length >= 8;
  const passwordsMatch = passwordInput === confirmPasswordInput;
  const formIsValid = emailIsValid && passwordIsValid && passwordsMatch;

  const handleSignUp = async () => {
    setIsSubmitted(true);
    setErrorMessage("");

    if (!formIsValid) return;

    const userData = {
      email: emailInput,
      password: passwordInput,
    };

    try {
      const response = await postData("auth/register", userData);

      if (response.success) {
        const user = response.data?.user;
        const token = response.data?.token;

        // Store basic auth data
        loginHandler(token, user, false, [], []);

        // Navigate to verify email screen with gift code
        setEmailInput("");
        setPasswordInput("");
        setConfirmPasswordInput("");
        navigation.navigate("GiftVerifyEmail", {
          email: emailInput,
          giftCode: giftCode,
          planInfo: planInfo,
        });
      } else {
        setErrorMessage(response.message || t("auth.register.error"));
      }
    } catch (error) {
      setErrorMessage(t("auth.register.error"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <HeaderBack screenName="register" />
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

        {/* Register Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{t("auth.register.title")}</Text>
            <Text style={styles.subtitle}>{t("gift.register_to_redeem")}</Text>
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
                placeholder={t("auth.register.emailPlaceholder")}
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
                placeholder={t("auth.register.passwordPlaceholder")}
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

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <View style={[styles.inputContainer, (isSubmitted && !passwordsMatch) && styles.inputError]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.darkWhite}
                style={[styles.inputIcon, isRTL && styles.inputIconRTL]}
              />
              <TextInput
                style={[styles.input, isRTL && styles.inputRTL]}
                placeholder={t("auth.register.confirmPasswordPlaceholder")}
                placeholderTextColor={COLORS.darkWhite}
                value={confirmPasswordInput}
                onChangeText={setConfirmPasswordInput}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={[styles.eyeIcon, isRTL && styles.eyeIconRTL]}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.darkWhite}
                />
              </TouchableOpacity>
            </View>
            {isSubmitted && !passwordsMatch && (
              <Text style={styles.fieldError}>{t("auth.register.passwordMismatch")}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner isSmall={true} isWhite={true} />
            ) : (
              <Text style={styles.buttonText}>{t("gift.create_and_continue")}</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t("auth.register.haveAccount")} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("GiftLogin", { giftCode, planInfo })}
            >
              <Text style={styles.loginLink}>{t("auth.register.login")}</Text>
            </TouchableOpacity>
          </View>
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
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.lg,
    flexWrap: "wrap",
  },
  loginText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default GiftRegister;
