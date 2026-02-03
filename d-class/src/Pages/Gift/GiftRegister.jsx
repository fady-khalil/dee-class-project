import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useInput from "Components/form/Hooks/user-input";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { EnvelopeSimple, Lock, Eye, EyeSlash, Gift } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const GiftRegister = () => {
  const { t, i18n } = useTranslation();
  const { loginHandler } = useContext(LoginAuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { giftCode, planInfo } = location.state || {};
  const isRTL = i18n.language === "ar";

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { postData, isLoading } = usePostData();

  const {
    value: emailInput,
    isValid: emailIsValid,
    hasError: emailHasError,
    inputChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
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
  } = useInput((value) => value.trim().length >= 8);

  const {
    value: confirmPasswordInput,
    isValid: confirmPasswordIsValid,
    hasError: confirmPasswordHasError,
    inputChangeHandler: confirmPasswordChangeHandler,
    inputBlurHandler: confirmPasswordBlurHandler,
  } = useInput((value) => value === passwordInput && value.trim().length >= 8);

  const formIsValid = emailIsValid && passwordIsValid && confirmPasswordIsValid;

  // Redirect if no gift code
  if (!giftCode) {
    navigate("/gift");
    return null;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
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

        // Login the user (not verified yet)
        loginHandler(
          token,
          user,
          null,
          [],
          []
        );

        // Navigate to email verification with gift code
        navigate("/gift/verify-email", {
          state: {
            email: emailInput,
            giftCode,
            planInfo
          }
        });
      } else {
        setErrorMessage(response.message || t("auth.register.error"));
      }
    } catch (error) {
      setErrorMessage(t("auth.register.error"));
    }
  };

  const iconPosition = isRTL ? "right-4" : "left-4";
  const togglePosition = isRTL ? "left-4" : "right-4";
  const inputPadding = isRTL ? "pr-12 pl-12" : "pl-12 pr-12";

  return (
    <main className="min-h-screen bg-gradient-to-br from-bg via-grey to-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Link to="/">
            <img src={logo} alt="Dee Class" className="h-12" />
          </Link>
        </div>

        {/* Gift Banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
          <Gift size={20} className="text-primary" />
          <span className="text-primary text-sm font-medium">
            {t("gift.redeeming")}: {isRTL ? planInfo?.plan?.title_ar : planInfo?.plan?.title}
          </span>
        </div>

        {/* Register Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {t("gift.register_to_redeem")}
            </h1>
            <p className="text-gray-400 text-sm">
              {t("auth.register.subtitle")}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <div
                className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
              >
                <EnvelopeSimple size={20} />
              </div>
              <input
                type="email"
                placeholder={t("auth.register.emailPlaceholder")}
                value={emailInput}
                onChange={emailChangeHandler}
                onBlur={emailBlurHandler}
                className={`w-full bg-bg/50 border text-white py-3.5 ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}
                  rounded-xl placeholder:text-gray-500 placeholder:text-sm
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                  transition-all duration-300
                  ${(isSubmitted && !emailIsValid) || emailHasError ? "border-red-500" : "border-gray-600"}`}
              />
              {((isSubmitted && !emailIsValid) || emailHasError) && (
                <p className="text-xs text-red-400 mt-1.5">
                  {t("auth.register.emailError")}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div
                className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
              >
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.register.passwordPlaceholder")}
                value={passwordInput}
                onChange={passwordChangeHandler}
                onBlur={passwordBlurHandler}
                className={`w-full bg-bg/50 border text-white py-3.5 ${inputPadding}
                  rounded-xl placeholder:text-gray-500 placeholder:text-sm
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                  transition-all duration-300
                  ${(isSubmitted && !passwordIsValid) || passwordHasError ? "border-red-500" : "border-gray-600"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${togglePosition} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors`}
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
              {((isSubmitted && !passwordIsValid) || passwordHasError) && (
                <p className="text-xs text-red-400 mt-1.5">
                  {t("auth.register.passwordError")}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <div
                className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
              >
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("auth.register.confirmPasswordPlaceholder")}
                value={confirmPasswordInput}
                onChange={confirmPasswordChangeHandler}
                onBlur={confirmPasswordBlurHandler}
                className={`w-full bg-bg/50 border text-white py-3.5 ${inputPadding}
                  rounded-xl placeholder:text-gray-500 placeholder:text-sm
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                  transition-all duration-300
                  ${(isSubmitted && !confirmPasswordIsValid) || confirmPasswordHasError ? "border-red-500" : "border-gray-600"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute ${togglePosition} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors`}
              >
                {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
              {((isSubmitted && !confirmPasswordIsValid) || confirmPasswordHasError) && (
                <p className="text-xs text-red-400 mt-1.5">
                  {t("auth.register.passwordMismatch")}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 px-6 rounded-xl font-semibold
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Spinner isSmall={true} isWhite={true} />
              ) : (
                t("gift.create_and_continue")
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-500 text-sm">{t("auth.login.or")}</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Already have account */}
          <p className="text-center text-gray-400 text-sm">
            {t("auth.register.hasAccount")}{" "}
            <Link
              to="/gift/login"
              state={{ giftCode, planInfo }}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("auth.register.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default GiftRegister;
