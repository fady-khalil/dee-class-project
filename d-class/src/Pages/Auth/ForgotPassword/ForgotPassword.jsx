import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";
import { EnvelopeSimple, Lock, Key, ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const { postData, isLoading } = usePostData();

  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(t("forgot_password.email_invalid"));
      return;
    }

    try {
      const response = await postData("auth/request-password-reset", { email });

      if (response.success) {
        setSuccessMessage(t("forgot_password.otp_sent"));
        setStep(2);
      } else {
        setErrorMessage(response.message || t("forgot_password.request_error"));
      }
    } catch (error) {
      setErrorMessage(t("forgot_password.request_error"));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp || otp.length < 4) {
      setErrorMessage(t("forgot_password.otp_invalid"));
      return;
    }

    try {
      const response = await postData("auth/verify-reset-code", { email, code: otp });

      if (response.success) {
        setSuccessMessage(t("forgot_password.otp_verified"));
        setStep(3);
      } else {
        setErrorMessage(response.message || t("forgot_password.otp_error"));
      }
    } catch (error) {
      setErrorMessage(t("forgot_password.otp_error"));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 8) {
      setErrorMessage(t("forgot_password.password_short"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t("forgot_password.password_mismatch"));
      return;
    }

    try {
      const response = await postData("auth/reset-password", {
        email,
        code: otp,
        newPassword,
        confirmPassword,
      });

      if (response.success) {
        setSuccessMessage(t("forgot_password.reset_success"));
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrorMessage(response.message || t("forgot_password.reset_error"));
      }
    } catch (error) {
      setErrorMessage(t("forgot_password.reset_error"));
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

        {/* Forgot Password Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              {step === 1 && <EnvelopeSimple size={40} className="text-primary" />}
              {step === 2 && <Key size={40} className="text-primary" />}
              {step === 3 && <Lock size={40} className="text-primary" />}
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {t("forgot_password.title")}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === 1 && t("forgot_password.step1_desc")}
              {step === 2 && t("forgot_password.step2_desc")}
              {step === 3 && t("forgot_password.step3_desc")}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  s <= step ? "bg-primary" : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
              {errorMessage}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="relative">
                <div
                  className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
                >
                  <EnvelopeSimple size={20} />
                </div>
                <input
                  type="email"
                  placeholder={t("forgot_password.email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-bg/50 border border-gray-600 text-white py-3.5 ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}
                    rounded-xl placeholder:text-gray-500 placeholder:text-sm
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                    transition-all duration-300`}
                />
              </div>

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
                  t("forgot_password.send_code")
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={t("forgot_password.otp_placeholder")}
                  className="w-full bg-bg/50 border border-gray-600 text-white py-4 px-4
                    rounded-xl placeholder:text-gray-500
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                    transition-all duration-300 text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                />
              </div>

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
                  t("forgot_password.verify_code")
                )}
              </button>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium
                  transition-all duration-300 text-sm"
              >
                {t("forgot_password.resend_code")}
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="relative">
                <div
                  className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
                >
                  <Lock size={20} />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t("forgot_password.new_password_placeholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full bg-bg/50 border border-gray-600 text-white py-3.5 ${inputPadding}
                    rounded-xl placeholder:text-gray-500 placeholder:text-sm
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                    transition-all duration-300`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute ${togglePosition} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors`}
                >
                  {showNewPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <div
                  className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
                >
                  <Lock size={20} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("forgot_password.confirm_password_placeholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-bg/50 border border-gray-600 text-white py-3.5 ${inputPadding}
                    rounded-xl placeholder:text-gray-500 placeholder:text-sm
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                    transition-all duration-300`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute ${togglePosition} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors`}
                >
                  {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>

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
                  t("forgot_password.reset_password")
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-gray-400 hover:text-primary text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
              {t("forgot_password.back_to_login")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
