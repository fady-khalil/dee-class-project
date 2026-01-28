import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import COLORS from "../../../../styles/colors";
import { I18nText } from "../../../../components/common/I18nComponents";
import { LoginAuthContext } from "../../../../context/Authentication/LoginAuth";
import usePayment from "../../../../Hooks/usePayment";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 350;
const isShortScreen = height < 700;

const PurchaseModal = ({ isOpen, onClose, data, isLoading, navigation }) => {
  const { t } = useTranslation();
  const auth = useContext(LoginAuthContext);
  // Check both isLoggedIn and isAuthenticated for compatibility
  const isLoggedIn = auth ? (auth.isLoggedIn || auth.isAuthenticated) : false;
  const user = auth ? auth.user : null;
  const token = auth ? auth.token : null;
  const { postData, isLoading: paymentLoading } = usePayment();

  // New state for packages
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // Fetch packages when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  // Function to fetch available packages
  const fetchPackages = async () => {
    // This would be implemented to fetch packages from your API
    // For now we'll just show the subscription option that redirects to Plans
    setPackagesLoading(true);
    try {
      // Example API call - replace with your actual implementation
      // const response = await fetch('your-api-endpoint/packages');
      // const data = await response.json();
      // setPackages(data);

      // Simulate API call
      setTimeout(() => {
        setPackagesLoading(false);
      }, 500);
    } catch (error) {
      console.log("Error fetching packages:", error);
      setPackagesLoading(false);
    }
  };

  const navigateToCheckout = (checkoutUrl) => {
    if (navigation && checkoutUrl) {
      navigation.navigate("WebView", {
        url: checkoutUrl,
        title: "Checkout",
      });
      onClose();
    }
  };

  const handlePayment = async (courseId) => {
    // Get the course ID - support both id and _id
    const actualCourseId = courseId || data?._id || data?.id;
    const userId = user?._id || user?.id;

    console.log("=== Payment Debug ===");
    console.log("auth context:", auth ? "exists" : "null");
    console.log("auth.isLoggedIn:", auth?.isLoggedIn);
    console.log("auth.isAuthenticated:", auth?.isAuthenticated);
    console.log("isLoggedIn (computed):", isLoggedIn);
    console.log("token:", token ? "exists" : "null");
    console.log("user:", user ? JSON.stringify(user, null, 2) : "null");
    console.log("courseId param:", courseId);
    console.log("actualCourseId:", actualCourseId);
    console.log("userId:", userId);
    console.log("data:", data ? JSON.stringify({ id: data.id, _id: data._id, name: data.name, price: data.price }, null, 2) : "null");

    if (!actualCourseId) {
      console.log("Error: No course ID available");
      return;
    }

    if (isLoggedIn) {
      try {
        // Use Expo Linking to create proper deep link URLs (works for both Expo Go and production)
        const baseSuccessUrl = Linking.createURL("payment/success");
        const successUrl = `${baseSuccessUrl}?session_id={CHECKOUT_SESSION_ID}&type=course`;
        const cancelUrl = Linking.createURL("payment/cancel");

        console.log("Success URL:", successUrl);
        console.log("Cancel URL:", cancelUrl);

        const requestBody = {
          type: "course",
          user_id: userId,
          id: actualCourseId,
          source: "application",
          success_url: successUrl,
          cancel_url: cancelUrl,
        };

        console.log("Request body:", JSON.stringify(requestBody, null, 2));

        const response = await postData("create-checkout-session", requestBody);

        console.log("Payment response:", JSON.stringify(response, null, 2));

        if (response?.status === 200 && response?.data?.checkout_url) {
          // For mobile app, open Stripe checkout in browser
          console.log("Opening checkout URL:", response.data.checkout_url);
          Linking.openURL(response.data.checkout_url);
          onClose();
        } else if (response?.data?.checkout_url) {
          // Sometimes status might be different but checkout_url exists
          console.log("Opening checkout URL (alt):", response.data.checkout_url);
          Linking.openURL(response.data.checkout_url);
          onClose();
        } else {
          console.log("Payment failed - no checkout URL in response");
          console.log("Response status:", response?.status);
          console.log("Response message:", response?.message);
        }
      } catch (error) {
        console.log("Payment error:", error);
      }
    } else {
      // If not logged in, navigate to registration
      console.log("User not logged in, redirecting to register");
      onClose();
      if (navigation) {
        navigation.navigate("Register", {
          course_id: actualCourseId,
          is_register: true,
        });
      }
    }
  };

  const handleViewPlans = () => {
    onClose();
    if (navigation) {
      // Pass along the course data to potentially use in the Plans screen
      navigation.navigate("Plans", {
        fromCourse: true,
        courseId: data?.id,
        courseName: data?.name,
      });
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {t("courses.access_course")}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Icon name="close" size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Course info */}
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName} numberOfLines={2}>
                    {data?.name}
                  </Text>
                  <Text style={styles.chooseText}>
                    {t("courses.choose_access_option")}
                  </Text>
                </View>

                {/* Single purchase option */}
                <View style={styles.optionCard}>
                  <View style={styles.optionHeader}>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle} numberOfLines={1}>
                        {t("courses.single_purchase")}
                      </Text>
                      <Text style={styles.optionSubtitle} numberOfLines={2}>
                        {t("courses.one_time_payment")}
                      </Text>
                    </View>
                    <Text style={styles.priceText}>
                      {data?.price} {t("courses.currency")}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => handlePayment(data?._id || data?.id)}
                    disabled={isLoading || paymentLoading}
                    activeOpacity={0.7}
                  >
                    {isLoading || paymentLoading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.buttonText}>
                        {t("buttons.buy_now")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Subscription option */}
                <View style={[styles.optionCard, styles.subscriptionCard]}>
                  <View style={styles.optionHeader}>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle} numberOfLines={1}>
                        {t("courses.subscription")}
                      </Text>
                      <Text style={styles.optionSubtitle} numberOfLines={2}>
                        {t("courses.unlimited_access")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                      <Icon
                        name="check-circle"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.featureText} numberOfLines={2}>
                        {t("general.plans_feature_1")}
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Icon
                        name="check-circle"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.featureText} numberOfLines={2}>
                        {t("general.plans_feature_2")}
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Icon
                        name="check-circle"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.featureText} numberOfLines={2}>
                        {t("general.plans_feature_3")}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleViewPlans}
                    disabled={isLoading || paymentLoading || packagesLoading}
                    activeOpacity={0.7}
                  >
                    {isLoading || paymentLoading || packagesLoading ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Text style={styles.secondaryButtonText}>
                        {t("buttons.plans_button")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: isSmallScreen ? 12 : 16,
  },
  modalContent: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: isSmallScreen ? 12 : 16,
    maxHeight: isShortScreen ? "90%" : "80%",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.black,
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "bold",
    flex: 1,
    paddingRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  courseInfo: {
    marginBottom: 16,
  },
  courseName: {
    color: COLORS.black,
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chooseText: {
    color: COLORS.grey,
    fontSize: isSmallScreen ? 12 : 14,
    marginBottom: 8,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: "#f5f5f5",
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  optionTextContainer: {
    flex: 3,
    paddingRight: 8,
  },
  optionTitle: {
    color: COLORS.black,
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "500",
  },
  optionSubtitle: {
    color: COLORS.grey,
    fontSize: isSmallScreen ? 11 : 12,
    marginTop: 4,
  },
  priceText: {
    color: COLORS.black,
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    minHeight: 44,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "500",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "500",
  },
  featureList: {
    marginBottom: 16,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  featureText: {
    color: COLORS.grey,
    fontSize: isSmallScreen ? 11 : 12,
    marginLeft: 8,
    flex: 1,
  },
});

export default PurchaseModal;
