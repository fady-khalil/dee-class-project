import React, { useState, useContext, useEffect, useCallback } from "react";
import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";
import { StatusHandler, useStatusHandler } from "Components/RequestHandler";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { EnvelopeSimple } from "@phosphor-icons/react";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token, isVerified, setIsVerifiedHandler } = useContext(LoginAuthContext);
  const { postData, isLoading } = usePostData();
  const { isVisible, status, message, showSuccess, showError, hideStatus } =
    useStatusHandler();
  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

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

    // DEBUG
    console.log("=== SEND VERIFICATION DEBUG ===");
    console.log("Email:", email);

    if (!email) {
      console.log("ERROR: No email found");
      showError(t("verify_email.send_error"));
      return;
    }

    try {
      // Backend endpoint: auth/send-verification
      console.log("Calling auth/send-verification with:", { email });
      const response = await postData("auth/send-verification", { email });
      console.log("Response:", response);

      if (response.success) {
        setEmailSent(true);
        showSuccess(t("verify_email.send_success"));
      } else {
        console.log("API Error:", response.message);
        showError(response.message || t("verify_email.send_error"));
      }
    } catch (error) {
      console.log("Catch Error:", error);
      showError(t("verify_email.send_error"));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      showError(t("verify_email.otp_required"));
      return;
    }

    const email = getUserEmail();

    // DEBUG
    console.log("=== VERIFY EMAIL DEBUG ===");
    console.log("Email:", email);
    console.log("Code:", otp);

    setIsVerifying(true);
    try {
      // Backend expects { email, code } - not { email, otp }
      const payload = { email, code: otp };
      console.log("Payload:", payload);

      // Backend endpoint: auth/verify-email
      const response = await postData("auth/verify-email", payload);
      console.log("Response:", response);

      if (response.success) {
        setIsVerifiedHandler(true);
        showSuccess(t("verify_email.verified_success"));
        setTimeout(() => {
          navigate("/plans");
        }, 1500);
      } else {
        console.log("API Error:", response.message, response);
        showError(response.message || t("verify_email.verify_error"));
      }
    } catch (error) {
      console.log("Catch Error:", error);
      showError(t("verify_email.verify_error"));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="py-primary min-h-screen md:min-h-0">
      <Container>
        <div className="w-full sm:w-4/5 md:w-3/4 lg:w-1/2 mx-auto flex flex-col items-center justify-center bg-white py-8 sm:py-10 px-4 sm:px-6 md:px-8 rounded-xl shadow-sm md:shadow-none">
          {/* Icon */}
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <EnvelopeSimple size={40} className="text-primary" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
            {t("verify_email.title")}
          </h1>

          <p className="text-center text-sm text-gray-600 mt-2 mb-6">
            {t("verify_email.description")}
          </p>

          {/* User email display */}
          {user?.email && (
            <div className="bg-gray-100 px-4 py-2 rounded-lg mb-6">
              <p className="text-sm text-gray-700 font-medium">{user.email}</p>
            </div>
          )}

          <div className="mt-4 w-full sm:w-auto">
            <StatusHandler
              status={status}
              message={message}
              isVisible={isVisible}
              onClose={hideStatus}
            />
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full">
            <p className="text-sm text-gray-600 text-center">
              {emailSent ? t("verify_email.otp_instructions") : t("verify_email.instructions")}
            </p>
          </div>

          {/* OTP Input - shown after email is sent */}
          {emailSent && (
            <div className="w-full sm:w-3/4 mb-4">
              <label className="text-sm text-gray-600 mb-2 block">
                {t("verify_email.otp_label")}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("verify_email.otp_placeholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className={`flex gap-3 w-full sm:w-auto ${emailSent ? "flex-row" : "flex-col"}`}>
            {/* Verify OTP button - shown after email is sent */}
            {emailSent && (
              <button
                className="flex-1 sm:flex-none px-6 py-3 bg-primary hover:bg-darkPrimary text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center"
                onClick={handleVerifyOtp}
                disabled={isVerifying || !otp}
              >
                {isVerifying ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  t("verify_email.verify_button")
                )}
              </button>
            )}

            {/* Send/Resend OTP button */}
            <button
              className={`flex-1 sm:flex-none px-6 py-3 font-semibold rounded-lg transition duration-200 flex items-center justify-center ${
                emailSent
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  : "bg-primary hover:bg-darkPrimary text-white"
              }`}
              onClick={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner isSmall={true} isWhite={!emailSent} />
              ) : (
                <>
                  <EnvelopeSimple size={20} className="mr-2" />
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
      </Container>
    </main>
  );
};

export default VerifyEmail;
