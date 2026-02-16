import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import useFetch from "../../Hooks/useFetch";
import { useNavigation } from "@react-navigation/native";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import usePostDataNoLang from "../../Hooks/usePostDataNoLang";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import { GlobalStyle } from "../../styles/GlobalStyle";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../../components/RequestHandler/Spinner";
import {
  StatusHandler,
  useStatusHandler,
} from "../../components/RequestHandler";
import PlanTitle from "./components/PlanTitle";
import FrequentlyAskedQuestions from "./components/FrequentlyAskedQuestions";
import { HeaderBack } from "../../components/navigation";

const PlansScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data, isLoading, isError, fetchData } = useFetch();
  const { user, isLoggedIn, token } = useContext(LoginAuthContext);
  const { postData, isLoading: isPostLoading } = usePostDataNoLang();
  const { isVisible, status, message, showSuccess, showError, hideStatus } =
    useStatusHandler();

  // Billing cycle toggle state - same as website
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  // Handle payment process - same as website
  const handlePayment = async (plan) => {
    if (isLoggedIn) {
      setLoadingPlanId(plan.id);

      try {
        // Use Expo Linking to create proper deep link URLs (works for both Expo Go and production)
        // Note: We manually append session_id placeholder to avoid URL encoding
        const baseSuccessUrl = Linking.createURL("payment/success");
        const successUrl = `${baseSuccessUrl}?session_id={CHECKOUT_SESSION_ID}&type=plan`;
        const cancelUrl = Linking.createURL("payment/cancel");

        console.log("Success URL:", successUrl);
        console.log("Cancel URL:", cancelUrl);

        const response = await postData("create-checkout-session", {
          type: "package",
          user_id: user?.id || user?._id,
          id: plan.id,
          source: "application",
          billingCycle: billingCycle,
          // Deep link URLs for mobile app (include type for proper navigation after payment)
          success_url: successUrl,
          cancel_url: cancelUrl,
        });

        if (response?.success && response?.data?.checkout_url) {
          Linking.openURL(response.data.checkout_url);
        } else {
          showError(response?.message || "Failed to create checkout session");
        }
      } catch (error) {
        showError("Payment process failed");
      } finally {
        setLoadingPlanId(null);
      }
    } else {
      navigation.navigate("Register", { plan_id: plan.id, is_register: true });
    }
  };

  useEffect(() => {
    fetchData("packages");
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <HeaderBack screenName="plans" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <HeaderBack screenName="plans" />
      <ScrollView style={GlobalStyle.container}>
        <PlanTitle />

        <StatusHandler
          isVisible={isVisible}
          status={status}
          message={message}
          hideStatus={hideStatus}
        />

        {/* Billing Cycle Toggle - same as website */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
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
                {t("plans.monthly") || "Monthly"}
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
                {t("plans.yearly") || "Yearly"}
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>
                  {t("plans.save") || "Save"} 20%
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.plansContainer}>
          {data?.data?.packages?.map((plan, index) => {
            // Get price based on billing cycle - same as website
            const price =
              billingCycle === "yearly"
                ? plan.yearlyPrice
                : plan.monthlyPrice;
            const isCurrentLoading = loadingPlanId === plan.id;

            return (
              <View
                key={plan.id}
                style={[styles.planCard, plan.isPopular && styles.popularPlan]}
              >
                {/* Popular badge */}
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>
                      {t("plans.most_popular") || "Most Popular"}
                    </Text>
                  </View>
                )}

                {/* Plan name */}
                <Text style={styles.planTitle}>{plan.name}</Text>

                {/* Price */}
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{price}</Text>
                  <Text style={styles.currency}>
                    {plan.currency}/
                    {billingCycle === "yearly"
                      ? t("plans.year") || "year"
                      : t("plans.month") || "month"}
                  </Text>
                </View>

                {/* Yearly savings */}
                {billingCycle === "yearly" && plan.monthlyPrice && plan.yearlyPrice && (
                  <Text style={styles.savingsText}>
                    {t("plans.yearly_savings") || "Save"}{" "}
                    {Math.round(
                      ((plan.monthlyPrice * 12 - plan.yearlyPrice) /
                        (plan.monthlyPrice * 12)) *
                        100
                    )}
                    % {t("plans.compared_monthly") || "compared to monthly"}
                  </Text>
                )}

                {/* Description */}
                {plan.description && (
                  <Text style={styles.description}>{plan.description}</Text>
                )}

                {/* Features list */}
                {plan.features && plan.features.length > 0 && (
                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Icon
                          name="check"
                          size={18}
                          color={COLORS.primary}
                          style={styles.featureIcon}
                        />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Profiles allowed */}
                <View style={styles.infoItem}>
                  <Icon
                    name="people"
                    size={18}
                    color={COLORS.primary}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoText}>
                    {plan.profilesAllowed} {t("plans.profiles") || "Profiles"}
                  </Text>
                </View>

                {/* Download permission */}
                {plan.canDownload && (
                  <View style={styles.infoItem}>
                    <Icon
                      name="download"
                      size={18}
                      color={COLORS.primary}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>
                      {t("plans.download_available") || "Download available"}
                    </Text>
                  </View>
                )}

                {/* Subscribe button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePayment(plan)}
                  disabled={isCurrentLoading}
                >
                  {isCurrentLoading ? (
                    <Spinner isSmall={true} isWhite={true} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {t("buttons.plans_button") || "Subscribe"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <FrequentlyAskedQuestions
          title="Plans"
          data={data?.data?.faqs}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleContainer: {
    alignItems: "center",
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  toggleWrapper: {
    flexDirection: "row",
    backgroundColor: COLORS.grey,
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.darkWhite,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  saveBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: SPACING.sm,
  },
  saveBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  plansContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  planCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  popularBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    marginHorizontal: -SPACING.lg,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  popularBadgeText: {
    color: COLORS.white,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.white,
  },
  currency: {
    fontSize: 14,
    color: COLORS.darkWhite,
    marginLeft: SPACING.sm,
  },
  savingsText: {
    fontSize: 12,
    color: "#22c55e",
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 14,
    color: COLORS.darkWhite,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: SPACING.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  featureIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.darkWhite,
    flex: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  infoIcon: {
    marginRight: SPACING.md,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkWhite,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PlansScreen;
