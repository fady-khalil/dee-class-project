import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import useFetch from "Hooks/useFetch";
import usePostDataNoLang from "Hooks/usePostDataNoLang";
import Spinner from "Components/RequestHandler/Spinner";
import {
  Gift,
  Users,
  Download,
  Infinity,
  Check,
  ArrowLeft,
  Plus,
  ClockCounterClockwise,
  ShareNetwork,
  Clock,
  CheckCircle,
  XCircle
} from "@phosphor-icons/react";
import BASE_URL from "Utilities/BASE_URL";

const GiftPlan = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, token } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("yearly");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [plans, setPlans] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("purchase");
  const [myGifts, setMyGifts] = useState([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState(true);

  const { data, isLoading, isError, fetchData } = useFetch();
  const { postData } = usePostDataNoLang();

  useEffect(() => {
    fetchData("packages", token);
    fetchGiftHistory();
  }, []);

  useEffect(() => {
    if (data?.data?.packages) {
      setPlans(data.data.packages);
      setInitialLoading(false);
    } else if (data?.data) {
      setPlans(Array.isArray(data.data) ? data.data : []);
      setInitialLoading(false);
    } else if (isError) {
      setInitialLoading(false);
    }
  }, [data, isError]);

  const fetchGiftHistory = async () => {
    try {
      setIsLoadingGifts(true);
      const response = await fetch(`${BASE_URL}/gift/my-gifts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setMyGifts(result.data || []);
      }
    } catch (error) {
      console.log("Error fetching gift history:", error);
    } finally {
      setIsLoadingGifts(false);
    }
  };

  const handlePurchaseGift = async () => {
    if (!selectedPlan) {
      setErrorMessage(t("gift_plan.select_plan_alert"));
      setShowErrorModal(true);
      return;
    }

    setIsPurchasing(true);

    try {
      const successUrl = `${window.location.origin}/gift/purchase-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/gift/plan`;

      const response = await postData("gift/purchase", {
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        user_id: user?._id,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      if (response?.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        setErrorMessage(t("gift_plan.purchase_error"));
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage(t("gift_plan.purchase_error"));
      setShowErrorModal(true);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleShareCode = async (code, planTitle) => {
    const shareMessage = t("gift_plan.share_message", { plan: planTitle, code: code });

    if (navigator.share) {
      try {
        await navigator.share({
          title: t("gift_plan.title"),
          text: shareMessage,
        });
      } catch (error) {
        // User cancelled or error - fallback to copy
        copyToClipboard(code);
      }
    } else {
      copyToClipboard(code);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(t("gift_plan.code_copied"));
  };

  const getPrice = (plan) => {
    if (billingCycle === "yearly") {
      return plan.yearlyPrice || plan.monthlyPrice * 12;
    }
    return plan.monthlyPrice;
  };

  const formatPrice = (price) => {
    return `${price} ${t("account.currency")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-amber-400 bg-amber-400/10 border-amber-400/30";
      case "redeemed":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "expired":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={14} weight="bold" />;
      case "redeemed":
        return <CheckCircle size={14} weight="bold" />;
      case "expired":
        return <XCircle size={14} weight="bold" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return t("gift_plan.status_pending");
      case "redeemed":
        return t("gift_plan.status_redeemed");
      case "expired":
        return t("gift_plan.status_expired");
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-bg via-grey to-bg py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t("gift.back")}</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("gift_plan.title")}
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            {t("gift_plan.subtitle")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-grey/80 p-1.5 rounded-xl flex">
            <button
              onClick={() => setActiveTab("purchase")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === "purchase"
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Plus size={18} />
              {t("gift_plan.new_gift")}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ClockCounterClockwise size={18} />
              {t("gift_plan.my_gifts")}
              {myGifts.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px]">
                  {myGifts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === "purchase" ? (
          <>
            {/* Billing Toggle */}
            <div className="flex justify-center mb-10">
              <div className="bg-grey/80 p-1.5 rounded-xl flex">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    billingCycle === "monthly"
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t("plans.monthly")}
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    billingCycle === "yearly"
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t("plans.yearly")}
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded">
                    {t("plans.save")} 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            {plans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{t("gift_plan.no_plans")}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative bg-grey/80 backdrop-blur-sm rounded-2xl p-6 cursor-pointer transition-all border-2 ${
                      selectedPlan?.id === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-gray-600"
                    }`}
                  >
                    {selectedPlan?.id === plan.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" weight="bold" />
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-white mb-2">
                      {plan.title}
                    </h3>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">
                        {formatPrice(getPrice(plan))}
                      </span>
                      <span className="text-gray-400 text-sm">
                        / {billingCycle === "yearly" ? t("plans.year") : t("plans.month")}
                      </span>
                    </div>

                    <div className="space-y-3 border-t border-gray-700 pt-4">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Users size={16} className="text-primary" />
                        <span>{plan.profilesAllowed} {t("plans.profiles")}</span>
                      </div>
                      {plan.canDownload && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Download size={16} className="text-primary" />
                          <span>{t("plans.download_available")}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Infinity size={16} className="text-primary" />
                        <span>{t("gift.unlimited_access")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-gray-300 text-sm text-center">
                {t("gift_plan.info_text")}
              </p>
            </div>

            {/* Purchase Button */}
            <div className="text-center">
              <button
                onClick={handlePurchaseGift}
                disabled={!selectedPlan || isPurchasing}
                className="bg-primary hover:bg-primary/90 text-white py-4 px-12 rounded-xl font-semibold
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-3 mx-auto"
              >
                {isPurchasing ? (
                  <Spinner isSmall={true} isWhite={true} />
                ) : (
                  <>
                    <Gift size={20} />
                    {t("gift_plan.purchase_button")}
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Gift History Tab */
          <div className="space-y-6">
            {isLoadingGifts ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : myGifts.length === 0 ? (
              <div className="text-center py-16">
                <Gift size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">{t("gift_plan.no_gifts")}</p>
              </div>
            ) : (
              myGifts.map((gift, index) => (
                <div
                  key={index}
                  className="bg-grey/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
                >
                  {/* Gift Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{t("gift_plan.gift_code")}</p>
                      <p className="text-2xl font-bold text-primary tracking-wider">{gift.code}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(gift.status)}`}>
                      {getStatusIcon(gift.status)}
                      <span className="text-sm font-medium">{getStatusText(gift.status)}</span>
                    </div>
                  </div>

                  {/* Gift Info */}
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-700/50 pt-6">
                    <div>
                      <p className="text-gray-400 text-sm">{t("gift_plan.plan_gifted")}</p>
                      <p className="text-white font-medium">
                        {isRTL ? gift.plan?.title_ar : gift.plan?.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{t("gift_plan.duration")}</p>
                      <p className="text-white font-medium">
                        {gift.billingCycle === "yearly" ? t("gift.one_year") : t("gift.one_month")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{t("gift_plan.purchased_on")}</p>
                      <p className="text-white font-medium">{formatDate(gift.purchasedAt)}</p>
                    </div>
                    {gift.status === "redeemed" && gift.redeemedBy ? (
                      <div>
                        <p className="text-gray-400 text-sm">{t("gift_plan.redeemed_by")}</p>
                        <p className="text-white font-medium">
                          {gift.redeemedBy.fullName || gift.redeemedBy.email}
                        </p>
                      </div>
                    ) : gift.status === "pending" ? (
                      <div>
                        <p className="text-gray-400 text-sm">{t("gift_plan.expires_on")}</p>
                        <p className="text-white font-medium">{formatDate(gift.expiresAt)}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Share Button for Pending */}
                  {gift.status === "pending" && (
                    <button
                      onClick={() => handleShareCode(gift.code, isRTL ? gift.plan?.title_ar : gift.plan?.title)}
                      className="mt-6 w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold
                        transition-all flex items-center justify-center gap-2"
                    >
                      <ShareNetwork size={18} />
                      {t("gift_plan.share_code")}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-grey/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">
                {t("gift_plan.error_title")}
              </h3>
              <p className="text-gray-400 mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-primary hover:bg-primary/90 text-white py-3 px-8 rounded-xl font-semibold transition-colors"
              >
                {t("general.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GiftPlan;
