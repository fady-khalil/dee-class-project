import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  I18nManager,
} from "react-native";
import LessonCompletedBadge from "../../../../components/common/LessonCompletedBadge";
import { useTranslation } from "react-i18next";
import COLORS from "../../../../styles/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import PurchaseModal from "../purchase/PurchaseModal";

const PlaylistCourse = ({
  courseData,
  isAuthenticated,
  isLoggedIn,
  navigation,
  isCoursePurchased,
  isOfflineMode = false,
}) => {
  const { t } = useTranslation();
  const [openChapter, setOpenChapter] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Combined access check - user can watch if authenticated OR purchased OR offline mode
  const hasAccess = isAuthenticated || isCoursePurchased || isOfflineMode;

  const handleEnrollment = (chapterIndex, lessonIndex) => {
    if (hasAccess) {
      // If specific lesson indices are provided, include them for direct playback
      const navigationParams = {
        slug: courseData?.slug,
        isCoursePurchased: isCoursePurchased,
        isOfflineMode: isOfflineMode,
      };

      // Add chapter and lesson indices if they're provided
      if (chapterIndex !== undefined && lessonIndex !== undefined) {
        navigationParams.chapterIndex = chapterIndex;
        navigationParams.lessonIndex = lessonIndex;
        navigationParams.playlistItem = true; // Flag to indicate it's a specific playlist item
      }

      navigation.navigate("CourseContent", navigationParams);
    } else {
      // Show purchase modal instead of navigating to Plans
      setShowPurchaseModal(true);
    }
  };

  const toggleChapter = (index) => {
    setOpenChapter(openChapter === index ? null : index);
  };

  const renderLesson = ({ item, index, chapterIndex }) => {
    // Use video_id?.assets?.thumbnail like website, with video_id?.thumbnail as fallback
    const thumbnailUri = item.video_id?.assets?.thumbnail || item.video_id?.thumbnail || item.thumbnail;

    return (
      <View style={styles.lessonItem}>
        <View style={styles.lessonThumbnailContainer}>
          {thumbnailUri && (
            <Image
              source={{ uri: thumbnailUri }}
              style={styles.lessonThumbnail}
              resizeMode="cover"
            />
          )}
          {(item.is_done || item.video_id?.is_done) && (
            <LessonCompletedBadge
              variant="icon"
              size="small"
              style={styles.lessonBadgeIcon}
            />
          )}
        </View>
        <View style={styles.lessonDetails}>
          <View style={styles.lessonIndexContainer}>
            <Text style={styles.lessonIndex}>
              {t("courses.lessons")} {index + 1}
            </Text>
            {(item.is_done || item.video_id?.is_done) && (
              <LessonCompletedBadge
                variant="text"
                size="small"
                style={styles.lessonBadgeText}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }}
          >
            <Text style={styles.lessonTitle}>{item.title}</Text>
          </View>

          <TouchableOpacity
            style={styles.watchButton}
            onPress={() => handleEnrollment(chapterIndex, index)}
          >
            <Text style={styles.watchButtonText}>
              {hasAccess
                ? t("courses.start_watching")
                : t("courses.join_to_watch")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderChapter = ({ item, index }) => {
    const isExpanded = openChapter === index;

    return (
      <View style={styles.chapterContainer}>
        <TouchableOpacity
          style={styles.chapterHeader}
          onPress={() => toggleChapter(index)}
        >
          <View style={styles.chapterInfo}>
            <Text style={styles.chapterIndex}>
              {t("courses.chapter")} {index + 1}
            </Text>
            <Text style={styles.chapterTitle}>{item.title}</Text>
          </View>
          <Icon
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.lessonsList}>
            {item.lessons.map((lesson, lessonIndex) => (
              <View key={`lesson-${lessonIndex}`} style={styles.lessonWrapper}>
                {renderLesson({
                  item: lesson,
                  index: lessonIndex,
                  chapterIndex: index,
                })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Course Title */}
      <Text style={styles.courseTitle}>
        {t("courses.playlist_course_title")}
      </Text>
      {courseData?.is_done && (
        <LessonCompletedBadge
          variant="text"
          size="medium"
          style={styles.courseCompletedBadge}
        />
      )}

      {/* Chapters List */}
      <FlatList
        data={courseData?.chapters || []}
        renderItem={renderChapter}
        keyExtractor={(item, index) => `chapter-${index}`}
        contentContainerStyle={styles.chaptersList}
      />

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        data={courseData}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.backgroundColor,
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    lineHeight: 28,
    textAlign: "center",
  },
  courseCompletedBadge: {
    alignSelf: "center",
    marginBottom: 16,
  },
  chaptersList: {
    paddingBottom: 16,
  },
  lessonBadgeIcon: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  lessonIndexContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  lessonBadgeText: {
    marginLeft: 8,
  },
  chapterContainer: {
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterIndex: {
    color: COLORS.darkWhite,
    fontSize: 12,
    marginBottom: 4,
    textAlign: "left",
  },
  chapterTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
  },
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBlue,
  },
  lessonWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBlue,
  },
  lessonItem: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkBlue + "20",
  },
  lessonThumbnailContainer: {
    width: 100,
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  lessonThumbnail: {
    width: "100%",
    height: "100%",
  },
  lessonDetails: {
    flex: 1,
  },
  lessonIndex: {
    color: COLORS.darkWhite,
    fontSize: 12,
    marginBottom: 4,
  },
  lessonTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "left",
    flexWrap: "wrap",
    flexShrink: 1,
  },
  watchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  watchButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default PlaylistCourse;
