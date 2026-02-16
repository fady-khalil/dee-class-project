import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Modal,
  Share,
  RefreshControl,
} from "react-native";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import useFetch from "../../Hooks/useFetch";
import usePostDataNoLang from "../../Hooks/usePostDataNoLang";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import logo from "../../Assests/logos/dclass.png";
import BASE_URL from "../../config/BASE_URL";

const GiftPlanScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { user, token } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("yearly");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [plans, setPlans] = useState([]);
  const [myGifts, setMyGifts] = useState([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("purchase"); // "purchase" or "history"

  const { data: plansData, isLoading: isLoadingPlans, fetchData } = useFetch();
  const { postData, getData } = usePostDataNoLang();

  // Fetch plans
  useEffect(() => {
    fetchData("packages", token);
  }, []);

  useEffect(() => {
    if (plansData?.data?.packages) {
      setPlans(plansData.data.packages);
    } else if (plansData?.data && Array.isArray(plansData.data)) {
      setPlans(plansData.data);
    }
  }, [plansData]);

  // Fetch gift history
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
      const data = await response.json();
      if (data.success) {
        setMyGifts(data.data || []);
      }
    } catch (error) {
      console.log("Error fetching gift history:", error);
    } finally {
      setIsLoadingGifts(false);
      setRefreshing(false);
    }
  };

  // Fetch on focus
  useFocusEffect(
    useCallback(() => {
      fetchGiftHistory();
    }, [token]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGiftHistory();
  };

  const handlePurchaseGift = async () => {
    if (!selectedPlan) {
      setErrorMessage(t("gift_plan.select_plan_alert"));
      setShowErrorModal(true);
      return;
    }

    setIsPurchasing(true);

    try {
      const baseSuccessUrl = Linking.createURL("gift/success");
      const successUrl = `${baseSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = Linking.createURL("gift/cancel");

      const response = await postData("gift/purchase", {
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        user_id: user?._id,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      if (response?.data?.checkout_url) {
        Linking.openURL(response.data.checkout_url);
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
    try {
      await Share.share({
        message: t("gift_plan.share_message", { plan: planTitle, code: code }),
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const getPrice = (plan) => {
    if (billingCycle === "yearly") {
      return plan.yearlyPrice || plan.monthlyPrice * 12;
    }
    return plan.monthlyPrice;
  };

  const formatPrice = (price) => {
    return `${price} ${t("general.plan_currency")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b"; // amber
      case "redeemed":
        return "#22c55e"; // green
      case "expired":
        return "#ef4444"; // red
      default:
        return COLORS.darkWhite;
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

  if (isLoadingPlans) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <MaterialIcons
            name="card-giftcard"
            size={48}
            color={COLORS.primary}
          />
          <Text style={styles.title}>{t("gift_plan.title")}</Text>
          <Text style={styles.subtitle}>{t("gift_plan.subtitle")}</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "purchase" && styles.tabActive]}
            onPress={() => setActiveTab("purchase")}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={20}
              color={activeTab === "purchase" ? COLORS.white : COLORS.darkWhite}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "purchase" && styles.tabTextActive,
              ]}
            >
              {t("gift_plan.new_gift")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.tabActive]}
            onPress={() => setActiveTab("history")}
          >
            <MaterialIcons
              name="history"
              size={20}
              color={activeTab === "history" ? COLORS.white : COLORS.darkWhite}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "history" && styles.tabTextActive,
              ]}
            >
              {t("gift_plan.my_gifts")}
            </Text>
            {myGifts.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{myGifts.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {activeTab === "purchase" ? (
          <>
            {/* Billing Toggle */}
            <View style={styles.billingToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  billingCycle === "monthly" && styles.toggleButtonActive,
                ]}
                onPress={() => setBillingCycle("monthly")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    billingCycle === "monthly" && styles.toggleTextActive,
                  ]}
                >
                  {t("plans.monthly")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  billingCycle === "yearly" && styles.toggleButtonActive,
                ]}
                onPress={() => setBillingCycle("yearly")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    billingCycle === "yearly" && styles.toggleTextActive,
                  ]}
                >
                  {t("plans.yearly")}
                </Text>
                {billingCycle === "yearly" && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>
                      {t("plans.save")} 20%
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Plans List */}
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan?.id === plan.id && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planTitleRow}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      {selectedPlan?.id === plan.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={COLORS.primary}
                        />
                      )}
                    </View>
                    <Text style={styles.planPrice}>
                      {formatPrice(getPrice(plan))}
                    </Text>
                    <Text style={styles.planDuration}>
                      /{" "}
                      {billingCycle === "yearly"
                        ? t("plans.year")
                        : t("plans.month")}
                    </Text>
                  </View>

                  <View style={styles.planFeatures}>
                    <View style={styles.featureRow}>
                      <Ionicons
                        name="people"
                        size={18}
                        color={COLORS.primary}
                      />
                      <Text style={styles.featureText}>
                        {plan.profilesAllowed} {t("plans.profiles")}
                      </Text>
                    </View>
                    {plan.canDownload && (
                      <View style={styles.featureRow}>
                        <Ionicons
                          name="download"
                          size={18}
                          color={COLORS.primary}
                        />
                        <Text style={styles.featureText}>
                          {t("plans.download_available")}
                        </Text>
                      </View>
                    )}
                    <View style={styles.featureRow}>
                      <Ionicons
                        name="infinite"
                        size={18}
                        color={COLORS.primary}
                      />
                      <Text style={styles.featureText}>
                        {t("gift.unlimited_access")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.infoText}>{t("gift_plan.info_text")}</Text>
            </View>
          </>
        ) : (
          /* Gift History Tab */
          <View style={styles.historyContainer}>
            {isLoadingGifts ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ marginTop: 40 }}
              />
            ) : myGifts.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="card-giftcard"
                  size={64}
                  color={COLORS.darkWhite}
                />
                <Text style={styles.emptyStateText}>
                  {t("gift_plan.no_gifts")}
                </Text>
              </View>
            ) : (
              myGifts.map((gift, index) => (
                <View key={index} style={styles.giftCard}>
                  <View style={styles.giftHeader}>
                    <View style={styles.giftCodeContainer}>
                      <Text style={styles.giftCodeLabel}>
                        {t("gift_plan.gift_code")}
                      </Text>
                      <Text style={styles.giftCode}>{gift.code}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(gift.status)}20` },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(gift.status) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(gift.status) },
                        ]}
                      >
                        {getStatusText(gift.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.giftInfo}>
                    <View style={styles.giftInfoRow}>
                      <Text style={styles.giftInfoLabel}>
                        {t("gift_plan.plan_gifted")}
                      </Text>
                      <Text style={styles.giftInfoValue}>
                        {isRTL ? gift.plan?.title_ar : gift.plan?.title}
                      </Text>
                    </View>
                    <View style={styles.giftInfoRow}>
                      <Text style={styles.giftInfoLabel}>
                        {t("gift_plan.duration")}
                      </Text>
                      <Text style={styles.giftInfoValue}>
                        {gift.billingCycle === "yearly"
                          ? t("gift.one_year")
                          : t("gift.one_month")}
                      </Text>
                    </View>
                    <View style={styles.giftInfoRow}>
                      <Text style={styles.giftInfoLabel}>
                        {t("gift_plan.purchased_on")}
                      </Text>
                      <Text style={styles.giftInfoValue}>
                        {formatDate(gift.purchasedAt)}
                      </Text>
                    </View>
                    {gift.status === "redeemed" && gift.redeemedBy && (
                      <View style={styles.giftInfoRow}>
                        <Text style={styles.giftInfoLabel}>
                          {t("gift_plan.redeemed_by")}
                        </Text>
                        <Text style={styles.giftInfoValue}>
                          {gift.redeemedBy.fullName || gift.redeemedBy.email}
                        </Text>
                      </View>
                    )}
                    {gift.status === "pending" && (
                      <View style={styles.giftInfoRow}>
                        <Text style={styles.giftInfoLabel}>
                          {t("gift_plan.expires_on")}
                        </Text>
                        <Text style={styles.giftInfoValue}>
                          {formatDate(gift.expiresAt)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {gift.status === "pending" && (
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={() =>
                        handleShareCode(
                          gift.code,
                          isRTL ? gift.plan?.title_ar : gift.plan?.title,
                        )
                      }
                    >
                      <Ionicons
                        name="share-social"
                        size={18}
                        color={COLORS.white}
                      />
                      <Text style={styles.shareButtonText}>
                        {t("gift_plan.share_code")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Button - Only show on purchase tab */}
      {activeTab === "purchase" && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              (!selectedPlan || isPurchasing) && styles.purchaseButtonDisabled,
            ]}
            onPress={handlePurchaseGift}
            disabled={!selectedPlan || isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <MaterialIcons
                  name="card-giftcard"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.purchaseButtonText}>
                  {t("gift_plan.purchase_button")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.modalTitle}>{t("gift_plan.error_title")}</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>{t("general.ok")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.xs,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.lg,
  },
  logo: {
    height: 32,
    width: 100,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkWhite,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  // Tab Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.darkWhite,
    fontWeight: "500",
  },
  tabTextActive: {
    color: COLORS.white,
  },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  // Billing Toggle
  billingToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: 10,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.darkWhite,
    fontWeight: "500",
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  saveBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: {
    color: "#22c55e",
    fontSize: 10,
    fontWeight: "600",
  },
  // Plans
  plansContainer: {
    gap: SPACING.md,
  },
  planCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  planHeader: {
    marginBottom: SPACING.lg,
  },
  planTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  planDuration: {
    fontSize: 14,
    color: COLORS.darkWhite,
    marginTop: 2,
  },
  planFeatures: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: SPACING.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  infoText: {
    flex: 1,
    color: COLORS.darkWhite,
    fontSize: 13,
    lineHeight: 20,
  },
  // Gift History
  historyContainer: {
    gap: SPACING.lg,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    color: COLORS.darkWhite,
    fontSize: 16,
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  giftCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  giftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  giftCodeContainer: {
    flex: 1,
  },
  giftCodeLabel: {
    fontSize: 12,
    color: COLORS.darkWhite,
    marginBottom: 4,
  },
  giftCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  giftInfo: {
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: SPACING.lg,
  },
  giftInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  giftInfoLabel: {
    fontSize: 14,
    color: COLORS.darkWhite,
  },
  giftInfoValue: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "500",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    gap: 8,
  },
  shareButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  // Bottom
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundColor,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.grey,
    borderRadius: 20,
    padding: SPACING.xl,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.darkWhite,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    minWidth: 120,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default GiftPlanScreen;
