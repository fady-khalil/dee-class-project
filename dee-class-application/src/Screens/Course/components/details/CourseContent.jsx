import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../../../styles/colors";
import VideoPlayer from "../watch/VideoPlayer";
import { useNetwork } from "../../../../context/NetworkContext";

const CourseContent = ({ courseData, isAuthenticated, isCoursePurchased }) => {
  const { t } = useTranslation();
  const { isConnected } = useNetwork();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  // Use ref to prevent infinite loops
  const hasInitializedRef = useRef(false);

  // Simple initialization without complex dependencies
  useEffect(() => {
    if (hasInitializedRef.current || !courseData) return;

    hasInitializedRef.current = true;

    // Set initial video
    if (courseData.course_type === "series" && courseData.seasons?.length > 0) {
      const firstSeason = courseData.seasons[0];
      if (firstSeason.episodes?.length > 0) {
        setSelectedVideo(firstSeason.episodes[0]);
      }
    } else if (
      courseData.course_type === "playlist" &&
      courseData.videos?.length > 0
    ) {
      setSelectedVideo(courseData.videos[0]);
    }
  }, []); // Empty dependency array

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const renderVideoItem = ({ item: video, index }) => {
    const isSelected = selectedVideo?.id === video.id;
    const canPlay = isAuthenticated && (isCoursePurchased || !isConnected);

    return (
      <TouchableOpacity
        style={[styles.videoItem, isSelected && styles.selectedVideoItem]}
        onPress={() => canPlay && handleVideoSelect(video)}
        disabled={!canPlay}
      >
        <View style={styles.videoInfo}>
          <View style={styles.videoHeader}>
            <Text
              style={[
                styles.videoTitle,
                !canPlay && styles.lockedText,
                isSelected && styles.selectedVideoTitle,
              ]}
            >
              {video.title}
            </Text>
            {!canPlay && (
              <Ionicons name="lock-closed" size={16} color={COLORS.gray} />
            )}
          </View>

          {video.description && (
            <Text
              style={[styles.videoDescription, !canPlay && styles.lockedText]}
              numberOfLines={2}
            >
              {video.description}
            </Text>
          )}

          <View style={styles.videoMeta}>
            <Text style={[styles.videoIndex, !canPlay && styles.lockedText]}>
              {t("course.video")} {index + 1}
            </Text>
            {video.duration && (
              <Text
                style={[styles.videoDuration, !canPlay && styles.lockedText]}
              >
                {video.duration}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSeasonSection = ({ item: season, index }) => {
    const isExpanded = expandedSections[season.id] !== false; // Default to expanded

    return (
      <View style={styles.seasonSection}>
        <TouchableOpacity
          style={styles.seasonHeader}
          onPress={() => toggleSection(season.id)}
        >
          <Text style={styles.seasonTitle}>
            {season.title || `${t("course.season")} ${index + 1}`}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        {isExpanded && season.episodes && (
          <FlatList
            data={season.episodes}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (!courseData) return null;

    if (courseData.course_type === "series" && courseData.seasons) {
      return (
        <FlatList
          data={courseData.seasons}
          renderItem={renderSeasonSection}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      );
    }

    if (courseData.course_type === "playlist" && courseData.videos) {
      return (
        <FlatList
          data={courseData.videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      );
    }

    return (
      <View style={styles.noContentContainer}>
        <Text style={styles.noContentText}>
          {t("course.no_content_available")}
        </Text>
      </View>
    );
  };

  if (!courseData) {
    return (
      <View style={styles.noContentContainer}>
        <Text style={styles.noContentText}>
          {t("course.no_content_available")}
        </Text>
      </View>
    );
  }

  const canShowPlayer =
    isAuthenticated && (isCoursePurchased || !isConnected) && selectedVideo;

  return (
    <View style={styles.container}>
      {!isConnected && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="cloud-offline" size={16} color={COLORS.white} />
          <Text style={styles.offlineText}>{t("downloads.offline_mode")}</Text>
        </View>
      )}

      {canShowPlayer && (
        <View style={styles.playerContainer}>
          <VideoPlayer
            videoId={selectedVideo.video_id || selectedVideo.videoId}
            courseId={courseData.id}
            title={selectedVideo.title}
            isOffline={!isConnected}
          />
        </View>
      )}

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>{t("course.course_content")}</Text>
        {renderContent()}
      </View>

      {!isAuthenticated && (
        <View style={styles.authPrompt}>
          <Text style={styles.authPromptText}>
            {t("course.login_to_watch")}
          </Text>
        </View>
      )}

      {isAuthenticated && !isCoursePurchased && isConnected && (
        <View style={styles.purchasePrompt}>
          <Text style={styles.purchasePromptText}>
            {t("course.purchase_to_watch")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: COLORS.primary,
  },
  offlineText: {
    color: COLORS.white,
    marginLeft: 10,
  },
  playerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  videoItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
  },
  selectedVideoItem: {
    backgroundColor: COLORS.selected,
  },
  videoInfo: {
    flexDirection: "column",
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoTitle: {
    flex: 1,
    fontSize: 16,
  },
  lockedText: {
    color: COLORS.gray,
  },
  selectedVideoTitle: {
    color: COLORS.primary,
  },
  videoDescription: {
    marginTop: 5,
  },
  videoMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  videoIndex: {
    marginRight: 10,
  },
  videoDuration: {
    marginLeft: 10,
  },
  seasonSection: {
    marginBottom: 10,
  },
  seasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
  },
  seasonTitle: {
    flex: 1,
    fontSize: 16,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noContentText: {
    color: COLORS.gray,
  },
  authPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authPromptText: {
    color: COLORS.primary,
  },
  purchasePrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  purchasePromptText: {
    color: COLORS.primary,
  },
});

export default CourseContent;
