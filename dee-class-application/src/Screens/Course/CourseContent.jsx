import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../styles/colors";
import useFetch from "../../Hooks/useFetch";
import Spinner from "../../components/RequestHandler/Spinner";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import VideoPlayer from "./components/watch/VideoPlayer";
import PlaylistContent from "./components/details/PlaylistContent";
import SeriesContent from "./components/details/SeriesContent";
import SingleContent from "./components/details/SingleContent";
import HeaderBack from "../../components/navigation/HeaderBack";
import { useNetwork } from "../../context/Network";

/**
 * CourseContent - Watch screen for all course types
 * Matches d-class website implementation
 */
const CourseContent = ({ route, navigation }) => {
  const { slug } = route.params;
  const { t } = useTranslation();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [completedVideos, setCompletedVideos] = useState({});

  // Refs
  const isMountedRef = useRef(true);

  // Context
  const { fetchData } = useFetch();
  const { isAuthenticated, token, selectedUser, user } = useContext(LoginAuthContext);
  const { isConnected } = useNetwork();

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch course data
  const getCourse = async () => {
    try {
      if (!isMountedRef.current) return;
      setIsLoading(true);

      // Build URL with profile_id for progress tracking
      const profileId = selectedUser?.id || user?._id || user?.id;
      const url = profileId
        ? `courses/${slug}?profile_id=${profileId}`
        : `courses/${slug}`;

      console.log("[CourseContent] Fetching:", url);
      const response = await fetchData(url, token);

      // Check if still mounted after async operation
      if (!isMountedRef.current) return;

      // Extract course data (API returns { data: courseData })
      const courseData = response?.data || response;
      console.log("[CourseContent] Course type:", courseData?.course_type);

      setData(courseData);

      // Initialize completed videos from API response
      if (courseData?.completed_videos && Array.isArray(courseData.completed_videos)) {
        const completedMap = {};
        courseData.completed_videos.forEach((videoId) => {
          completedMap[videoId] = true;
        });
        setCompletedVideos(completedMap);
        console.log("[CourseContent] Completed videos:", Object.keys(completedMap).length);
      }

      // Set initial video based on course type
      setInitialVideo(courseData);
    } catch (error) {
      console.error("[CourseContent] Error fetching course:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Set initial video to play
  const setInitialVideo = (courseData) => {
    if (!courseData || !isMountedRef.current) return;

    // Try trailer first
    const trailer = courseData.trailer_with_api_video_object || courseData.trailer;
    if (trailer?.videoId) {
      console.log("[CourseContent] Setting trailer as initial video");
      setSelectedVideo({
        type: "trailer",
        videoId: trailer.videoId,
        thumbnail: trailer.assets?.thumbnail,
        title: courseData.name,
      });
      return;
    }

    // Fallback based on course type
    switch (courseData.course_type) {
      case "single": {
        const mainVideo = courseData.api_video_object || courseData.main_with_api_video_object;
        if (mainVideo?.videoId) {
          setSelectedVideo({
            type: "main",
            videoId: mainVideo.videoId,
            thumbnail: mainVideo.assets?.thumbnail,
            title: courseData.name,
          });
        }
        break;
      }
      case "series": {
        const firstEpisode = courseData.series?.[0];
        if (firstEpisode?.series_video_id?.videoId) {
          setSelectedVideo({
            type: "series",
            videoId: firstEpisode.series_video_id.videoId,
            thumbnail: firstEpisode.series_video_id.assets?.thumbnail,
            title: firstEpisode.title,
            index: 0,
          });
        }
        break;
      }
      case "playlist": {
        const firstChapter = courseData.chapters?.[0];
        const firstLesson = firstChapter?.lessons?.[0];
        if (firstLesson?.video_id?.videoId) {
          setSelectedVideo({
            type: "playlist",
            videoId: firstLesson.video_id.videoId,
            thumbnail: firstLesson.video_id.assets?.thumbnail,
            title: firstLesson.title,
            chapterIndex: 0,
            lessonIndex: 0,
          });
        }
        break;
      }
    }
  };

  // Handle video selection
  const handleVideoSelect = useCallback((videoInfo) => {
    if (!isMountedRef.current) return;
    console.log("[CourseContent] Video selected:", videoInfo);
    setSelectedVideo(videoInfo);
  }, []);

  // Handle video completion
  const handleVideoCompleted = useCallback((videoId) => {
    if (!isMountedRef.current) return;
    console.log("[CourseContent] Video completed:", videoId);
    setCompletedVideos((prev) => ({ ...prev, [videoId]: true }));
  }, []);

  // Get video progress from API data
  const getVideoProgress = (videoId) => {
    if (!videoId || !data?.video_progress) return null;

    const progress = data.video_progress[videoId];
    if (progress) {
      return {
        timestamp: progress.timestamp || 0,
        timeSlap: progress.timeSlap || progress.time_slap,
      };
    }
    return null;
  };

  // Check if video is completed
  const isVideoCompleted = (videoId) => {
    if (!videoId) return false;
    if (completedVideos[videoId]) return true;
    if (data?.completed_videos?.includes(videoId)) return true;
    return false;
  };

  // Fetch data on mount
  useEffect(() => {
    if (isConnected) {
      getCourse();
    }
  }, [slug, token, isConnected]);

  // Render content based on course type
  const renderContent = () => {
    if (!data) return null;

    const commonProps = {
      courseData: data,
      selectedVideo,
      onVideoSelect: handleVideoSelect,
      completedVideos,
      isVideoCompleted,
    };

    switch (data.course_type) {
      case "single":
        return <SingleContent {...commonProps} />;
      case "series":
        return <SeriesContent {...commonProps} />;
      case "playlist":
        return <PlaylistContent {...commonProps} />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t("errors.general.message")}</Text>
          </View>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner />
        <Text style={styles.loadingText}>{t("general.loading")}</Text>
      </View>
    );
  }

  // Error state
  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("general.error_message")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundColor} />

      <HeaderBack
        screenName={data.name || t("watch_your_course")}
        onBack={() => navigation.goBack()}
        isBack={true}
      />

      {/* Video Player */}
      <View style={styles.playerContainer}>
        <VideoPlayer
          videoData={data}
          videoId={selectedVideo?.videoId}
          courseId={data._id || data.id}
          courseSlug={slug}
          videoProgress={getVideoProgress(selectedVideo?.videoId)}
          initialIsDone={isVideoCompleted(selectedVideo?.videoId)}
          onVideoCompleted={handleVideoCompleted}
          thumbnail={selectedVideo?.thumbnail}
        />
      </View>

      {/* Course Info */}
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {selectedVideo?.title || data.name}
        </Text>
        {selectedVideo?.type !== "trailer" && selectedVideo?.title !== data.name && (
          <Text style={styles.courseSubtitle}>{data.name}</Text>
        )}
      </View>

      {/* Content List */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.black,
  },
  courseInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  courseSubtitle: {
    color: COLORS.darkWhite,
    fontSize: 14,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
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
    padding: 20,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
  },
});

export default CourseContent;
