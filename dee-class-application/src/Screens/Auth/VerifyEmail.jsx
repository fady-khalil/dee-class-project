import React, { useState, useContext, useEffect, useCallback } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import Spinner from "../../components/RequestHandler/Spinner";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import { usePostData } from "../../Hooks/usePostData";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import HeaderBack from "../../components/navigation/HeaderBack";
import logo from "../../Assests/logos/dclass.png";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { email: routeEmail } = route.params || {};
  const { user, token, isVerified, setIsVerifiedHandler } = useContext(LoginAuthContext);
  const { postData, isLoading } = usePostData();

  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Get user email from route params, context, or user object
  const getUserEmail = useCallback(() => {
    return routeEmail || user?.email;
  }, [routeEmail, user?.email]);

  // If already verified, redirect to plans
  useEffect(() => {
    if (isVerified) {
      navigation.navigate("Plans");
    }
  }, [isVerified, navigation]);

  // Handle send verification code
  const handleSendOtp = async () => {
    const email = getUserEmail();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage(t("verify_email.send_error"));
      return;
    }

    try {
      const response = await postData("auth/send-verification", { email });

      if (response.success) {
        setEmailSent(true);
        setSuccessMessage(t("verify_email.send_success"));
      } else {
        setErrorMessage(response.message || t("verify_email.send_error"));
      }
    } catch (error) {
      setErrorMessage(t("verify_email.send_error"));
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setErrorMessage(t("verify_email.otp_required"));
      return;
    }

    const email = getUserEmail();
    setErrorMessage("");
    setSuccessMessage("");
    setIsVerifying(true);

    try {
      const payload = { email, code: otp };
      const response = await postData("auth/verify-email", payload);

      if (response.success) {
        if (setIsVerifiedHandler) {
          setIsVerifiedHandler(true);
        }
        setSuccessMessage(t("verify_email.verified_success"));
        setTimeout(() => {
          navigation.navigate("Plans");
        }, 1500);
      } else {
        setErrorMessage(response.message || t("verify_email.verify_error"));
      }
    } catch (error) {
      setErrorMessage(t("verify_email.verify_error"));
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle OTP input - only allow numbers, max 6 digits
  const handleOtpChange = (text) => {
    const numericText = text.replace(/\D/g, "").slice(0, 6);
    setOtp(numericText);
  };

  const userEmail = getUserEmail();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <HeaderBack screenName="verify_email" />
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

        {/* Verify Email Card */}
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={emailSent ? "shield-checkmark-outline" : "mail-outline"}
              size={40}
              color={COLORS.primary}
            />
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{t("verify_email.title")}</Text>
            <Text style={styles.subtitle}>{t("verify_email.description")}</Text>
          </View>

          {/* User email display */}
          {userEmail && (
            <View style={styles.emailContainer}>
              <Text style={styles.emailText}>{userEmail}</Text>
            </View>
          )}

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

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              {emailSent
                ? t("verify_email.otp_instructions")
                : t("verify_email.instructions")}
            </Text>
          </View>

          {/* OTP Input - shown after email is sent */}
          {emailSent && (
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>{t("verify_email.otp_label")}</Text>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={handleOtpChange}
                placeholder={t("verify_email.otp_placeholder")}
                placeholderTextColor={COLORS.darkWhite}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.buttonsContainer}>
            {/* Verify OTP button - shown after email is sent */}
            {emailSent && (
              <TouchableOpacity
                style={[styles.button, (!otp || isVerifying) && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isVerifying || !otp}
              >
                {isVerifying ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.white} />
                    <Text style={styles.buttonText}>{t("verify_email.verify_button")}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Send/Resend OTP button */}
            <TouchableOpacity
              style={[
                styles.button,
                emailSent && styles.secondaryButton,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner isSmall={true} isWhite={!emailSent} />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color={emailSent ? COLORS.white : COLORS.white}
                  />
                  <Text style={[styles.buttonText, emailSent && styles.secondaryButtonText]}>
                    {emailSent
                      ? t("verify_email.resend_button")
                      : t("verify_email.send_button")}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Help text */}
          <Text style={styles.helpText}>{t("verify_email.help_text")}</Text>
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: SPACING.lg,
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
    paddingHorizontal: SPACING.lg,
  },
  emailContainer: {
    backgroundColor: COLORS.backgroundColor,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: "center",
  },
  emailText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  successContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.5)",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
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
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
  },
  instructionsContainer: {
    backgroundColor: COLORS.backgroundColor,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  instructionsText: {
    color: COLORS.darkWhite,
    fontSize: 14,
    textAlign: "center",
  },
  otpContainer: {
    marginBottom: SPACING.lg,
  },
  otpLabel: {
    color: COLORS.darkWhite,
    fontSize: 14,
    marginBottom: SPACING.sm,
    textAlign: "center",
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
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  buttonsContainer: {
    gap: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: COLORS.lightGrey,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: COLORS.white,
  },
  helpText: {
    color: COLORS.darkWhite,
    fontSize: 12,
    textAlign: "center",
    marginTop: SPACING.lg,
  },
});

export default VerifyEmail;
