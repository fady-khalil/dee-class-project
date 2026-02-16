import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import { usePostDataNoLang } from "../../Hooks/usePostData";
import { useAuth } from "../../context/Authentication/LoginAuth";
import { I18nView } from "../../components/common/I18nComponents";

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postData } = usePostDataNoLang();
  const {
    user,
    token,
    loginHandler,
    setIsAuthenticated,
    setAllowedCoursesHandler,
  } = useAuth();

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const sessionId = route.params?.session_id;
    const purchaseType = route.params?.type; // "course" or "plan"

    console.log("=== PaymentSuccessScreen ===");
    console.log("session_id:", sessionId);
    console.log("type:", purchaseType);
    console.log("user:", user?.id || user?._id);

    if (sessionId && (user?.id || user?._id)) {
      refreshData(sessionId, purchaseType);
    } else if (!sessionId) {
      console.error("No session_id in route params");
      setHasError(true);
      // Navigate home after delay
      setTimeout(() => {
        navigation.navigate({ name: "Main", params: { screen: "Home" } });
      }, 2000);
    }
  }, [route.params, user]);

  const refreshData = async (sessionId, purchaseType) => {
    const userId = user?.id || user?._id;

    console.log("Calling webhook/refresh-data...");
    console.log("userId:", userId);
    console.log("sessionId:", sessionId);

    try {
      // Pass session_id to verify payment directly (same as website)
      const response = await postData("webhook/refresh-data", {
        user_id: userId,
        session_id: sessionId,
      });

      console.log("API Response:", JSON.stringify(response, null, 2));

      if (response.success) {
        const mobileUser = response?.data?.mobile_user;

        console.log("mobileUser:", JSON.stringify(mobileUser, null, 2));

        if (!mobileUser) {
          console.error("No mobile_user in response");
          setHasError(true);
          setTimeout(() => {
            navigation.navigate({ name: "Main", params: { screen: "Home" } });
          }, 2000);
          return;
        }

        // Update context with new user data (same as website)
        loginHandler(
          token,
          mobileUser,
          mobileUser?.allowed_profiles,
          mobileUser?.allowed_courses,
          mobileUser?.profiles
        );
        setAllowedCoursesHandler(mobileUser?.allowed_courses);

        // Determine where to redirect based on purchase type (same as website)
        if (purchaseType === "course") {
          // Course purchase - go to my courses
          console.log("Navigating to MyCourses...");
          setIsAuthenticated(mobileUser?.allowed_profiles !== null);
          navigation.reset({
            index: 0,
            routes: [{ name: "MyCourses" }],
          });
        } else if (mobileUser?.allowed_profiles !== null) {
          // Plan purchase with profiles - go to profiles page
          console.log("Navigating to MyProfiles...");
          setIsAuthenticated(true);
          navigation.reset({
            index: 0,
            routes: [{ name: "MyProfiles" }],
          });
        } else {
          // No active subscription - go home
          console.log("Navigating to Home...");
          setIsAuthenticated(false);
          navigation.navigate({ name: "Main", params: { screen: "Home" } });
        }
      } else {
        console.log("Refresh data failed:", response.message);
        setHasError(true);
        setTimeout(() => {
          navigation.navigate({ name: "Main", params: { screen: "Home" } });
        }, 2000);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setHasError(true);
      setTimeout(() => {
        navigation.navigate({ name: "Main", params: { screen: "Home" } });
      }, 2000);
    }
  };

  return (
    <I18nView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Icon
            name={hasError ? "error-outline" : "check-circle"}
            size={120}
            color={hasError ? "#ef4444" : "#22c55e"}
          />
          <View style={[styles.divider, hasError && styles.errorDivider]} />
        </View>

        {/* Success Message */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {hasError ? "Error" : "Success!"}
          </Text>
          <Text style={styles.message}>
            {hasError
              ? "Something went wrong. Redirecting..."
              : "Your payment has been completed successfully. Redirecting..."
            }
          </Text>
        </View>

        {/* Loading Indicator */}
        {!hasError && (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />
        )}

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>Need help? Contact our support team</Text>
        </View>
      </View>
    </I18nView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.backgroundColor,
    padding: SPACING.xl,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  divider: {
    width: 96,
    height: 4,
    backgroundColor: "#22c55e",
    marginTop: SPACING.lg,
    borderRadius: 2,
  },
  errorDivider: {
    backgroundColor: "#ef4444",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: 16,
    color: COLORS.darkWhite,
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
    lineHeight: 24,
  },
  loader: {
    marginTop: SPACING.xl,
  },
  helpContainer: {
    alignItems: "center",
    marginTop: 48,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.darkWhite,
    opacity: 0.7,
  },
});

export default PaymentSuccessScreen;
