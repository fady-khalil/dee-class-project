import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../../../styles/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import LessonCompletedBadge from "../../../../components/common/LessonCompletedBadge";

/**
 * SingleContent - Content view for single video courses
 * Displays the main video with play button overlay
 */
const SingleContent = ({
  courseData,
  selectedVideo,
  onVideoSelect,
  completedVideos = {},
  isVideoCompleted,
}) => {
  const { t } = useTranslation();

  // Get main video data
  const mainVideo = courseData?.api_video_object || courseData?.main_with_api_video_object;
  const videoId = mainVideo?.videoId;
  const thumbnailUrl = mainVideo?.assets?.thumbnail || courseData?.thumbnail;
  const isCompleted = isVideoCompleted?.(videoId) || completedVideos[videoId] || courseData?.is_done;
  const isSelected = selectedVideo?.videoId === videoId;

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
      {/* Course Completed Badge */}
      {isCompleted && (
        <View style={styles.completedBadgeContainer}>
          <LessonCompletedBadge variant="text" size="medium" />
        </View>
      )}

      {/* Main Video Card */}
      <TouchableOpacity
        style={[styles.videoCard, isSelected && styles.selectedCard]}
        onPress={handleSelect}
        activeOpacity={0.8}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          {/* Play/Check Overlay */}
          <View style={styles.overlay}>
            {isCompleted ? (
              <View style={styles.completedIconContainer}>
                <Icon name="check-circle" size={48} color={COLORS.green || "#4CAF50"} />
              </View>
            ) : (
              <View style={styles.playIconContainer}>
                <Icon name="play-circle-filled" size={64} color={COLORS.white} />
              </View>
            )}
          </View>

          {/* Status Badge on Thumbnail */}
          {isCompleted && (
            <View style={styles.thumbnailBadge}>
              <LessonCompletedBadge variant="icon" size="small" />
            </View>
          )}
        </View>

        {/* Video Info */}
        <View style={styles.videoInfo}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t("courses.mainContent") || "Main Content"}</Text>
            {isCompleted && (
              <LessonCompletedBadge variant="text" size="small" />
            )}
          </View>
          <Text style={[styles.title, isSelected && styles.selectedTitle]} numberOfLines={2}>
            {courseData?.name || courseData?.title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {courseData?.description}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Instructor Info (if available) */}
      {courseData?.instructor && (
        <View style={styles.instructorCard}>
          <Image
            source={{ uri: courseData.instructor.profileImage || courseData.instructor.image }}
            style={styles.instructorImage}
          />
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorLabel}>{t("courses.instructor") || "Instructor"}</Text>
            <Text style={styles.instructorName}>{courseData.instructor.name}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  completedBadgeContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  videoCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    overflow: "hidden",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  thumbnailContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconContainer: {
    opacity: 0.9,
  },
  completedIconContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    padding: 4,
  },
  thumbnailBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  videoInfo: {
    padding: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 26,
  },
  selectedTitle: {
    color: COLORS.primary,
  },
  description: {
    color: COLORS.darkWhite,
    fontSize: 14,
    lineHeight: 20,
  },
  instructorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  instructorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorLabel: {
    color: COLORS.darkWhite,
    fontSize: 12,
    marginBottom: 2,
  },
  instructorName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SingleContent;
