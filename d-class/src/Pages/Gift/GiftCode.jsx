import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import usePostDataNoLang from "Hooks/usePostDataNoLang";
import Spinner from "Components/RequestHandler/Spinner";
import { Gift, CheckCircle, XCircle } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const GiftCode = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [giftCode, setGiftCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [validatedData, setValidatedData] = useState(null);
  const [error, setError] = useState("");

  const { postData } = usePostDataNoLang();

  const formatGiftCode = (value) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  };

  const handleCodeChange = (e) => {
    const formatted = formatGiftCode(e.target.value);
    setGiftCode(formatted);
    setError("");
    setValidatedData(null);
  };

  const handleCheckCode = async () => {
    if (!giftCode || giftCode.length < 14) {
      setError(t("gift.enter_code"));
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const response = await postData("gift/validate", { code: giftCode });

      if (response?.success && response?.data) {
        setValidatedData(response.data);
      } else {
        setError(response?.message || t("gift.invalid_code"));
      }
    } catch (err) {
      setError(t("gift.validation_error"));
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogin = () => {
    navigate("/gift/login", {
      state: {
        giftCode,
        planInfo: validatedData
      }
    });
  };

  const handleRegister = () => {
    navigate("/gift/register", {
      state: {
        giftCode,
        planInfo: validatedData
      }
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-bg via-grey to-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={logo} alt="Dee Class" className="h-12" />
          </Link>
        </div>

        {/* Gift Code Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t("gift.redeem_title")}
            </h1>
            <p className="text-gray-400 text-sm">
              {t("gift.redeem_subtitle")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center flex items-center justify-center gap-2">
              <XCircle size={18} />
              {error}
            </div>
          )}

          {/* Code Input */}
          {!validatedData && (
            <>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="GIFT-XXXX-XXXX"
                  value={giftCode}
                  onChange={handleCodeChange}
                  maxLength={14}
                  className={`w-full bg-bg/50 border text-white py-4 px-4 text-center text-xl tracking-widest font-mono
                    rounded-xl placeholder:text-gray-500 placeholder:tracking-widest
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                    transition-all duration-300 border-gray-600`}
                />
              </div>

              <button
                onClick={handleCheckCode}
                disabled={isChecking || giftCode.length < 14}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 px-6 rounded-xl font-semibold
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  t("gift.check_code")
                )}
              </button>
            </>
          )}

          {/* Validated State */}
          {validatedData && (
            <>
              {/* Success Message */}
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm text-center flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                {t("gift.valid_code")}
              </div>

              {/* Plan Info */}
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">{t("gift.you_received")}</p>
                <h3 className="text-xl font-bold text-white mb-1">
                  {isRTL ? validatedData.plan?.title_ar : validatedData.plan?.title}
                </h3>
                <p className="text-primary text-sm">
                  {validatedData.billingCycle === "yearly" ? t("gift.one_year") : t("gift.one_month")}
                </p>
              </div>

              {/* Account Question */}
              <p className="text-center text-gray-400 text-sm mb-4">
                {t("gift.have_account_question")}
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleLogin}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 px-6 rounded-xl font-semibold
                    transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {t("gift.yes_login")}
                </button>

                <button
                  onClick={handleRegister}
                  className="w-full bg-transparent border border-primary text-primary hover:bg-primary/10 py-3.5 px-6 rounded-xl font-semibold
                    transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {t("gift.no_create_account")}
                </button>
              </div>

              {/* Use different code */}
              <button
                onClick={() => {
                  setValidatedData(null);
                  setGiftCode("");
                }}
                className="w-full text-gray-400 text-sm mt-4 hover:text-gray-300 transition-colors"
              >
                {t("gift.use_different_code")}
              </button>
            </>
          )}

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-500 text-sm">{t("auth.login.or")}</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Login Link */}
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
    </main>
  );
};

export default GiftCode;
