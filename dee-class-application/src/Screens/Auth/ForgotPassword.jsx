import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Spinner from "../../components/RequestHandler/Spinner";
import { usePostData } from "../../Hooks/usePostData";
import COLORS from "../../styles/colors";
import logo from "../../Assests/logos/dclass.png";

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isRTL = i18n.language === "ar";
  const { postData, isLoading } = usePostData();

  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMessage(t("forgot_password.email_invalid"));
      return;
    }

    try {
      const response = await postData("auth/request-password-reset", { email });

      if (response.success) {
        setSuccessMessage(t("forgot_password.otp_sent"));
        setStep(2);
      } else {
        setErrorMessage(response.message || t("forgot_password.request_error"));
      }
    } catch (error) {
      setErrorMessage(t("forgot_password.request_error"));
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp || otp.length < 4) {
      setErrorMessage(t("forgot_password.otp_invalid"));
      return;
    }

    try {
      const response = await postData("auth/verify-reset-code", { email, code: otp });

      if (response.success) {
        setSuccessMessage(t("forgot_password.otp_verified"));
        setStep(3);
      } else {
        setErrorMessage(response.message || t("forgot_password.otp_error"));
      }
    } catch (error) {
      setErrorMessage(t("forgot_password.otp_error"));
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 8) {
      setErrorMessage(t("forgot_password.password_short"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t("forgot_password.password_mismatch"));
      return;
    }

    try {
      const response = await postData("auth/reset-password", {
        email,
        code: otp,
        newPassword,
        confirmPassword,
      });

      if (response.success) {
        setSuccessMessage(t("forgot_password.reset_success"));
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);
      } else {
        setErrorMessage(response.message || t("forgot_password.reset_error"));
      }
    } catch (error) {
      setErrorMessage(t("forgot_password.reset_error"));
    }
  };

  const handleOtpChange = (text) => {
    const numericText = text.replace(/\D/g, "").slice(0, 6);
    setOtp(numericText);
  };

  const getStepIcon = () => {
    switch (step) {
      case 1:
        return "mail-outline";
      case 2:
        return "key-outline";
      case 3:
        return "lock-closed-outline";
      default:
        return "mail-outline";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return t("forgot_password.step1_desc");
      case 2:
        return t("forgot_password.step2_desc");
      case 3:
        return t("forgot_password.step3_desc");
      default:
        return "";
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

        {/* Forgot Password Card */}
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={getStepIcon()} size={40} color={COLORS.primary} />
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{t("forgot_password.title")}</Text>
            <Text style={styles.subtitle}>{getStepDescription()}</Text>
          </View>

          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  s <= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Success Message */}
          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Step 1: Email */}
          {step === 1 && (
            <View>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.darkWhite}
                  style={[styles.inputIcon, isRTL && styles.inputIconRTL]}
                />
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL]}
                  placeholder={t("forgot_password.email_placeholder")}
                  placeholderTextColor={COLORS.darkWhite}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRequestOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  <Text style={styles.buttonText}>{t("forgot_password.send_code")}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <View>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={handleOtpChange}
                placeholder={t("forgot_password.otp_placeholder")}
                placeholderTextColor={COLORS.darkWhite}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  <Text style={styles.buttonText}>{t("forgot_password.verify_code")}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleRequestOtp}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>
                  {t("forgot_password.resend_code")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <View>
              <View style={[styles.inputContainer, { marginBottom: 16 }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.darkWhite}
                  style={[styles.inputIcon, isRTL && styles.inputIconRTL]}
                />
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL]}
                  placeholder={t("forgot_password.new_password_placeholder")}
                  placeholderTextColor={COLORS.darkWhite}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.darkWhite}
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { marginBottom: 20 }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.darkWhite}
                  style={[styles.inputIcon, isRTL && styles.inputIconRTL]}
                />
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL]}
                  placeholder={t("forgot_password.confirm_password_placeholder")}
                  placeholderTextColor={COLORS.darkWhite}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.darkWhite}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  <Text style={styles.buttonText}>{t("forgot_password.reset_password")}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons
              name={isRTL ? "arrow-forward-outline" : "arrow-back-outline"}
              size={16}
              color={COLORS.darkWhite}
            />
            <Text style={styles.backToLoginText}>
              {t("forgot_password.back_to_login")}
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 16,
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
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  successContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.5)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#4ade80",
    fontSize: 14,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    marginBottom: 20,
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
  otpInput: {
    backgroundColor: COLORS.backgroundColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    color: COLORS.white,
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "600",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
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
    backgroundColor: COLORS.lightGrey,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  backToLogin: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },
  backToLoginText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
});

export default ForgotPassword;
