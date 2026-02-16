import React, { useState, useContext, useRef } from "react";
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

const GiftVerifyEmail = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { email, giftCode, planInfo } = route.params || {};
  const { loginHandler, user, token } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const inputRefs = useRef([]);

  const { postData, isLoading } = usePostData();
  const { postData: postDataNoLang } = usePostDataNoLang();

  // Send verification email on mount
  React.useEffect(() => {
    const sendCode = async () => {
      if (email && !codeSent) {
        try {
          await postData("auth/send-verification", { email });
          setCodeSent(true);
        } catch (error) {
          console.log("Error sending verification code:", error);
        }
      }
    };
    sendCode();
  }, [email]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move to next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setErrorMessage(t("verify_email.enter_code"));
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const response = await postData("auth/verify-email", {
        email: email,
        code: verificationCode,
      });

      if (response.success) {
        // Now redeem the gift code
        setIsRedeeming(true);

        const userId = user?._id || user?.id;
        const redeemResponse = await postDataNoLang("gift/redeem", {
          code: giftCode,
          user_id: userId,
        });

        if (redeemResponse.success) {
          // Update auth context with new subscription data
          const newAllowedProfiles =
            redeemResponse.data?.subscription?.profilesAllowed || 1;

          loginHandler(
            token,
            {
              ...user,
              verified: true,
              subscription: redeemResponse.data?.subscription,
            },
            newAllowedProfiles,
            [],
            user?.profiles || [],
          );

          // Navigate to success
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "GiftSuccess",
                params: { planInfo: planInfo },
              },
            ],
          });
        } else {
          setErrorMessage(redeemResponse.message || t("gift.redeem_error"));
        }
        setIsRedeeming(false);
      } else {
        setErrorMessage(response.message || t("verify_email.invalid_code"));
      }
    } catch (error) {
      setErrorMessage(t("verify_email.error"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage("");

    try {
      const response = await postData("auth/resend-verification", {
        email: email,
      });

      if (!response.success) {
        setErrorMessage(response.message || t("verify_email.resend_error"));
      }
    } catch (error) {
      setErrorMessage(t("verify_email.resend_error"));
    } finally {
      setIsResending(false);
    }
  };

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

        {/* Gift Info Banner */}
        <View style={styles.giftBanner}>
          <MaterialIcons
            name="card-giftcard"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.giftBannerText}>
            {t("gift.redeeming")}:{" "}
            {isRTL ? planInfo?.plan?.title_ar : planInfo?.plan?.title}
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>{t("verify_email.title")}</Text>
            <Text style={styles.subtitle}>
              {t("verify_email.subtitle")} {email}
            </Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.codeInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (isVerifying || isRedeeming) && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={isVerifying || isRedeeming}
          >
            {isVerifying || isRedeeming ? (
              <View style={styles.loadingContainer}>
                <Spinner isSmall={true} isWhite={true} />
                <Text style={styles.loadingText}>
                  {isRedeeming
                    ? t("gift.activating")
                    : t("verify_email.verifying")}
                </Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                {t("gift.verify_and_activate")}
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend Link */}
          <TouchableOpacity
            style={styles.resendContainer}
            onPress={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <Spinner isSmall={true} />
            ) : (
              <Text style={styles.resendText}>
                {t("verify_email.didnt_receive")}{" "}
                <Text style={styles.resendLink}>
                  {t("verify_email.resend")}
                </Text>
              </Text>
            )}
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
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
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundColor,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
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
  resendContainer: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  resendText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: "500",
  },
});

export default GiftVerifyEmail;
