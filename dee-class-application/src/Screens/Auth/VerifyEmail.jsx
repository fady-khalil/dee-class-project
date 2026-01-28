import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  StatusHandler,
  useStatusHandler,
} from "../../components/RequestHandler";
import Spinner from "../../components/RequestHandler/Spinner";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import { usePostData } from "../../Hooks/usePostData";
import COLORS from "../../styles/colors";
import { GlobalStyle } from "../../styles/GlobalStyle";
import { HeaderBack } from "../../components/navigation";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { I18nText } from "../../components/common/I18nComponents";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { email: routeEmail } = route.params || {};
  const { user, token, setIsVerifiedHandler } = useContext(LoginAuthContext);
  const { postData, isLoading } = usePostData();
  const {
    isVisible,
    status,
    message,
    showSuccess,
    showError,
    hideStatus,
  } = useStatusHandler();

  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Get user email from route params, context, or user object
  const getUserEmail = () => {
    return routeEmail || user?.email;
  };

  // Handle send verification code
  const handleSendOtp = async () => {
    const email = getUserEmail();

    console.log("=== SEND VERIFICATION DEBUG ===");
    console.log("Email:", email);

    if (!email) {
      console.log("ERROR: No email found");
      showError(t("verify_email.send_error"));
      return;
    }

    try {
      const response = await postData("auth/send-verification", { email }, token);
      console.log("Response:", response);

      if (response.success) {
        setEmailSent(true);
        showSuccess(t("verify_email.send_success"));
      } else {
        console.log("API Error:", response.message);
        showError(response.message || t("verify_email.send_error"));
      }
    } catch (error) {
      console.log("Catch Error:", error);
      showError(t("verify_email.send_error"));
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      showError(t("verify_email.otp_required"));
      return;
    }

    const email = getUserEmail();

    console.log("=== VERIFY EMAIL DEBUG ===");
    console.log("Email:", email);
    console.log("Code:", otp);

    setIsVerifying(true);
    try {
      // Backend expects { email, code }
      const payload = { email, code: otp };
      console.log("Payload:", payload);

      const response = await postData("auth/verify-email", payload, token);
      console.log("Response:", response);

      if (response.success) {
        // Update verified status
        if (setIsVerifiedHandler) {
          setIsVerifiedHandler(true);
        }

        showSuccess(t("verify_email.verified_success"));

        // Navigate to plans after verification
        setTimeout(() => {
          navigation.navigate("Plans");
        }, 1500);
      } else {
        console.log("API Error:", response.message, response);
        showError(response.message || t("verify_email.verify_error"));
      }
    } catch (error) {
      console.log("Catch Error:", error);
      showError(t("verify_email.verify_error"));
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle OTP input - only allow numbers, max 6 digits
  const handleOtpChange = (text) => {
    const numericText = text.replace(/\D/g, "").slice(0, 6);
    setOtp(numericText);
  };

  return (
    <View style={styles.rootContainer}>
      <HeaderBack screenName="verify_email" hideBackButton={false} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[GlobalStyle.container, styles.innerContainer]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name="email-outline" size={40} color={COLORS.primary} />
          </View>

          <I18nText style={styles.title}>{t("verify_email.title")}</I18nText>
          <I18nText style={styles.subtitle}>{t("verify_email.description")}</I18nText>

          {/* User email display */}
          {getUserEmail() && (
            <View style={styles.emailContainer}>
              <Text style={styles.emailText}>{getUserEmail()}</Text>
            </View>
          )}

          <View style={styles.statusContainer}>
            <StatusHandler
              isVisible={isVisible}
              status={status}
              message={message}
              hideStatus={hideStatus}
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <I18nText style={styles.instructionsText}>
              {emailSent
                ? t("verify_email.otp_instructions")
                : t("verify_email.instructions")}
            </I18nText>
          </View>

          {/* OTP Input - shown after email is sent */}
          {emailSent && (
            <View style={styles.otpContainer}>
              <I18nText style={styles.otpLabel}>{t("verify_email.otp_label")}</I18nText>
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
                style={[styles.button, styles.primaryButton, !otp && styles.disabledButton]}
                onPress={handleVerifyOtp}
                disabled={isVerifying || !otp}
              >
                {isVerifying ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  <I18nText style={styles.buttonText}>
                    {t("verify_email.verify_button")}
                  </I18nText>
                )}
              </TouchableOpacity>
            )}

            {/* Send/Resend OTP button */}
            <TouchableOpacity
              style={[
                styles.button,
                emailSent ? styles.secondaryButton : styles.primaryButton,
              ]}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner isSmall={true} isWhite={!emailSent} />
              ) : (
                <View style={styles.buttonContent}>
                  <I18nText
                    style={[
                      styles.buttonText,
                      emailSent && styles.secondaryButtonText,
                    ]}
                  >
                    {emailSent
                      ? t("verify_email.resend_button")
                      : t("verify_email.send_button")}
                  </I18nText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Help text */}
          <I18nText style={styles.helpText}>{t("verify_email.help_text")}</I18nText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  innerContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkWhite,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  emailContainer: {
    backgroundColor: COLORS.grey,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  emailText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  statusContainer: {
    marginVertical: 16,
    width: "100%",
  },
  instructionsContainer: {
    backgroundColor: COLORS.grey,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: "100%",
  },
  instructionsText: {
    color: COLORS.darkWhite,
    fontSize: 14,
    textAlign: "center",
  },
  otpContainer: {
    width: "100%",
    marginBottom: 24,
  },
  otpLabel: {
    color: COLORS.darkWhite,
    fontSize: 14,
    marginBottom: 8,
  },
  otpInput: {
    backgroundColor: COLORS.grey,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: COLORS.white,
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "600",
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.lightGrey,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: COLORS.grey,
  },
  helpText: {
    color: COLORS.darkWhite,
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 20,
  },
});

export default VerifyEmail;
