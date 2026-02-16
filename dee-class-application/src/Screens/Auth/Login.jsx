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
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Spinner from "../../components/RequestHandler/Spinner";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import { usePostData } from "../../Hooks/usePostData";
import usePostDataNoLang from "../../Hooks/usePostDataNoLang";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import HeaderBack from "../../components/navigation/HeaderBack";
import logo from "../../Assests/logos/dclass.png";

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { plan_id, is_register } = route.params || {};
  const { loginHandler } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        const purchasedCourses =
          user?.purchasedItems?.courses?.map((c) => c.courseId || c._id) || [];
        const userIsVerified = user?.verified === true;

        // Check if user is verified
        if (!userIsVerified) {
          loginHandler(token, user, false, purchasedCourses, profiles);
          setEmailInput("");
          setPasswordInput("");
          navigation.navigate("VerifyEmail", { email: emailInput });
          return;
        }

        loginHandler(
          token,
          user,
          hasActiveSubscription ? allowedProfiles : 0,
          purchasedCourses,
          profiles,
        );

        // Handle payment if needed
        if (plan_id && is_register) {
          try {
            const baseSuccessUrl = Linking.createURL("payment/success");
            const successUrl = `${baseSuccessUrl}?session_id={CHECKOUT_SESSION_ID}&type=plan`;
            const cancelUrl = Linking.createURL("payment/cancel");

            const paymentResponse = await postDataNoLang(
              "create-checkout-session",
              {
                type: "package",
                user_id: user?._id,
                id: plan_id,
                source: "application",
                success_url: successUrl,
                cancel_url: cancelUrl,
              },
            );

            if (
              paymentResponse?.status === 200 &&
              paymentResponse?.data?.checkout_url
            ) {
              Linking.openURL(paymentResponse.data.checkout_url);
            }
          } catch (error) {
            setErrorMessage(t("auth.login.payment_error"));
          }
        } else {
          setEmailInput("");
          setPasswordInput("");

          if (hasActiveSubscription && profiles.length > 0) {
            navigation.reset({
              index: 0,
              routes: [{ name: "MyProfiles" }],
            });
          } else if (purchasedCourses.length > 0) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }, { name: "MyCourses" }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }, { name: "Plans" }],
            });
          }
        }
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

        {/* Login Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{t("auth.login.title")}</Text>
            <Text style={styles.subtitle}>{t("auth.login.subtitle")}</Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View
              style={[
                styles.inputContainer,
                isSubmitted && !emailIsValid && styles.inputError,
              ]}
            >
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
              <Text style={styles.fieldError}>
                {t("auth.login.emailError")}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <View
              style={[
                styles.inputContainer,
                isSubmitted && !passwordIsValid && styles.inputError,
              ]}
            >
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
              <Text style={styles.fieldError}>
                {t("auth.login.passwordError")}
              </Text>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>
              {t("auth.login.forgotPassword")}
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner isSmall={true} isWhite={true} />
            ) : (
              <Text style={styles.buttonText}>{t("auth.login.submit")}</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t("auth.login.or")}</Text>
            <View style={styles.divider} />
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              {t("auth.login.noAccount")}{" "}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  "Register",
                  plan_id ? { plan_id, is_register } : undefined,
                )
              }
            >
              <Text style={styles.registerLink}>
                {t("auth.login.createAccount")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Gift Code Link */}
          <TouchableOpacity
            style={styles.giftCodeContainer}
            onPress={() => navigation.navigate("GiftCode")}
          >
            <Text style={styles.giftCodeText}>{t("gift.have_gift_code")}</Text>
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  registerText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  giftCodeContainer: {
    alignItems: "center",
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  giftCodeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Login;
