import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import useInput from "Components/form/Hooks/user-input";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import GetPlanModal from "Components/Modal/GetPlanModal";
import { EnvelopeSimple, Lock, Eye, EyeSlash } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const Login = () => {
  const { t, i18n } = useTranslation();
  const { loginHandler } = useContext(LoginAuthContext);
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showGetPlanModal, setShowGetPlanModal] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setErrorMessage("");

    if (!formIsValid) return;

    const userData = {
      email: emailInput,
      password: passwordInput,
    };

    try {
      const response = await postData("auth/login", userData);

      if (response.success) {
        const user = response.data?.user;
        const userIsVerified = user?.verified === true;

        loginHandler(
          response.data?.token,
          user,
          user?.allowedProfiles || null,
          user?.purchasedItems?.courses?.map((c) => c.courseId) || [],
          user?.profiles || []
        );

        if (!userIsVerified) {
          emailReset();
          passwordReset();
          navigate("/verify-email");
          return;
        }

        emailReset();
        passwordReset();

        if (user?.hasActiveSubscription && user?.allowedProfiles > 0) {
          navigate("/my-profiles");
        } else if (user?.purchasedItems?.courses?.length > 0) {
          navigate("/my-courses");
        } else {
          setShowGetPlanModal(true);
        }
      } else {
        setErrorMessage(response.message || t("auth.login.error"));
      }
    } catch (error) {
      setErrorMessage(t("auth.login.error"));
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

        {/* Login Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {t("auth.login.title")}
            </h1>
            <p className="text-gray-400 text-sm">
              {t("auth.login.subtitle")}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <div
                className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
              >
                <EnvelopeSimple size={20} />
              </div>
              <input
                type="email"
                placeholder={t("auth.login.emailPlaceholder")}
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
                  {t("auth.login.emailError")}
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
                placeholder={t("auth.login.passwordPlaceholder")}
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
                  {t("auth.login.passwordError")}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {t("auth.login.forgotPassword")}
              </Link>
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
                t("auth.login.submit")
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-500 text-sm">{t("auth.login.or")}</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-400 text-sm">
            {t("auth.login.noAccount")}{" "}
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("auth.login.createAccount")}
            </Link>
          </p>
        </div>
      </div>

      {/* Get Plan Modal */}
      <GetPlanModal
        isOpen={showGetPlanModal}
        onClose={() => {
          setShowGetPlanModal(false);
          navigate("/");
        }}
      />
    </main>
  );
};

export default Login;
