import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import COLORS from "../../styles/colors";
import { GlobalStyle } from "../../styles/GlobalStyle";
import HeaderBack from "../../components/navigation/HeaderBack";
import { useAuth } from "../../context/Authentication/LoginAuth";
import useAuthFetchNoLang from "../../Hooks/useAuthFetchNoLang";
import BASE_URL from "../../config/BASE_URL";

const { width } = Dimensions.get("window");

const SubscriptionDetails = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { token } = useAuth();
  const { fetchData } = useAuthFetchNoLang();

  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch subscription data
  useEffect(() => {
    const loadSubscription = async () => {
      if (!token) return;
      try {
        const response = await fetchData(`${i18n.language}/account/subscription`, token);
        if (response?.success && response?.data) {
          setSubscriptionData(response.data);
        }
      } catch (error) {
        console.error("Error loading subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSubscription();
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      i18n.language === "ar" ? "ar-EG" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      const response = await fetch(`${BASE_URL}/subscription/cancel-subscription`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success) {
        Alert.alert("", t("account.subscription_cancelled"));
        setSubscriptionData((prev) => ({ ...prev, cancelAtPeriodEnd: true }));
      } else {
        Alert.alert(t("errors.general.title"), result.message || t("account.update_error"));
      }
    } catch (error) {
      Alert.alert(t("errors.general.title"), t("account.update_error"));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleManagePayment = async () => {
    try {
      const response = await fetch(`${BASE_URL}/subscription/portal-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success && result.url) {
        Linking.openURL(result.url);
      }
    } catch (error) {
      console.error("Error opening payment portal:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, GlobalStyle.safeAreaView]}>
        <View style={[GlobalStyle.container, styles.content]}>
          <HeaderBack screenName="subscription_details" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!subscriptionData?.hasSubscription) {
    return (
      <SafeAreaView style={[styles.container, GlobalStyle.safeAreaView]}>
        <View style={[GlobalStyle.container, styles.content]}>
          <HeaderBack screenName="subscription_details" />
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcon name="card-membership" size={48} color={COLORS.darkWhite} />
            </View>
            <Text style={styles.emptyTitle}>{t("account.no_subscription")}</Text>
            <Text style={styles.emptySubtitle}>{t("account.no_subscription_desc")}</Text>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => navigation.navigate("Plans")}
            >
              <Text style={styles.subscribeButtonText}>{t("navigation.plans")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, GlobalStyle.safeAreaView]}>
      <View style={[GlobalStyle.container, styles.content]}>
        <HeaderBack screenName="subscription_details" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Plan Card */}
          <View style={styles.planCard}>
            {subscriptionData.plan && (
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{subscriptionData.plan.name}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {subscriptionData.cancelAtPeriodEnd ? t("account.status_cancelling") : t("account.status_active")}
                  </Text>
                </View>
              </View>
            )}

            {subscriptionData.plan?.price && (
              <Text style={styles.planPrice}>
                {subscriptionData.plan.price} {t("account.currency")}/{subscriptionData.plan.interval || t("plans.month")}
              </Text>
            )}
          </View>

          {/* Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {subscriptionData.cancelAtPeriodEnd
                  ? t("account.expires_on")
                  : t("account.renews_on")}
              </Text>
              <Text style={styles.detailValue}>
                {formatDate(subscriptionData.currentPeriodEnd)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("account.days_remaining")}</Text>
              <Text style={[styles.detailValue, styles.highlightValue]}>
                {subscriptionData.daysRemaining}
              </Text>
            </View>

            {subscriptionData.profilesAllowed && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("plans.profiles")}</Text>
                <Text style={styles.detailValue}>{subscriptionData.profilesAllowed}</Text>
              </View>
            )}

            {subscriptionData.canDownload && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("plans.download_available")}</Text>
                <Icon name="check" size={18} color={COLORS.primary} />
              </View>
            )}
          </View>

          {/* Features */}
          {subscriptionData.plan?.features && subscriptionData.plan.features.length > 0 && (
            <View style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>{t("account.features")}</Text>
              {subscriptionData.plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Icon name="check-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Cancel Warning */}
          {subscriptionData.cancelAtPeriodEnd && (
            <View style={styles.warningCard}>
              <Icon name="alert-circle" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>{t("account.subscription_cancelled")}</Text>
            </View>
          )}

          {/* Actions */}
          {!subscriptionData.cancelAtPeriodEnd && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={handleManagePayment}
              >
                <Icon name="credit-card" size={20} color={COLORS.white} />
                <Text style={styles.manageButtonText}>{t("account.manage_payment")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <>
                    <Icon name="x-circle" size={20} color="#EF4444" />
                    <Text style={styles.cancelButtonText}>
                      {t("account.cancel_subscription")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Cancel Subscription Modal */}
        <Modal
          visible={showCancelModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCancelModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Icon name="alert-triangle" size={32} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>{t("account.cancel_subscription")}</Text>
              <Text style={styles.modalMessage}>{t("account.cancel_warning")}</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalKeepButton]}
                  onPress={() => setShowCancelModal(false)}
                >
                  <Text style={styles.modalKeepButtonText}>{t("account.no_keep")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => {
                    setShowCancelModal(false);
                    confirmCancelSubscription();
                  }}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.modalCancelButtonText}>{t("account.yes_cancel")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.darkWhite,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  subscribeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  planCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + "40",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700",
  },
  statusBadge: {
    backgroundColor: COLORS.primary + "30",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  planPrice: {
    color: COLORS.darkWhite,
    fontSize: 16,
  },
  detailsCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  detailLabel: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
  detailValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  highlightValue: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  featuresCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  featuresTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  featureText: {
    color: COLORS.lightWhite,
    fontSize: 14,
    flex: 1,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  warningText: {
    color: "#F59E0B",
    fontSize: 14,
    flex: 1,
  },
  actionsContainer: {
    marginTop: 8,
    gap: 12,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  manageButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#E0E0E0",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalKeepButton: {
    backgroundColor: COLORS.primary,
  },
  modalKeepButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  modalCancelButton: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  modalCancelButtonText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
});
