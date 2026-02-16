import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../../../styles/colors";
import SPACING from "../../../../styles/spacing";
import Icon from "react-native-vector-icons/MaterialIcons";
import LessonCompletedBadge from "../../../../components/common/LessonCompletedBadge";

/**
 * SingleContent - Content view for single video courses
 * Displays the main video in a row-based card (consistent with SeriesContent)
 */
const SingleContent = ({
  courseData,
  selectedVideo,
  onVideoSelect,
  completedVideos = {},
  isVideoCompleted,
  loadingVideoId,
  isCourseCompleted,
}) => {
  const { t } = useTranslation();

  // Get main video data
  const mainVideo = courseData?.api_video_object || courseData?.main_with_api_video_object;
  const videoId = mainVideo?.videoId;
  const thumbnailUrl = mainVideo?.assets?.thumbnail || courseData?.thumbnail;
  const isCompleted = isVideoCompleted?.(videoId) || completedVideos[videoId] || courseData?.is_done || isCourseCompleted;
  const isSelected = selectedVideo?.videoId === videoId;
  const isLoading = loadingVideoId === videoId;

  const handleSelect = () => {
    if (mainVideo?.videoId) {
      onVideoSelect({
        type: "main",
        videoId: mainVideo.videoId,
        thumbnail: mainVideo.assets?.thumbnail,
        title: courseData.name,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with completion status */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {isCompleted ? "1/1" : "0/1"} {t("courses.lessons_completed")}
          </Text>
          {(isCompleted || isCourseCompleted) && (
            <LessonCompletedBadge variant="text" size="medium" />
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: isCompleted ? "100%" : "0%" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Main Video Card - Row based like SeriesContent */}
      <View style={styles.contentList}>
        <TouchableOpacity
          style={[styles.videoCard, isSelected && styles.selectedCard]}
          onPress={handleSelect}
          activeOpacity={0.7}
        >
          {/* Thumbnail */}
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />

            {/* Status Indicator */}
            <View style={styles.statusOverlay}>
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : isCompleted ? (
                <Icon name="check-circle" size={24} color={COLORS.green || "#4CAF50"} />
              ) : isSelected ? (
                <Icon name="play-circle-filled" size={24} color={COLORS.primary} />
              ) : (
                <Icon name="play-circle-outline" size={24} color={COLORS.white} />
              )}
            </View>
          </View>

          {/* Video Info */}
          <View style={styles.videoInfo}>
            <View style={styles.videoHeader}>
              <Text style={styles.videoLabel}>
                {t("courses.mainContent")}
              </Text>
              {isCompleted && (
                <LessonCompletedBadge variant="text" size="small" />
              )}
            </View>
            <Text
              style={[styles.videoTitle, isSelected && styles.selectedTitle]}
              numberOfLines={2}
            >
              {courseData?.name || courseData?.title}
            </Text>
            {courseData?.description && (
              <Text style={styles.videoDescription} numberOfLines={1}>
                {courseData.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  statsText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  contentList: {
    padding: SPACING.lg,
  },
  videoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  selectedCard: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  thumbnailContainer: {
    width: 100,
    height: 70,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: "center",
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  videoLabel: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  videoTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  selectedTitle: {
    color: COLORS.primary,
  },
  videoDescription: {
    color: COLORS.darkWhite,
    fontSize: 12,
  },
});

export default SingleContent;
