import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../../../styles/colors";
import SPACING from "../../../../styles/spacing";
import Icon from "react-native-vector-icons/MaterialIcons";
import LessonCompletedBadge from "../../../../components/common/LessonCompletedBadge";

/**
 * PlaylistContent - Content view for playlist courses
 * Displays expandable chapters with lessons
 */
const PlaylistContent = ({
  courseData,
  selectedVideo,
  onVideoSelect,
  completedVideos = {},
  isVideoCompleted,
  loadingVideoId,
  isCourseCompleted,
}) => {
  const { t } = useTranslation();
  const [expandedChapters, setExpandedChapters] = useState({});

  // Calculate total stats
  const chapters = courseData?.chapters || [];
  const totalLessons = chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);
  const completedLessons = chapters.reduce((acc, ch) => {
    return acc + (ch.lessons?.filter((lesson) => {
      const videoId = lesson.video_id?.videoId;
      return isVideoCompleted?.(videoId) || completedVideos[videoId] || lesson.is_done;
    }).length || 0);
  }, 0);

  const isAllCompleted = totalLessons > 0 && completedLessons === totalLessons;

  // Toggle chapter expansion
  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex],
    }));
  };

  // Initialize all chapters as expanded
  React.useEffect(() => {
    if (chapters.length > 0) {
      const initialExpanded = {};
      chapters.forEach((_, index) => {
        initialExpanded[index] = true;
      });
      setExpandedChapters(initialExpanded);
    }
  }, [chapters.length]);

  const handleSelect = (lesson, chapterIndex, lessonIndex) => {
    if (lesson.video_id?.videoId) {
      onVideoSelect({
        type: "playlist",
        videoId: lesson.video_id.videoId,
        thumbnail: lesson.video_id.assets?.thumbnail || lesson.video_id?.thumbnail,
        title: lesson.title,
        chapterIndex,
        lessonIndex,
      });
    }
  };

  const renderLesson = (lesson, chapterIndex, lessonIndex) => {
    const videoId = lesson.video_id?.videoId;
    const thumbnailUrl = lesson.video_id?.assets?.thumbnail || lesson.video_id?.thumbnail || lesson.thumbnail;
    const isCompleted = isVideoCompleted?.(videoId) || completedVideos[videoId] || lesson.is_done;
    const isSelected = selectedVideo?.videoId === videoId;
    const isLoading = loadingVideoId === videoId;

    return (
      <TouchableOpacity
        key={`lesson-${chapterIndex}-${lessonIndex}`}
        style={[styles.lessonCard, isSelected && styles.selectedCard]}
        onPress={() => handleSelect(lesson, chapterIndex, lessonIndex)}
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
              <Icon name="check-circle" size={20} color={COLORS.green || "#4CAF50"} />
            ) : isSelected ? (
              <Icon name="play-circle-filled" size={20} color={COLORS.primary} />
            ) : (
              <Icon name="play-circle-outline" size={20} color={COLORS.white} />
            )}
          </View>
        </View>

        {/* Lesson Info */}
        <View style={styles.lessonInfo}>
          <View style={styles.lessonHeader}>
            <Text style={styles.lessonNumber}>
              {t("courses.lesson") || "Lesson"} {lessonIndex + 1}
            </Text>
            {isCompleted && (
              <LessonCompletedBadge variant="text" size="small" />
            )}
          </View>
          <Text
            style={[styles.lessonTitle, isSelected && styles.selectedTitle]}
            numberOfLines={2}
          >
            {lesson.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderChapter = (chapter, chapterIndex) => {
    const chapterLessons = chapter.lessons || [];
    const chapterCompleted = chapterLessons.filter((lesson) => {
      const videoId = lesson.video_id?.videoId;
      return isVideoCompleted?.(videoId) || completedVideos[videoId] || lesson.is_done;
    }).length;
    const chapterTotal = chapterLessons.length;
    const isChapterComplete = chapterTotal > 0 && chapterCompleted === chapterTotal;
    const isExpanded = expandedChapters[chapterIndex];

    return (
      <View key={`chapter-${chapterIndex}`} style={styles.chapterContainer}>
        {/* Chapter Header */}
        <TouchableOpacity
          style={styles.chapterHeader}
          onPress={() => toggleChapter(chapterIndex)}
          activeOpacity={0.7}
        >
          <View style={styles.chapterTitleContainer}>
            <Text style={styles.chapterNumber}>
              {t("courses.chapter") || "Chapter"} {chapterIndex + 1}
            </Text>
            <Text style={styles.chapterTitle} numberOfLines={1}>
              {chapter.title}
            </Text>
            <View style={styles.chapterStats}>
              <Text style={styles.chapterProgress}>
                {chapterCompleted}/{chapterTotal}
              </Text>
              {isChapterComplete && (
                <LessonCompletedBadge variant="icon" size="small" />
              )}
            </View>
          </View>
          <Icon
            name={isExpanded ? "expand-less" : "expand-more"}
            size={24}
            color={COLORS.darkWhite}
          />
        </TouchableOpacity>

        {/* Chapter Progress Bar */}
        <View style={styles.chapterProgressBar}>
          <View
            style={[
              styles.chapterProgressFill,
              { width: `${chapterTotal > 0 ? (chapterCompleted / chapterTotal) * 100 : 0}%` },
            ]}
          />
        </View>

        {/* Lessons List */}
        {isExpanded && (
          <View style={styles.lessonsContainer}>
            {chapterLessons.map((lesson, lessonIndex) =>
              renderLesson(lesson, chapterIndex, lessonIndex)
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Overall Stats Header */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {completedLessons}/{totalLessons} {t("courses.lessons_completed") || "Lessons Completed"}
          </Text>
          {(isAllCompleted || isCourseCompleted) && (
            <LessonCompletedBadge variant="text" size="medium" />
          )}
        </View>

        {/* Overall Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Chapters */}
      <View style={styles.chaptersList}>
        {chapters.map((chapter, index) => renderChapter(chapter, index))}
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
  chaptersList: {
    padding: SPACING.lg,
  },
  chapterContainer: {
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  },
  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
  },
  chapterTitleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  chapterNumber: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  chapterTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  chapterStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  chapterProgress: {
    color: COLORS.darkWhite,
    fontSize: 12,
  },
  chapterProgressBar: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: SPACING.lg,
  },
  chapterProgressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  lessonsContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  lessonCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  selectedCard: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  thumbnailContainer: {
    width: 80,
    height: 56,
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
  lessonInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: "center",
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  lessonNumber: {
    color: COLORS.darkWhite,
    fontSize: 10,
    fontWeight: "500",
  },
  lessonTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "500",
  },
  selectedTitle: {
    color: COLORS.primary,
  },
});

export default PlaylistContent;
