import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../../../styles/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import LessonCompletedBadge from "../../../../components/common/LessonCompletedBadge";

/**
 * SeriesContent - Content view for series courses
 * Displays a list of episodes with thumbnails and completion status
 */
const SeriesContent = ({
  courseData,
  selectedVideo,
  onVideoSelect,
  completedVideos = {},
  isVideoCompleted,
}) => {
  const { t } = useTranslation();

  // Calculate completion stats
  const totalEpisodes = courseData?.series?.length || 0;
  const completedEpisodes = courseData?.series?.filter((item) => {
    const videoId = item.series_video_id?.videoId;
    return isVideoCompleted?.(videoId) || completedVideos[videoId] || item.is_done;
  }).length || 0;

  const isAllCompleted = totalEpisodes > 0 && completedEpisodes === totalEpisodes;

  const handleSelect = (item, index) => {
    if (item.series_video_id?.videoId) {
      onVideoSelect({
        type: "series",
        videoId: item.series_video_id.videoId,
        thumbnail: item.series_video_id.assets?.thumbnail,
        title: item.title,
        index,
      });
    }
  };

  const renderEpisode = (item, index) => {
    const videoId = item.series_video_id?.videoId;
    const thumbnailUrl = item.series_video_id?.assets?.thumbnail || item.thumbnail;
    const isCompleted = isVideoCompleted?.(videoId) || completedVideos[videoId] || item.is_done;
    const isSelected = selectedVideo?.videoId === videoId;

    return (
      <TouchableOpacity
        key={`episode-${index}`}
        style={[styles.episodeCard, isSelected && styles.selectedCard]}
        onPress={() => handleSelect(item, index)}
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
            {isCompleted ? (
              <Icon name="check-circle" size={24} color={COLORS.green || "#4CAF50"} />
            ) : isSelected ? (
              <Icon name="play-circle-filled" size={24} color={COLORS.primary} />
            ) : (
              <Icon name="play-circle-outline" size={24} color={COLORS.white} />
            )}
          </View>
        </View>

        {/* Episode Info */}
        <View style={styles.episodeInfo}>
          <View style={styles.episodeHeader}>
            <Text style={styles.episodeNumber}>
              {t("courses.episode") || "Episode"} {index + 1}
            </Text>
            {isCompleted && (
              <LessonCompletedBadge variant="text" size="small" />
            )}
          </View>
          <Text
            style={[styles.episodeTitle, isSelected && styles.selectedTitle]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.episodeDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {completedEpisodes}/{totalEpisodes} {t("courses.episodes_completed") || "Episodes Completed"}
          </Text>
          {isAllCompleted && (
            <LessonCompletedBadge variant="text" size="medium" />
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${totalEpisodes > 0 ? (completedEpisodes / totalEpisodes) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Episodes List */}
      <View style={styles.episodesList}>
        {courseData?.series?.map((item, index) => renderEpisode(item, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  episodesList: {
    padding: 16,
  },
  episodeCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 12,
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
  episodeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  episodeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  episodeNumber: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  episodeTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectedTitle: {
    color: COLORS.primary,
  },
  episodeDescription: {
    color: COLORS.darkWhite,
    fontSize: 12,
  },
});

export default SeriesContent;
