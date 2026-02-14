import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "Components/Container/Container";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import Spinner from "Components/RequestHandler/Spinner";
import BASE_URL from "Utilities/BASE_URL";
import {
  User,
  Envelope,
  Phone,
  Lock,
  CreditCard,
  Users,
  BookOpen,
  SignOut,
  CaretRight,
  PencilSimple,
  Eye,
  EyeSlash,
  CalendarBlank,
  Clock,
  Warning,
  CheckCircle,
  XCircle,
  Gift,
} from "@phosphor-icons/react";

const MyAccount = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    user,
    token,
    logoutHandler,
    isVerified,
    allowedProfiles,
    allowedCourses,
    setUser,
  } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch account data
  useEffect(() => {
    const fetchAccountData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${BASE_URL}/${i18n.language}/account/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (result.success) {
          setAccountData(result.data);
          setFormData({
            fullName: result.data.fullName || "",
            phoneNumber: result.data.phoneNumber || "",
          });
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, [token, i18n.language]);

  // Fetch subscription data if user has a plan
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!token || !allowedProfiles) return;

      try {
        const response = await fetch(
          `${BASE_URL}/${i18n.language}/account/subscription`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (result.success) {
          setSubscriptionData(result.data);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      }
    };

    fetchSubscriptionData();
  }, [token, allowedProfiles, i18n.language]);

  // Handle profile update
  const handleSaveProfile = async () => {
    if (formData.fullName.trim().length < 2) {
      setMessage({ type: "error", text: t("account.name_required") });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${BASE_URL}/${i18n.language}/account/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: t("account.profile_updated") });
        setIsEditing(false);
        if (user) {
          setUser({ ...user, fullName: formData.fullName });
        }
      } else {
        setMessage({ type: "error", text: result.message || t("account.update_error") });
      }
    } catch (error) {
      setMessage({ type: "error", text: t("account.update_error") });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: "error", text: t("account.password_too_short") });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: t("account.password_mismatch") });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(
        `${BASE_URL}/${i18n.language}/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword,
          }),
        }
      );
      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: t("account.password_changed") });
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: t("account.update_error") });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`${BASE_URL}/subscription/cancel-subscription`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: t("account.subscription_cancelled") });
        setShowCancelModal(false);
        setSubscriptionData((prev) => ({ ...prev, cancelAtPeriodEnd: true }));
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: t("account.update_error") });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Stripe portal
  const handleManagePayment = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`${BASE_URL}/subscription/portal-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success && result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Error opening payment portal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/${i18n.language}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Ignore errors, logout anyway
    }
    logoutHandler();
    navigate("/");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      i18n.language === "ar" ? "ar-EG" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  // Get user initials
  const getInitials = () => {
    const name = accountData?.fullName || user?.email || "U";
    return name.charAt(0).toUpperCase();
  };

  // Users with purchased courses must have been verified
  const effectivelyVerified = isVerified || allowedCourses?.length > 0;
  const iconPosition = isRTL ? "right-4" : "left-4";
  const togglePosition = isRTL ? "left-4" : "right-4";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg via-grey to-bg pt-pageTop lg:pt-primary pb-16 lg:pb-primary">
        <Container>
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-grey to-bg pt-pageTop lg:pt-primary pb-16 lg:pb-primary">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Header with Avatar */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{getInitials()}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {accountData?.fullName || user?.email || t("account.title")}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{accountData?.email || user?.email}</p>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} className="text-green-400 flex-shrink-0" weight="fill" />
              ) : (
                <XCircle size={20} className="text-red-400 flex-shrink-0" weight="fill" />
              )}
              <span className={message.type === "success" ? "text-green-400" : "text-red-400"}>
                {message.text}
              </span>
            </div>
          )}

          {/* Not Verified Warning */}
          {!effectivelyVerified && (
            <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
              <Warning size={20} className="text-yellow-400 flex-shrink-0" weight="fill" />
              <div className="flex-1">
                <p className="text-yellow-400 text-sm">{t("account.verify_email_first")}</p>
              </div>
              <Link
                to="/verify-email"
                className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl text-sm font-medium hover:bg-yellow-500/30 transition-colors"
              >
                {t("verify_email.title")}
              </Link>
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <User size={20} className="text-primary" weight="bold" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {t("account.profile_section")}
                </h2>
              </div>
              {effectivelyVerified && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  <PencilSimple size={16} weight="bold" />
                  {t("account.edit_profile")}
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={t("account.full_name")}
                    className={`w-full bg-bg/50 border border-gray-600 text-white py-3.5 ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}
                      rounded-xl placeholder:text-gray-500 placeholder:text-sm
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                      transition-all duration-300`}
                  />
                </div>
                <div className="relative">
                  <div className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder={t("account.phone_placeholder")}
                    className={`w-full bg-bg/50 border border-gray-600 text-white py-3.5 ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}
                      rounded-xl placeholder:text-gray-500 placeholder:text-sm
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                      transition-all duration-300`}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl font-semibold
                      transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {isSaving && <Spinner isSmall isWhite />}
                    {t("account.save_changes")}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        fullName: accountData?.fullName || "",
                        phoneNumber: accountData?.phoneNumber || "",
                      });
                    }}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                  >
                    {t("account.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-bg/30 rounded-xl">
                  <User size={20} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-gray-400 text-xs mb-0.5">{t("account.full_name")}</p>
                    <p className="text-white">{accountData?.fullName || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-bg/30 rounded-xl">
                  <Envelope size={20} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-gray-400 text-xs mb-0.5">{t("account.email")}</p>
                    <p className="text-white">{accountData?.email || user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-bg/30 rounded-xl">
                  <Phone size={20} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-gray-400 text-xs mb-0.5">{t("account.phone_number")}</p>
                    <p className="text-white">{accountData?.phoneNumber || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Section */}
          {effectivelyVerified && (
            <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Lock size={20} className="text-primary" weight="bold" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {t("account.security_section")}
                </h2>
              </div>

              {isChangingPassword ? (
                <div className="space-y-4">
                  <div className="relative">
                    <div className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
                      <Lock size={20} />
                    </div>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder={t("account.current_password")}
                      className={`w-full bg-bg/50 border border-gray-600 text-white py-3.5 ${isRTL ? "pr-12 pl-12" : "pl-12 pr-12"}
                        rounded-xl placeholder:text-gray-500 placeholder:text-sm
                        focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                        transition-all duration-300`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className={`absolute ${togglePosition} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors`}
                    >
                      {showCurrentPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <div className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
                      <Lock size={20} />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder={t("account.new_password")}
                      className={`w-full bg-bg/50 border border-gray-600 text-white py-3.5 ${isRTL ? "pr-12 pl-12" : "pl-12 pr-12"}
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
                    <div className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
                      <Lock size={20} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder={t("account.confirm_password")}
                      className={`w-full bg-bg/50 border border-gray-600 text-white py-3.5 ${isRTL ? "pr-12 pl-12" : "pl-12 pr-12"}
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
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={isSaving}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl font-semibold
                        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2"
                    >
                      {isSaving && <Spinner isSmall isWhite />}
                      {t("account.save_changes")}
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                    >
                      {t("account.cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center gap-4 w-full p-4 bg-bg/30 rounded-xl hover:bg-bg/50 transition-all duration-300 group"
                >
                  <Lock size={20} className="text-gray-400" />
                  <span className="text-white flex-1 text-start">{t("account.change_password")}</span>
                  <CaretRight size={20} className={`text-gray-500 group-hover:text-primary transition-colors ${isRTL ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          )}

          {/* Subscription Section */}
          {allowedProfiles > 0 && subscriptionData?.hasSubscription && (
            <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <CreditCard size={20} className="text-primary" weight="bold" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {t("account.subscription_section")}
                </h2>
              </div>

              {/* Plan Badge */}
              {subscriptionData.plan && (
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/30 mb-4">
                  <div>
                    <p className="text-primary font-semibold text-lg">{subscriptionData.plan.name}</p>
                    {subscriptionData.plan.price && (
                      <p className="text-gray-400 text-sm">
                        {subscriptionData.plan.price} {t("account.currency")}/{subscriptionData.plan.interval || t("plans.month")}
                      </p>
                    )}
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    subscriptionData.cancelAtPeriodEnd
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}>
                    {subscriptionData.cancelAtPeriodEnd ? t("account.status_cancelling") : t("account.status_active")}
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-4 p-4 bg-bg/30 rounded-xl">
                  <CalendarBlank size={20} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-gray-400 text-xs mb-0.5">
                      {subscriptionData.cancelAtPeriodEnd ? t("account.expires_on") : t("account.renews_on")}
                    </p>
                    <p className="text-white">{formatDate(subscriptionData.currentPeriodEnd)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-bg/30 rounded-xl">
                  <Clock size={20} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-gray-400 text-xs mb-0.5">{t("account.days_remaining")}</p>
                    <p className="text-primary font-semibold">{subscriptionData.daysRemaining} {t("account.days")}</p>
                  </div>
                </div>
              </div>

              {subscriptionData.cancelAtPeriodEnd ? (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
                  <Warning size={20} className="text-yellow-400 flex-shrink-0" weight="fill" />
                  <p className="text-yellow-400 text-sm">{t("account.subscription_cancelled")}</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleManagePayment}
                    disabled={isSaving}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl font-semibold
                      transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    {t("account.manage_payment")}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-6 py-3 bg-red-500/10 text-red-400 rounded-xl font-medium
                      hover:bg-red-500/20 transition-colors border border-red-500/30"
                  >
                    {t("account.cancel_subscription")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No Subscription */}
          {effectivelyVerified && !allowedProfiles && allowedCourses?.length === 0 && (
            <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-8 mb-6 shadow-xl border border-gray-700/50 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <CreditCard size={28} className="text-primary" weight="bold" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {t("account.no_subscription")}
              </h2>
              <p className="text-gray-400 mb-6">{t("account.no_subscription_desc")}</p>
              <Link
                to="/plans"
                className="inline-block bg-primary hover:bg-primary/90 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300"
              >
                {t("navigation.plans")}
              </Link>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-grey/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-gray-700/50">
            <div className="space-y-2">
              {allowedProfiles > 0 && (
                <>
                  <Link
                    to="/my-profiles"
                    className="flex items-center gap-4 w-full p-4 bg-bg/30 rounded-xl hover:bg-bg/50 transition-all duration-300 group"
                  >
                    <Users size={20} className="text-gray-400" />
                    <span className="text-white flex-1">{t("account.manage_profiles")}</span>
                    <CaretRight size={20} className={`text-gray-500 group-hover:text-primary transition-colors ${isRTL ? "rotate-180" : ""}`} />
                  </Link>
                  <Link
                    to="/gift/plan"
                    className="flex items-center gap-4 w-full p-4 bg-bg/30 rounded-xl hover:bg-bg/50 transition-all duration-300 group"
                  >
                    <Gift size={20} className="text-primary" />
                    <span className="text-white flex-1">{t("gift_plan.title")}</span>
                    <CaretRight size={20} className={`text-gray-500 group-hover:text-primary transition-colors ${isRTL ? "rotate-180" : ""}`} />
                  </Link>
                </>
              )}

              {allowedCourses?.length > 0 && (
                <Link
                  to="/my-courses"
                  className="flex items-center gap-4 w-full p-4 bg-bg/30 rounded-xl hover:bg-bg/50 transition-all duration-300 group"
                >
                  <BookOpen size={20} className="text-gray-400" />
                  <span className="text-white flex-1">{t("account.my_courses")}</span>
                  <CaretRight size={20} className={`text-gray-500 group-hover:text-primary transition-colors ${isRTL ? "rotate-180" : ""}`} />
                </Link>
              )}

              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-4 w-full p-4 bg-bg/30 rounded-xl hover:bg-red-500/10 transition-all duration-300 group text-start"
              >
                <SignOut size={20} className="text-red-400" />
                <span className="text-red-400 flex-1">{t("account.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </Container>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-grey/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <SignOut size={28} className="text-red-400" weight="bold" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t("account.logout")}
              </h3>
              <p className="text-gray-400">{t("account.logout_confirm")}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                {t("account.cancel")}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                {t("account.logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-grey/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Warning size={28} className="text-red-400" weight="fill" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t("account.cancel_subscription")}
              </h3>
              <p className="text-gray-400 mb-2">{t("account.cancel_confirm")}</p>
              <p className="text-yellow-400 text-sm">{t("account.cancel_warning")}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                {t("account.no_keep")}
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-red-500/10 text-red-400 rounded-xl font-medium
                  hover:bg-red-500/20 transition-colors border border-red-500/30
                  disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Spinner isSmall />}
                {t("account.yes_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccount;
