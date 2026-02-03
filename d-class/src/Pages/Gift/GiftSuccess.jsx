import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Users, Download, Infinity, ArrowRight } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";

const GiftSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { planInfo } = location.state || {};
  const isRTL = i18n.language === "ar";

  const handleContinue = () => {
    navigate("/my-profiles");
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

        {/* Success Card */}
        <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" weight="fill" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            {t("gift.success_title")}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {t("gift.success_subtitle")}
          </p>

          {/* Plan Details */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-5 mb-8">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              {t("gift.your_plan")}
            </p>
            <h2 className="text-2xl font-bold text-white mb-1">
              {isRTL ? planInfo?.plan?.title_ar : planInfo?.plan?.title}
            </h2>
            <p className="text-primary text-sm mb-4">
              {planInfo?.billingCycle === "yearly" ? t("gift.one_year") : t("gift.one_month")}
            </p>

            {/* Features */}
            <div className="space-y-3 border-t border-primary/20 pt-4">
              <div className="flex items-center gap-3 justify-center">
                <Users size={18} className="text-primary" />
                <span className="text-gray-300 text-sm">
                  {planInfo?.plan?.profilesAllowed} {t("gift.profiles")}
                </span>
              </div>
              {planInfo?.plan?.canDownload && (
                <div className="flex items-center gap-3 justify-center">
                  <Download size={18} className="text-primary" />
                  <span className="text-gray-300 text-sm">{t("gift.downloads_included")}</span>
                </div>
              )}
              <div className="flex items-center gap-3 justify-center">
                <Infinity size={18} className="text-primary" />
                <span className="text-gray-300 text-sm">{t("gift.unlimited_access")}</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-xl font-semibold
              transition-all duration-300 flex items-center justify-center gap-2"
          >
            {t("gift.start_watching")}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </main>
  );
};

export default GiftSuccess;
