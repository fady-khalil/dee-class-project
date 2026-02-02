import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../styles/colors";
import { usePostData } from "../../Hooks/usePostData";
import { useAuth } from "../../context/Authentication/LoginAuth";
import { useNavigation } from "@react-navigation/native";
import CourseSlider from "./components/CourseSlider";

const ForYouSection = () => {
  const { t } = useTranslation();
  const { postData, isLoading, error } = usePostData();
  const { selectedUser, token, logoutHandler } = useAuth();
  const navigation = useNavigation();
  const [forYouCourses, setForYouCourses] = useState({
    continue_watching: [],
    recommended_courses: [],
    new_added: [],
    my_list: [],
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [expiredToken, setExpiredToken] = useState(false);

  const getForYouData = async () => {
    if (!selectedUser?.id) {
      console.log("[ForYouSection] No selectedUser.id");
      return;
    }

    const body = {
      profile_id: selectedUser.id,
    };

    console.log("[ForYouSection] Fetching profile-for-you with:", body);
    const response = await postData("profile-for-you", body, token);
    console.log("[ForYouSection] Response:", response);

    if (response.success) {
      setForYouCourses(response.data);
      setErrorMessage(null);
    } else if (response.status === 401) {
      setExpiredToken(true);
    } else {
      setErrorMessage(response?.message || "Failed to load content");
    }
  };

  useEffect(() => {
    getForYouData();
  }, [selectedUser?.id]);

  const handleLogout = async () => {
    await logoutHandler();
    navigation.navigate("Login");
  };

  const handleRetry = () => {
    setExpiredToken(false);
    getForYouData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t("general.loading")}</Text>
      </View>
    );
  }

  if (expiredToken) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>
            {t("auth.login.session_expired")}
          </Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity
              style={[styles.errorButton, styles.primaryButton]}
              onPress={handleLogout}
            >
              <Text style={styles.primaryButtonText}>
                {t("navigation.sign_in")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.errorButton, styles.secondaryButton]}
              onPress={handleRetry}
            >
              <Text style={styles.secondaryButtonText}>
                {t("auth.logout.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  // Check if there's any data
  const hasData =
    forYouCourses?.continue_watching?.length > 0 ||
    forYouCourses?.new_added?.length > 0 ||
    forYouCourses?.recommended_courses?.length > 0 ||
    forYouCourses?.my_list?.length > 0;

  if (!hasData && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {t("for_you.no_content") || "No personalized content yet. Start exploring courses!"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Continue Watching */}
      {forYouCourses?.continue_watching?.length > 0 && (
        <CourseSlider
          title={t("for_you.continue_watching")}
          data={forYouCourses?.continue_watching}
        />
      )}

      {/* New Added / New to Dee Class */}
      {forYouCourses?.new_added?.length > 0 && (
        <CourseSlider
          title={t("for_you.new_added") || t("for_you.new_to_master_class")}
          data={forYouCourses?.new_added}
        />
      )}

      {/* Recommended Courses */}
      {forYouCourses?.recommended_courses?.length > 0 && (
        <CourseSlider
          title={t("for_you.recommended_courses") || t("for_you.picked_for_you")}
          data={forYouCourses?.recommended_courses}
        />
      )}

      {/* My List */}
      {forYouCourses?.my_list?.length > 0 && (
        <CourseSlider
          title={t("for_you.my_list")}
          data={forYouCourses?.my_list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: COLORS.errorBackground,
    borderRadius: 8,
    margin: 16,
  },
  errorContent: {
    gap: 16,
  },
  errorTitle: {
    color: COLORS.error,
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
  },
  errorButtons: {
    flexDirection: "row",
    gap: 12,
  },
  errorButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.grey,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: COLORS.darkWhite,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    color: COLORS.darkWhite,
    fontSize: 16,
    textAlign: "center",
  },
});

export default ForYouSection;
