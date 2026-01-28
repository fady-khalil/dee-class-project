import React, { useState, useContext } from "react";
import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Input from "Components/form/Inputs/Input";
import PasswordInput from "Components/form/Inputs/PasswordInput";
import useInput from "Components/form/Hooks/user-input";
import GoogleAuth from "./GoogleAuth";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";
import { StatusHandler, useStatusHandler } from "Components/RequestHandler";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";

const Register = () => {
  const { t } = useTranslation();
  const { loginHandler } = useContext(LoginAuthContext);
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validatePassword, setValidatePassword] = useState(false);
  const { postData, isLoading } = usePostData();
  const { isVisible, status, message, showSuccess, showError, hideStatus } =
    useStatusHandler();

  const {
    value: emailInput,
    isValid: emailIsValid,
    hasError: emailHasError,
    inputChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
    inputFocusHandler: emailFocusHanlder,
    isFocus: emailIsFocus,
    reset: emailReset,
  } = useInput((value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  });
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

  const handleAuthSuccess = (data) => {
    showSuccess("auth.register.success");
    // Handle successful authentication (e.g., redirect, update UI, etc.)
  };

  const handleContinueClick = () => {
    setIsClicked(true);
    if (emailIsValid) {
      setShowPassword(true);
      setIsClicked(false);
    }
  };

  const handleSignUp = async () => {
    setValidatePassword(true);
    if (!passwordIsValid) {
      showError("form.validation.error");
      return;
    }

    const userData = {
      email: emailInput,
      password: passwordInput,
    };

    try {
      const response = await postData("auth/register", userData);

      console.log("=== REGISTER DEBUG ===");
      console.log("Response:", response);

      if (response.success) {
        showSuccess(response.message);
        // Backend returns { token, user } - user has: _id, email, verified
        loginHandler(response.data?.token, response.data?.user);

        // After registration, redirect to verify email page
        navigate("/verify-email");
      } else {
        showError(response.message);
      }
    } catch (error) {
      console.log("Register error:", error);
      showError(error.message);
    }
  };

  return (
    <main className="py-primary min-h-screen md:min-h-0">
      <Container>
        <div className="w-full sm:w-4/5 md:w-3/4 lg:w-1/2 mx-auto flex flex-col items-center justify-center bg-white py-8 sm:py-10 px-4 sm:px-6 md:px-2 rounded-xl shadow-sm md:shadow-none">
          <h1 className="text-xl sm:text-2xl font-bold text-center md:text-left">
            {t("general.auth_title")}
          </h1>
          <p className="text-center md:text-left text-sm text-gray-600">
            {t("general.auth_subtitle")}
          </p>
          <div className="mt-6 w-full sm:w-auto">
            <StatusHandler
              status={status}
              message={message}
              isVisible={isVisible}
              onClose={hideStatus}
            />
          </div>
          <div className="mt-6 flex items-center justify-center gap-4">
            <GoogleAuth onSuccess={handleAuthSuccess} />
            {/* <AppleAuth onSuccess={handleAuthSuccess} />/ */}
          </div>

          <div className="w-full sm:w-3/4 mt-8 sm:mt-10 px-1">
            <label className="text-sm text-gray-600 mb-2 block">
              {t("forms.inputs.email_label")}
            </label>
            <Input
              isWhite={true}
              label={t("forms.inputs.email_label")}
              placeholder={t("forms.inputs.email")}
              value={emailInput}
              onChange={(event) => {
                emailChangeHandler(event);
              }}
              onBlur={emailBlurHandler}
              hasError={(isClicked && !emailIsValid) || emailHasError}
              errorMessage="Enter a valid email address"
            />
          </div>

          {showPassword && (
            <div className="w-full sm:w-3/4 my-6 px-1">
              <label className="text-sm text-gray-600 mb-2 block">
                {t("forms.inputs.password_label")}
              </label>
              <PasswordInput
                isWhite={true}
                type="password"
                label={t("forms.inputs.password_label")}
                placeholder={t("forms.inputs.password")}
                value={passwordInput}
                onChange={(event) => {
                  passwordChangeHandler(event);
                }}
                onBlur={passwordBlurHandler}
                hasError={
                  (validatePassword && !passwordIsValid) || passwordHasError
                }
                errorMessage="Password must be at least 8 characters"
              />
            </div>
          )}

          <div className="w-full sm:w-3/4 mt-8 sm:mt-10 text-center px-1">
            <p className="text-sm text-gray-600">
              {t("general.agreement_start")}{" "}
              <Link to="/terms" className="text-primary hover:underline">
                {t("general.terms")}
              </Link>{" "}
              {t("general.and")}{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                {t("general.privacy")}
              </Link>
              .
            </p>
          </div>

          <button
            className="w-full sm:w-3/4 mt-8 sm:mt-10 py-3 px-4 bg-primary hover:bg-darkPrimary transition ease-in-out duration-300 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            onClick={showPassword ? handleSignUp : handleContinueClick}
          >
            {isLoading ? (
              <Spinner isSmall={true} isWhite={true} />
            ) : showPassword ? (
              t("buttons.finish_sign_up")
            ) : (
              t("buttons.continue_with_email")
            )}
          </button>

          <div className="w-full sm:w-3/4 mx-auto text-center mt-4 px-1">
            <p className="text-sm text-gray-600">
              {t("general.already_have_account")}{" "}
              <Link to="/login" className="text-primary hover:underline">
                {t("general.login")}
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default Register;
