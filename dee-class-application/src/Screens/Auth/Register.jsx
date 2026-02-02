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
import logo from "../../Assests/logos/dclass.png";

const Register = () => {
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

        // Handle payment flow if registering with a plan
        if (is_register && plan_id) {
          try {
            const baseSuccessUrl = Linking.createURL("payment/success");
            const successUrl = `${baseSuccessUrl}?session_id={CHECKOUT_SESSION_ID}&type=plan`;
            const cancelUrl = Linking.createURL("payment/cancel");

            const paymentResponse = await postDataNoLang("create-checkout-session", {
              type: "package",
              user_id: user?._id,
              id: plan_id,
              source: "application",
              success_url: successUrl,
              cancel_url: cancelUrl,
            });

            if (paymentResponse?.status === 200 && paymentResponse?.data?.checkout_url) {
              Linking.openURL(paymentResponse.data.checkout_url);
            }
          } catch (error) {
            setErrorMessage(t("auth.register.payment_error"));
          }
        } else {
          // Navigate to verify email screen
          setEmailInput("");
          setPasswordInput("");
          navigation.navigate("VerifyEmail", { email: emailInput });
        }
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

        {/* Register Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{t("auth.register.title")}</Text>
            <Text style={styles.subtitle}>{t("auth.register.subtitle")}</Text>
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
              <Text style={styles.fieldError}>{t("auth.register.emailError")}</Text>
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
              <Text style={styles.fieldError}>{t("auth.register.passwordError")}</Text>
            )}
          </View>

          {/* Terms Agreement */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>{t("auth.register.agreeText")} </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Terms")}>
              <Text style={styles.termsLink}>{t("auth.register.terms")}</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> {t("auth.register.and")} </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Privacy")}>
              <Text style={styles.termsLink}>{t("auth.register.privacy")}</Text>
            </TouchableOpacity>
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
              <Text style={styles.buttonText}>{t("auth.register.submit")}</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t("auth.register.hasAccount")} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login", plan_id ? { plan_id, is_register } : undefined)}
            >
              <Text style={styles.loginLink}>{t("auth.register.loginLink")}</Text>
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
    padding: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    height: 48,
    width: 150,
  },
  card: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
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
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconRTL: {
    marginRight: 0,
    marginLeft: 12,
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
    marginRight: 8,
  },
  fieldError: {
    color: "#f87171",
    fontSize: 12,
    marginTop: 6,
  },
  termsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  termsText: {
    color: COLORS.darkWhite,
    fontSize: 12,
  },
  termsLink: {
    color: COLORS.primary,
    fontSize: 12,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
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

export default Register;
