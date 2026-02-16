import React, { useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import ScrollView from "../../components/common/ScrollViewTop";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import { usePostData } from "../../Hooks/usePostData";
import CourseSlider from "../Librarie/components/CourseSlider";
import CompletedCourses from "./CompletedCourses";
import ContinueWatchingSlider from "./ContinueWatchingSlider";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import AuthExpiredAlert from "../../components/common/AuthExpiredAlert";
import { useNavigation } from "@react-navigation/native";
import Header from "../../components/common/Header";
const MyProgress = () => {
  const { token, selectedUser, logoutHandler } = useContext(LoginAuthContext);
  const { postData, isLoading } = usePostData();
  const [isError, setIsError] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [data, setData] = useState([]);
  const { t } = useTranslation();
  const navigation = useNavigation();

  const getMyList = async () => {
    if (!selectedUser.id || !token) {
      setAuthError(true);
      return;
    }

    const body = {
      profile_id: selectedUser.id,
    };
    try {
      // First sync completed courses (fix any that should be marked complete)
      await postData("sync-completed-courses", body, token);

      // Then get progress data
      const response = await postData("my-progress", body, token);

      if (response.success) {
        console.log("=== My Progress API Response ===");
        console.log("continue_watching:", response.data?.continue_watching);
        console.log("completed_courses:", response.data?.completed_courses);
        setData(response.data);
      } else if (response.message === "Unauthenticated.") {
        setAuthError(true);
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.log(error);
      if (
        error?.message === "Unauthenticated." ||
        error?.response?.data?.message === "Unauthenticated."
      ) {
        setAuthError(true);
      } else {
        setIsError(true);
      }
    }
  };

  useEffect(() => {
    getMyList();
  }, []);

  const handleLoginRedirect = () => {
    if (logoutHandler) {
      logoutHandler();
    }
    navigation.navigate("Login");
  };

  const handleCancel = () => {
    logoutHandler();
    navigation.navigate("Main");
  };

  if (authError) {
    return (
      <View style={styles.authErrorContainer}>
        <AuthExpiredAlert
          onLogin={handleLoginRedirect}
          onCancel={handleCancel}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // if (!data || data.length === 0) {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.text}>{t("for_you.my_list")}</Text>
  //     </View>
  //   );
  // }

  // Check if there's any data to show
  const hasContinueWatching = data?.continue_watching?.length > 0;
  const hasCompletedCourses = data?.completed_courses?.length > 0;
  const hasMyList = data?.my_list?.length > 0;
  const hasNoData = !hasContinueWatching && !hasCompletedCourses && !hasMyList;

  if (hasNoData && !isLoading) {
    return (
      <ScrollView style={styles.container}>
        <Header />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {t("progress.my_progress") || "My Progress"}
          </Text>
          <Text style={styles.emptyText}>
            {t("progress.no_progress") || "You haven't started watching any courses yet. Start exploring and your progress will appear here!"}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.pageTitle}>
          {t("progress.my_progress") || "My Progress"}
        </Text>

        {/* Continue Watching Section */}
        {hasContinueWatching && (
          <ContinueWatchingSlider data={data?.continue_watching} />
        )}

        {/* Completed Courses Section */}
        {hasCompletedCourses && (
          <CompletedCourses data={data?.completed_courses} />
        )}

        {/* My List Section */}
        {hasMyList && (
          <CourseSlider title={t("for_you.my_list")} data={data?.my_list} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  content: {
    paddingVertical: 20,
    marginTop: SPACING.xl,
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  text: {
    color: COLORS.white,
    fontSize: 24,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
  },
  authErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    padding: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingTop: 100,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  emptyText: {
    color: COLORS.darkWhite,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default MyProgress;
