import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostDataNoLang from "Hooks/usePostDataNoLang";
import Spinner from "Components/RequestHandler/Spinner";
import { Gift, Copy, Share, Check, XCircle } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const GiftPurchaseSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  const sessionId = searchParams.get("session_id");

  const [isLoading, setIsLoading] = useState(true);
  const [giftData, setGiftData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const { postData } = usePostDataNoLang();

  useEffect(() => {
    verifyPurchase();
  }, []);

  const verifyPurchase = async () => {
    if (!sessionId) {
      setError(t("gift_plan.invalid_session"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await postData("gift/verify-purchase", {
        session_id: sessionId,
        user_id: user?._id,
      });

      if (response?.success && response?.data) {
        setGiftData(response.data);
      } else {
        setError(response?.message || t("gift_plan.verification_error"));
      }
    } catch (err) {
      setError(t("gift_plan.verification_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (giftData?.code) {
      await navigator.clipboard.writeText(giftData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!giftData?.code) return;

    const shareText = t("gift_plan.share_message", {
      code: giftData.code,
      plan: isRTL ? giftData.plan?.title_ar : giftData.plan?.title,
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: t("gift_plan.title"),
          text: shareText,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    navigate("/categories");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-bg via-grey to-bg flex items-center justify-center p-4">
        <div className="text-center">
          <img src={logo} alt="Dee Class" className="h-12 mx-auto mb-8" />
          <Spinner />
          <p className="text-gray-400 mt-4">{t("gift_plan.verifying_purchase")}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-bg via-grey to-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <img src={logo} alt="Dee Class" className="h-12 mx-auto mb-8" />
          <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-3">
              {t("gift_plan.error_title")}
            </h1>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={handleDone}
              className="bg-primary hover:bg-primary/90 text-white py-3 px-8 rounded-xl font-semibold
                transition-all duration-300"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-bg via-grey to-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Dee Class" className="h-12" />
        </div>

        {/* Success Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift size={40} className="text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            {t("gift_plan.success_title")}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {t("gift_plan.success_subtitle")}
          </p>

          {/* Gift Code Display */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-2">{t("gift_plan.your_gift_code")}</p>
            <div className="bg-bg/50 border-2 border-dashed border-primary rounded-xl p-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-primary tracking-wider font-mono">
                {giftData?.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-xs mt-2">{t("gift_plan.code_copied")}</p>
            )}
          </div>

          {/* Plan Info */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {t("gift_plan.plan_gifted")}
            </p>
            <h3 className="text-lg font-bold text-white">
              {isRTL ? giftData?.plan?.title_ar : giftData?.plan?.title}
            </h3>
            <p className="text-primary text-sm">
              {giftData?.billingCycle === "yearly" ? t("gift.one_year") : t("gift.one_month")}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-bg/30 rounded-xl p-4 mb-6 text-left">
            <h4 className="text-sm font-semibold text-white mb-2">
              {t("gift_plan.how_to_share")}
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              {t("gift_plan.instructions_text")}
            </p>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleShare}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 px-6 rounded-xl font-semibold
              transition-all duration-300 flex items-center justify-center gap-2 mb-3"
          >
            <Share size={20} />
            {t("gift_plan.share_code")}
          </button>

          <button
            onClick={handleDone}
            className="w-full text-gray-400 py-3 hover:text-white transition-colors"
          >
            {t("gift_plan.done")}
          </button>
        </div>
      </div>
    </main>
  );
};

export default GiftPurchaseSuccess;
