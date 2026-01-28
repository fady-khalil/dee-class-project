import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Input, PasswordInput, useInput } from "../../components/form";
import {
  StatusHandler,
  useStatusHandler,
} from "../../components/RequestHandler";
import Spinner from "../../components/RequestHandler/Spinner";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import { usePostData } from "../../Hooks/usePostData";
import COLORS from "../../styles/colors";
import { GlobalStyle } from "../../styles/GlobalStyle";
import {
  I18nText,
  I18nView,
} from "../../components/common/I18nComponents";
import usePostDataNoLang from "../../Hooks/usePostDataNoLang";
import { HeaderBack } from "../../components/navigation";

const Register = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { plan_id, is_register, course_id } = route.params || {};
  const { postData: postDataNoLang, isLoading: isPostLoading } =
    usePostDataNoLang();
  const { loginHandler } = useContext(LoginAuthContext);
  const [isClicked, setIsClicked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validatePassword, setValidatePassword] = useState(false);
  const { postData, isLoading } = usePostData();
  const {
    isVisible,
    status,
    message,
    showSuccess,
    showError,
    hideStatus,
    messages,
  } = useStatusHandler();

  // Email validation with regex
  const {
    value: emailInput,
    isValid: emailIsValid,
    hasError: emailHasError,
    inputChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
    inputFocusHandler: emailFocusHandler,
    isFocus: emailIsFocus,
    reset: emailReset,
  } = useInput((value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  });

  // Password validation (min 8 characters)
  const {
    value: passwordInput,
    isValid: passwordIsValid,
    hasError: passwordHasError,
    inputChangeHandler: passwordChangeHandler,
    inputBlurHandler: passwordBlurHandler,
    inputFocusHandler: passwordFocusHandler,
    isFocus: passwordIsFocus,
    reset: passwordReset,
  } = useInput((value) => value.trim().length >= 8);

  // Continue button handler for email step
  const handleContinueClick = () => {
    setIsClicked(true);
    if (emailIsValid) {
      setShowPassword(true);
      setIsClicked(false);
    }
  };

  // Signup handler for password step
  const handleSignUp = async () => {
    setValidatePassword(true);
    if (!passwordIsValid) {
      showError(t("forms.errors.validation_error"));
      return;
    }

    const userData = {
      email: emailInput,
      password: passwordInput,
    };

    try {
      const response = await postData("auth/register", userData);

      console.log(response?.success, "response from register");
      console.log(response?.data, "response from register");

      if (response.success) {
        const userData = response.data?.user;
        const token = response.data?.token;

        showSuccess(t("auth.register.success"));

        // Store basic auth data
        loginHandler(token, userData, false, [], []);

        // Handle different navigation based on registration context
        if (is_register && plan_id) {
          try {
            // Use Expo Linking to create proper deep link URLs
            // Note: We manually append session_id placeholder to avoid URL encoding
            const baseSuccessUrl = Linking.createURL("payment/success");
            const successUrl = `${baseSuccessUrl}?session_id={CHECKOUT_SESSION_ID}&type=plan`;
            const cancelUrl = Linking.createURL("payment/cancel");

            // Create payment session for the plan
            const paymentResponse = await postDataNoLang(
              "create-checkout-session",
              {
                type: "package",
                user_id: userData?._id,
                id: plan_id,
                source: "application",
                // Deep link URLs for mobile app
                success_url: successUrl,
                cancel_url: cancelUrl,
              }
            );

            console.log("paymentResponse", paymentResponse?.status);
            console.log("Payment data:", paymentResponse?.data);
            console.log("Success URL:", successUrl);

            if (paymentResponse?.status === 200 && paymentResponse?.data?.checkout_url) {
              console.log(
                "Opening checkout URL:",
                paymentResponse.data.checkout_url
              );
              Linking.openURL(paymentResponse.data.checkout_url);
            }
          } catch (error) {
            showError("Payment process failed");
          }
        } else {
          // Navigate to verify email screen for new registrations
          navigation.navigate("VerifyEmail", { email: emailInput });
        }
      } else {
        showError(response.message || t("auth.register.error"));
      }
    } catch (error) {
      console.log(error, "form the fetch");
      showError(error.message || "api.network.error");
    }
  };

  return (
    <View style={styles.rootContainer}>
      <HeaderBack
        screenName="register"
        hideBackButton={!navigation.canGoBack()}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[GlobalStyle.container, styles.innerContainer]}>
          <I18nText style={styles.title}>{t("general.auth_title")}</I18nText>
          <I18nText style={styles.subtitle}>
            {t("general.auth_subtitle")}
          </I18nText>

          <View style={styles.statusContainer}>
            <StatusHandler
              isVisible={isVisible}
              status={status}
              message={message}
              hideStatus={hideStatus}
              messages={messages}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>
                {t("forms.inputs.email_label")}
              </Text>
            </View>
            <Input
              isWhite={true}
              placeholder={t("forms.inputs.email")}
              value={emailInput}
              onChange={emailChangeHandler}
              onBlur={emailBlurHandler}
              onFocus={emailFocusHandler}
              hasError={(isClicked && !emailIsValid) || emailHasError}
              errorMessage={t("forms.errors.email")}
              keyboardType="email-address"
            />
          </View>

          {showPassword && (
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.inputLabel}>
                  {t("forms.inputs.password_label")}
                </Text>
              </View>
              <PasswordInput
                isWhite={true}
                placeholder={t("forms.inputs.password")}
                value={passwordInput}
                onChange={passwordChangeHandler}
                onBlur={passwordBlurHandler}
                onFocus={passwordFocusHandler}
                hasError={
                  (validatePassword && !passwordIsValid) || passwordHasError
                }
                errorMessage={t("forms.errors.general")}
              />
            </View>
          )}

          <I18nView style={styles.termsContainer}>
            <Text style={styles.termsText}>
              {t("general.agreement_start")}{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Terms")}>
              <Text style={styles.termsLink}>{t("general.terms")}</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> {t("general.and")} </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Privacy")}>
              <Text style={styles.termsLink}>{t("general.privacy")}</Text>
            </TouchableOpacity>
          </I18nView>

          <TouchableOpacity
            style={styles.button}
            onPress={showPassword ? handleSignUp : handleContinueClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner isSmall={true} isWhite={true} />
            ) : (
              <I18nText style={styles.buttonText}>
                {showPassword
                  ? t("buttons.finish_sign_up")
                  : t("buttons.continue_with_email")}
              </I18nText>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <I18nText style={styles.loginText}>
              {" "}
              {t("general.already_have_account")}
            </I18nText>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Login", { plan_id, is_register })
              }
            >
              <I18nText style={styles.loginLink}>{t("general.login")}</I18nText>
            </TouchableOpacity>
          </View>
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkWhite,
    textAlign: "center",
    marginBottom: 32,
  },
  statusContainer: {
    marginVertical: 16,
    width: "100%",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  labelContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  inputLabel: {
    fontSize: 16,
    color: COLORS.darkWhite,
    marginBottom: 8,
    fontWeight: "500",
  },
  termsContainer: {
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  termsText: {
    color: COLORS.darkWhite,
    fontSize: 16,
    textAlign: "center",
  },
  termsLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    marginTop: 24,
    flexDirection: "row",
  },
  loginText: {
    color: COLORS.darkWhite,
    fontSize: 16,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Register;
