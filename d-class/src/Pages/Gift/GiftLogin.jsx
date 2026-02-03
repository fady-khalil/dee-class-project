import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useInput from "Components/form/Hooks/user-input";
import usePostData from "Hooks/usePostData";
import usePostDataNoLang from "Hooks/usePostDataNoLang";
import Spinner from "Components/RequestHandler/Spinner";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { EnvelopeSimple, Lock, Eye, EyeSlash, Gift } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const GiftLogin = () => {
  const { t, i18n } = useTranslation();
  const { loginHandler } = useContext(LoginAuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { giftCode, planInfo } = location.state || {};
  const isRTL = i18n.language === "ar";

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const { postData, isLoading } = usePostData();
  const { postData: postDataNoLang } = usePostDataNoLang();

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

  // Redirect if no gift code
  if (!giftCode) {
    navigate("/gift");
    return null;
  }

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
        const token = response.data?.token;
        const userIsVerified = user?.verified === true;

        // Login the user
        loginHandler(
          token,
          user,
          user?.allowedProfiles || null,
          user?.purchasedItems?.courses?.map((c) => c.courseId) || [],
          user?.profiles || []
        );

        // If not verified, go to verify email first
        if (!userIsVerified) {
          navigate("/gift/verify-email", {
            state: {
              email: emailInput,
              giftCode,
              planInfo
            }
          });
          return;
        }

        // Redeem the gift code
        setIsRedeeming(true);
        const redeemResponse = await postDataNoLang("gift/redeem", {
          code: giftCode,
          user_id: user._id,
        });

        if (redeemResponse?.success) {
          // Update login with new subscription data
          const newAllowedProfiles = redeemResponse.data?.subscription?.profilesAllowed || 1;
          loginHandler(
            token,
            { ...user, subscription: redeemResponse.data?.subscription },
            newAllowedProfiles,
            user?.purchasedItems?.courses?.map((c) => c.courseId) || [],
            user?.profiles || []
          );

          emailReset();
          passwordReset();
          navigate("/gift/success", {
            state: { planInfo }
          });
        } else {
          setErrorMessage(redeemResponse?.message || t("gift.redeem_error"));
        }
        setIsRedeeming(false);
      } else {
        setErrorMessage(response.message || t("auth.login.error"));
      }
    } catch (error) {
      setErrorMessage(t("auth.login.error"));
      setIsRedeeming(false);
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

        {/* Login Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {t("gift.login_to_redeem")}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isRedeeming}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 px-6 rounded-xl font-semibold
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading || isRedeeming ? (
                <>
                  <Spinner isSmall={true} isWhite={true} />
                  {isRedeeming && <span>{t("gift.activating")}</span>}
                </>
              ) : (
                t("gift.login_and_activate")
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link
              to="/gift"
              className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
            >
              {t("gift.use_different_code")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GiftLogin;
