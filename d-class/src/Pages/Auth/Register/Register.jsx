import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import useInput from "Components/form/Hooks/user-input";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { EnvelopeSimple, Lock, Eye, EyeSlash } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const Register = () => {
  const { t, i18n } = useTranslation();
  const { loginHandler } = useContext(LoginAuthContext);
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { postData, isLoading } = usePostData();

  const {
    value: emailInput,
    isValid: emailIsValid,
    hasError: emailHasError,
    inputChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
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
    reset: passwordReset,
  } = useInput((value) => value.trim().length >= 8);

  const formIsValid = emailIsValid && passwordIsValid;

  const handleSignUp = async (e) => {
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
        loginHandler(response.data?.token, response.data?.user);
        emailReset();
        passwordReset();
        navigate("/verify-email");
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
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={logo} alt="Dee Class" className="h-12" />
          </Link>
        </div>

        {/* Register Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {t("auth.register.title")}
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
          <form onSubmit={handleSignUp} className="space-y-5">
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

            {/* Terms Agreement */}
            <p className="text-xs text-gray-500 text-center">
              {t("auth.register.agreeText")}{" "}
              <Link to="/terms" className="text-primary hover:underline">
                {t("auth.register.terms")}
              </Link>{" "}
              {t("auth.register.and")}{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                {t("auth.register.privacy")}
              </Link>
            </p>

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
                t("auth.register.submit")
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            {t("auth.register.hasAccount")}{" "}
            <Link
              to="/login"
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

export default Register;
