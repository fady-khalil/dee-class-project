import React, { useState, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import usePostData from "Hooks/usePostData";
import usePostDataNoLang from "Hooks/usePostDataNoLang";
import Spinner from "Components/RequestHandler/Spinner";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { EnvelopeSimple, Gift } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const GiftVerifyEmail = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, giftCode, planInfo } = location.state || {};
  const { loginHandler, user, token } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  const { postData } = usePostData();
  const { postData: postDataNoLang } = usePostDataNoLang();

  // Redirect if no email or gift code
  if (!email || !giftCode) {
    navigate("/gift");
    return null;
  }

  const handleCodeChange = (index, value) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setErrorMessage(t("verify_email.enter_code"));
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const response = await postData("auth/verify-email", {
        email: email,
        code: verificationCode,
      });

      if (response.success) {
        // Now redeem the gift code
        setIsRedeeming(true);

        const userId = user?._id || user?.id;
        const redeemResponse = await postDataNoLang("gift/redeem", {
          code: giftCode,
          user_id: userId,
        });

        if (redeemResponse?.success) {
          // Update auth context with new subscription data
          const newAllowedProfiles = redeemResponse.data?.subscription?.profilesAllowed || 1;

          loginHandler(
            token,
            { ...user, verified: true, subscription: redeemResponse.data?.subscription },
            newAllowedProfiles,
            [],
            user?.profiles || []
          );

          // Navigate to success
          navigate("/gift/success", {
            state: { planInfo }
          });
        } else {
          setErrorMessage(redeemResponse?.message || t("gift.redeem_error"));
        }
        setIsRedeeming(false);
      } else {
        setErrorMessage(response.message || t("verify_email.invalid_code"));
      }
    } catch (error) {
      setErrorMessage(t("verify_email.error"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage("");

    try {
      const response = await postData("auth/resend-verification", {
        email: email,
      });

      if (!response.success) {
        setErrorMessage(response.message || t("verify_email.resend_error"));
      }
    } catch (error) {
      setErrorMessage(t("verify_email.resend_error"));
    } finally {
      setIsResending(false);
    }
  };

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

        {/* Verify Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <EnvelopeSimple size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t("verify_email.title")}
            </h1>
            <p className="text-gray-400 text-sm">
              {t("verify_email.subtitle")} {email}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
              {errorMessage}
            </div>
          )}

          {/* Code Input */}
          <div className="flex justify-center gap-2 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value.slice(-1))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-bg/50 border border-gray-600 text-white text-center text-xl font-bold
                  rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                  transition-all duration-300"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isVerifying || isRedeeming}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 px-6 rounded-xl font-semibold
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {isVerifying || isRedeeming ? (
              <>
                <Spinner isSmall={true} isWhite={true} />
                <span>{isRedeeming ? t("gift.activating") : t("verify_email.verifying")}</span>
              </>
            ) : (
              t("gift.verify_and_activate")
            )}
          </button>

          {/* Resend Link */}
          <div className="text-center mt-6">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-gray-400 text-sm hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {isResending ? (
                <Spinner isSmall={true} />
              ) : (
                <>
                  {t("verify_email.didnt_receive")}{" "}
                  <span className="text-primary">{t("verify_email.resend")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GiftVerifyEmail;
