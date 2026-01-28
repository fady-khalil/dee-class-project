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
import { HeaderBack } from "../../components/navigation";
import usePostDataNoLang from "../../Hooks/usePostDataNoLang";

const Login = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { plan_id, is_register } = route.params || {};
  const { loginHandler, user } = useContext(LoginAuthContext);
  const [isClicked, setIsClicked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validatePassword, setValidatePassword] = useState(false);
  const { postData, isLoading } = usePostData();
  const { postData: postDataNoLang, isLoading: isPostLoading } =
    usePostDataNoLang();

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

  // Login handler for password step
  const handleLogin = async () => {
    setValidatePassword(true);
    if (!passwordIsValid) {
      showError(t("forms.validation.validation_error"));
      return;
    }

    const userData = {
      email: emailInput,
      password: passwordInput,
    };

    try {
      const response = await postData("auth/login", userData);

      if (response.success) {
        const userData = response.data?.user;
        const token = response.data?.token;
        const profiles = userData?.profiles || [];
        const hasActiveSubscription = userData?.hasActiveSubscription || false;
        const allowedProfiles = userData?.allowedProfiles || 0;
        const purchasedCourses = userData?.purchasedItems?.courses?.map(c => c.courseId || c._id) || [];
        const isVerified = userData?.verified;

        // Check if user is verified
        if (!isVerified) {
          // Store token and user temporarily for verification flow
          loginHandler(token, userData, false, purchasedCourses, profiles);
          navigation.navigate("VerifyEmail", { email: emailInput });
          return;
        }

        showSuccess(t("auth.login.success"));

        // Login with full user data
        loginHandler(
          token,
          userData,
          hasActiveSubscription && allowedProfiles > 0,
          purchasedCourses,
          profiles
        );

        // Handle payment if needed (similar logic to web version)
        if (plan_id && is_register) {
          console.log("Creating payment session for plan:", plan_id);
          console.log("User ID:", userData?._id);
          try {
            // Use Expo Linking to create proper deep link URLs
            // Note: We manually append session_id placeholder to avoid URL encoding
            const baseSuccessUrl = Linking.createURL("payment/success");
            const successUrl = `${baseSuccessUrl}?session_id={CHECKOUT_SESSION_ID}&type=plan`;
            const cancelUrl = Linking.createURL("payment/cancel");

            const paymentResponse = await postDataNoLang("create-checkout-session", {
              type: "package",
              user_id: userData?._id,
              id: plan_id,
              source: "application",
              // Deep link URLs for mobile app
              success_url: successUrl,
              cancel_url: cancelUrl,
            });

            if (paymentResponse?.status === 200 && paymentResponse?.data?.checkout_url) {
              Linking.openURL(paymentResponse.data.checkout_url);
            }
          } catch (error) {
            showError("Payment process failed");
          }
        } else {
          // Normal navigation flow
          emailReset();
          passwordReset();

          if (hasActiveSubscription && profiles.length > 0) {
            navigation.navigate("MyProfiles");
          } else if (purchasedCourses.length > 0) {
            navigation.navigate("MyCourses");
          } else {
            navigation.navigate("Main");
          }
        }
      } else {
        showError(response.message || t("auth.login.error"));
      }
    } catch (error) {
      console.log(error);
      showError(error.message || "api.network.error");
    }
  };

  return (
    <View style={styles.rootContainer}>
      <HeaderBack screenName="login" hideBackButton={!navigation.canGoBack()} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[GlobalStyle.container, styles.innerContainer]}>
          <Text style={styles.title}>{t("general.login_title")}</Text>
          <Text style={styles.subtitle}>{t("general.login_subtitle")}</Text>

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

          <TouchableOpacity
            style={styles.button}
            onPress={showPassword ? handleLogin : handleContinueClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner isSmall={true} isWhite={true} />
            ) : (
              <Text style={styles.buttonText}>
                {showPassword
                  ? t("general.login")
                  : t("buttons.continue_with_email")}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>{t("general.new_here")} </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  "Register",
                  plan_id ? { plan_id, is_register } : undefined
                )
              }
            >
              <Text style={styles.registerLink}>
                {t("general.create_account")}
              </Text>
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
    alignItems: "flex-start",
    justifyContent: "flex-start",
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
    textAlign: "start",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
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
  registerContainer: {
    justifyContent: "center",
    marginTop: 24,
    flexWrap: "wrap",
  },
  registerText: {
    color: COLORS.darkWhite,
    fontSize: 16,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Login;
