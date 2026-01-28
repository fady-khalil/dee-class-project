import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  FlatList,
  StatusBar,
  View,
  Text,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../styles/colors";
import useFetch from "../../Hooks/useFetch";
import Spinner from "../../components/RequestHandler/Spinner";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import { HeaderBack } from "../../components/navigation";
import { useNetwork } from "../../context/Network";
import { useDownload } from "../../context/Download/DownloadContext";

// Import component sections
import TrailerVideo from "./components/watch/TrailerVideo";
import Instructor from "./components/instructor/Instructor";
import SingleCourse from "./components/details/SingleCourse";
import SeriesCourse from "./components/details/SeriesCourse";
import PlaylistCourse from "./components/details/PlaylistCourse";

const CourseDetail = ({ route, navigation }) => {
  const { slug, isPurchased: isPurchasedFromNav } = route.params;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const { fetchData } = useFetch();
  const { isConnected } = useNetwork();
  const { downloadedCourses, isCourseDownloaded, getCourseDownloadInfo } =
    useDownload();

  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Get authentication context
  const { isAuthenticated, token, isLoggedIn, selectedUser, allowedCourses } =
    useContext(LoginAuthContext);

  const getAuthCourse = async () => {
    try {
      const response = await fetchData(
        `courses/${slug}?profile_id=${selectedUser?.id}`,
        token
      );
      // API returns { data: {...}, success: true } - extract the data
      const courseData = response?.data || response;
      setData(courseData);
    } catch (error) {
      console.log(error);
      checkOfflineData();
    } finally {
      setIsLoading(false);
    }
  };

  const getCourse = async () => {
    try {
      const response = await fetchData(`courses/${slug}`);
      // API returns { data: {...}, success: true } - extract the data
      const courseData = response?.data || response;
      setData(courseData);
    } catch (error) {
      console.log(error);
      checkOfflineData();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // First check if we're offline and have the course downloaded
    if (!isConnected) {
      checkOfflineData();
      return;
    }

    // If online, proceed with normal data fetching
    if (isAuthenticated) {
      getAuthCourse();
    } else {
      getCourse();
    }
  }, [slug, token, isConnected]);

  // Check if we have this course in offline storage
  const checkOfflineData = () => {
    // Find the course by slug in downloaded courses
    const downloadedCourse = downloadedCourses.find(
      (course) => course.slug === slug
    );

    if (downloadedCourse) {
      console.log("Found downloaded course data, using offline mode");
      setData(downloadedCourse);
      setIsOfflineMode(true);
      setIsLoading(false); // Important: Stop the loading spinner immediately
    } else {
      // If we're offline but don't have the course downloaded, show an error
      setIsLoading(false);
      Alert.alert(
        t("navigation.offline_status"),
        t("downloads.video_not_available_offline"),
        [{ text: t("general.ok") }]
      );
    }
  };

  // Check if the course is purchased individually (in allowedCourses or passed from navigation)
  // Website pattern: hasAccess = isAuthenticated || isPurchased
  // - isAuthenticated = user has active plan/subscription
  // - isPurchased = course is in allowedCourses (bought individually) or passed from MyCourses
  useEffect(() => {
    // If navigating from MyCourses, the course is already known to be purchased
    if (isPurchasedFromNav) {
      setIsCoursePurchased(true);
      return;
    }

    const dataId = data?.id?.toString() || data?._id?.toString();

    if (!dataId) {
      setIsCoursePurchased(false);
      return;
    }

    let isPurchased = false;

    // Check allowedCourses array from context (same as website)
    if (allowedCourses && allowedCourses.length > 0) {
      isPurchased = allowedCourses.some((course) => {
        const courseId = typeof course === 'object'
          ? (course?.id?.toString() || course?._id?.toString() || course?.courseId?.toString())
          : course?.toString();
        return courseId === dataId;
      });
    }

    setIsCoursePurchased(isPurchased);
  }, [data, allowedCourses, isPurchasedFromNav]);

  // Render different components based on course_type
  const renderCourseContent = () => {
    if (!data) return null;

    switch (data.course_type) {
      case "single":
        return (
          <SingleCourse
            courseData={data}
            isAuthenticated={isAuthenticated}
            isLoggedIn={isLoggedIn}
            navigation={navigation}
            isCoursePurchased={isCoursePurchased}
            isOfflineMode={isOfflineMode}
          />
        );
      case "series":
        return (
          <SeriesCourse
            courseData={data}
            isAuthenticated={isAuthenticated}
            isLoggedIn={isLoggedIn}
            navigation={navigation}
            isCoursePurchased={isCoursePurchased}
            isOfflineMode={isOfflineMode}
          />
        );
      case "playlist":
        return (
          <PlaylistCourse
            courseData={data}
            isAuthenticated={isAuthenticated}
            isLoggedIn={isLoggedIn}
            navigation={navigation}
            isCoursePurchased={isCoursePurchased}
            isOfflineMode={isOfflineMode}
          />
        );
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t("errors.general.message")}</Text>
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner />
        <Text style={styles.loadingText}>{t("general.loading")}</Text>
      </View>
    );
  }

  if (data) {
    // Support both field names: trailer_with_api_video_object (old) and trailer (website format)
    const trailerData = data?.trailer_with_api_video_object || data?.trailer;
    const videoId = trailerData?.videoId;
    const sections = [
      {
        id: "trailer",
        component: (
          <TrailerVideo
            isAuthenticated={isAuthenticated}
            data={data}
            videoId={videoId}
            trailerData={trailerData}
            navigation={navigation}
            isCoursePurchased={isCoursePurchased}
            isOfflineMode={isOfflineMode}
          />
        ),
      },

      {
        id: "instructor",
        component: <Instructor data={data?.instructor_profile || data?.instructor} />,
      },
      {
        id: "content",
        component: renderCourseContent(),
      },
    ];

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <HeaderBack
          pageName={data?.name}
          onPress={() => navigation.goBack()}
          isBack={true}
        />
        {isOfflineMode && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              {t("navigation.offline_status")} - {t("downloads.downloaded")}
            </Text>
          </View>
        )}
        <FlatList
          data={sections}
          renderItem={({ item }) => item.component}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        />
      </View>
    );
  }

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{t("general.error_message")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
  },
  loadingText: {
    color: COLORS.white,
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: COLORS.primary,
    padding: 8,
    alignItems: "center",
  },
  offlineText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default CourseDetail;
