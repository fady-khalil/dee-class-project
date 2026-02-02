import React, { useState, useContext, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { EnvelopeSimple, PaperPlaneTilt, ShieldCheck } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const VerifyEmail = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const { user, token, isVerified, setIsVerifiedHandler } = useContext(LoginAuthContext);
  const { postData, isLoading } = usePostData();

  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Get token from context or localStorage
  const getToken = useCallback(() => {
    return token || localStorage.getItem("token");
  }, [token]);

  // If already verified, redirect to plans
  useEffect(() => {
    if (isVerified) {
      navigate("/plans");
    }
  }, [isVerified, navigate]);

  // If not logged in, redirect to register
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const hasUserInContext = user || token;
      const hasUserInStorage = storedToken || storedUser;

      if (!hasUserInContext && !hasUserInStorage) {
        navigate("/register");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, token, navigate]);

  // Get user email from context or localStorage
  const getUserEmail = useCallback(() => {
    if (user?.email) return user.email;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed?.email;
      } catch {
        return null;
      }
    }
    return null;
  }, [user]);

  const handleSendOtp = async () => {
    const email = getUserEmail();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage(t("verify_email.send_error"));
      return;
    }

    try {
      const response = await postData("auth/send-verification", { email });

      if (response.success) {
        setEmailSent(true);
        setSuccessMessage(t("verify_email.send_success"));
      } else {
        setErrorMessage(response.message || t("verify_email.send_error"));
      }
    } catch (error) {
      setErrorMessage(t("verify_email.send_error"));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setErrorMessage(t("verify_email.otp_required"));
      return;
    }

    const email = getUserEmail();
    setErrorMessage("");
    setSuccessMessage("");
    setIsVerifying(true);

    try {
      const payload = { email, code: otp };
      const response = await postData("auth/verify-email", payload);

      if (response.success) {
        setIsVerifiedHandler(true);
        setSuccessMessage(t("verify_email.verified_success"));
        setTimeout(() => {
          navigate("/plans");
        }, 1500);
      } else {
        setErrorMessage(response.message || t("verify_email.verify_error"));
      }
    } catch (error) {
      setErrorMessage(t("verify_email.verify_error"));
    } finally {
      setIsVerifying(false);
    }
  };

  const userEmail = getUserEmail();

  return (
    <main className="min-h-screen bg-gradient-to-br from-bg via-grey to-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={logo} alt="Dee Class" className="h-12" />
          </Link>
        </div>

        {/* Verify Email Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              {emailSent ? (
                <ShieldCheck size={40} className="text-primary" />
              ) : (
                <EnvelopeSimple size={40} className="text-primary" />
              )}
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {t("verify_email.title")}
            </h1>
            <p className="text-gray-400 text-sm">
              {t("verify_email.description")}
            </p>
          </div>

          {/* User email display */}
          {userEmail && (
            <div className="bg-bg/50 border border-gray-600 px-4 py-3 rounded-xl mb-6 text-center">
              <p className="text-white font-medium">{userEmail}</p>
            </div>
          )}

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

          {/* Instructions */}
          <div className="bg-bg/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-400 text-center">
              {emailSent ? t("verify_email.otp_instructions") : t("verify_email.instructions")}
            </p>
          </div>

          {/* OTP Input - shown after email is sent */}
          {emailSent && (
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block text-center">
                {t("verify_email.otp_label")}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("verify_email.otp_placeholder")}
                className="w-full bg-bg/50 border border-gray-600 text-white py-4 px-4
                  rounded-xl placeholder:text-gray-500
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                  transition-all duration-300 text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Verify OTP button - shown after email is sent */}
            {emailSent && (
              <button
                className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 px-6 rounded-xl font-semibold
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
                onClick={handleVerifyOtp}
                disabled={isVerifying || !otp}
              >
                {isVerifying ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    {t("verify_email.verify_button")}
                  </>
                )}
              </button>
            )}

            {/* Send/Resend OTP button */}
            <button
              className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-300
                flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${emailSent
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
                }`}
              onClick={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner isSmall={true} isWhite={true} />
              ) : (
                <>
                  <PaperPlaneTilt size={20} />
                  {emailSent ? t("verify_email.resend_button") : t("verify_email.send_button")}
                </>
              )}
            </button>
          </div>

          {/* Help text */}
          <p className="text-xs text-gray-500 mt-6 text-center">
            {t("verify_email.help_text")}
          </p>
        </div>
      </div>
    </main>
  );
};

export default VerifyEmail;
