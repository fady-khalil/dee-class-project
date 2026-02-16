import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import LessonCompletedBadge from "../../../../components/common/LessonCompletedBadge";
import COLORS from "../../../../styles/colors";
import SPACING from "../../../../styles/spacing";
import PurchaseModal from "../purchase/PurchaseModal";

const SeriesCourse = ({
  courseData,
  isAuthenticated,
  isLoggedIn,
  navigation,
  isCoursePurchased,
  isOfflineMode = false,
}) => {
  const { t, i18n } = useTranslation();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Combined access check - user can watch if authenticated OR purchased OR offline mode
  const hasAccess = isAuthenticated || isCoursePurchased || isOfflineMode;

  const handleEnrollment = (seriesIndex) => {
    if (hasAccess) {
      // If specific series index is provided, include it for direct playback
      const navigationParams = {
        slug: courseData?.slug,
        isCoursePurchased: isCoursePurchased,
        isOfflineMode: isOfflineMode,
      };

      // Add series index if it's provided
      if (seriesIndex !== undefined) {
        navigationParams.seriesIndex = seriesIndex;
        navigationParams.seriesItem = true; // Flag to indicate it's a specific series item
      }

      navigation.navigate("CourseContent", navigationParams);
    } else {
      // Show purchase modal instead of navigating to Plans
      setShowPurchaseModal(true);
    }
  };

  const renderSeriesItem = ({ item, index }) => {
    // Use series_video_id?.assets?.thumbnail like website
    const thumbnailUri = item.series_video_id?.assets?.thumbnail || item.thumbnail;

    return (
      <View style={styles.seriesItem}>
        <View style={styles.thumbnailContainer}>
          {thumbnailUri && (
            <Image
              source={{ uri: thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}
          {(item.is_done || item.series_video_id?.is_done) && (
            <LessonCompletedBadge
              variant="icon"
              size="small"
              style={styles.lessonBadgeIcon}
            />
          )}
        </View>

        <View style={styles.seriesDetails}>
          <View style={styles.seriesTitleContainer}>
            <Text style={styles.seriesTitle}>
              {i18n.language === "ar"
                ? (index + 1).toLocaleString("ar-EG")
                : index + 1}
              . {item.title}
            </Text>
            {(item.is_done || item.series_video_id?.is_done) && (
              <LessonCompletedBadge
                variant="text"
                size="small"
                style={styles.lessonBadgeText}
              />
            )}
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.seriesDescription}>{item.description}</Text>
          </View>

          <View>
            <TouchableOpacity
              style={styles.watchButton}
              onPress={() => handleEnrollment(index)}
            >
              <Text style={styles.watchButtonText}>
                {hasAccess
                  ? t("courses.start_watching")
                  : t("courses.join_to_watch")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Course Title */}
      <Text style={styles.courseTitle}>
        {t("courses.series_course_title", {
          episodeCount: courseData?.series?.length || 0,
        })}
      </Text>
      {courseData?.is_done && (
        <LessonCompletedBadge
          variant="text"
          size="medium"
          style={styles.courseCompletedBadge}
        />
      )}

      {/* Series List */}
      <FlatList
        data={courseData?.series || []}
        renderItem={renderSeriesItem}
        keyExtractor={(item, index) => `series-${index}`}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.seriesList}
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
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundColor,
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: SPACING.xl,
    lineHeight: 28,
    textAlign: "center",
  },
  seriesList: {
    paddingBottom: SPACING.lg,
  },
  seriesItem: {
    marginBottom: SPACING.sm,
  },
  thumbnailContainer: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.grey,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  seriesDetails: {
    width: "100%",
    backgroundColor: COLORS.grey,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: SPACING.lg,
  },
  seriesTitleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 6,
    rowGap: 8,
  },
  descriptionContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  seriesTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
  },
  seriesDescription: {
    color: COLORS.darkWhite,
    fontSize: 14,
    marginBottom: SPACING.lg,
    textAlign: "left",
  },
  watchButton: {
    backgroundColor: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    alignSelf: "flex-start",
  },
  watchButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  separator: {
    height: SPACING.lg,
  },
  courseCompletedBadge: {
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },
  lessonBadgeIcon: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
  },
  lessonBadgeText: {
    // marginLeft: 8,
  },
});

export default SeriesCourse;
