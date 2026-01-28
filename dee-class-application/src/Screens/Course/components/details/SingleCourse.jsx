import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../../../styles/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import LessonCompletedBadge from "../../../../components/common/LessonCompletedBadge";
import PurchaseModal from "../purchase/PurchaseModal";

const SingleCourse = ({
  courseData,
  isAuthenticated,
  isLoggedIn,
  navigation,
  isCoursePurchased,
  isOfflineMode = false,
}) => {
  const { t } = useTranslation();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Combined access check - user can watch if authenticated OR purchased OR offline mode
  const hasAccess = isAuthenticated || isCoursePurchased || isOfflineMode;

  const handleEnrollment = () => {
    if (hasAccess) {
      navigation.navigate("CourseContent", {
        slug: courseData?.slug,
        isCoursePurchased: isCoursePurchased,
        isOfflineMode: isOfflineMode,
        singleCourse: true,
      });
    } else {
      // Show purchase modal instead of navigating to Plans
      setShowPurchaseModal(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Course Title */}
      <Text style={styles.courseTitle}>
        {t("courses.single_course_title", {
          courseName: courseData?.areas_of_expertise?.[0] || courseData?.name,
        })}
      </Text>

      {/* Course Hero Section - matching website layout */}
      <View style={styles.heroSection}>
        <View style={styles.thumbnailContainer}>
          <Image
            source={{
              uri: hasAccess
                ? courseData?.api_video_object?.assets?.thumbnail ||
                  courseData?.thumbnail
                : courseData?.thumbnail,
            }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>

        {/* Course Info and Button */}
        <View style={styles.courseInfoSection}>
          <Text style={styles.courseName}>{courseData?.name}</Text>
          {courseData?.description && (
            <Text style={styles.courseDescription} numberOfLines={4}>
              {courseData.description.replace(/<[^>]*>?/gm, '')}
            </Text>
          )}

          {/* Watch/Join Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              hasAccess ? styles.watchButton : styles.joinButton,
            ]}
            onPress={handleEnrollment}
          >
            <Text style={styles.actionButtonText}>
              {hasAccess
                ? t("courses.start_watching")
                : t("courses.join_to_watch")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* What You Will Learn */}
      {courseData?.what_you_will_learn && (
        <View style={styles.learnCard}>
          <Text style={styles.cardTitle}>
            {t("course.what_you_will_learn")}
          </Text>

          <View style={styles.learnList}>
            {courseData.what_you_will_learn.split("\n").map((item, index) => (
              <View key={index} style={styles.learnItem}>
                <Icon name="check-circle" size={20} color={COLORS.primary} />
                <Text style={styles.learnText}>{item.trim()}</Text>
              </View>
            ))}
          </View>
        </View>
      )}


      {courseData?.is_done && (
        <LessonCompletedBadge
          variant="text"
          size="medium"
          style={styles.courseCompletedBadge}
        />
      )}

      <View style={styles.videoPreviewContainer}>
        <Image
          source={{
            uri:
              courseData?.assets?.thumbnail ||
              "https://via.placeholder.com/500x280",
          }}
          style={styles.videoPreview}
          resizeMode="cover"
        />
        {courseData?.is_done && (
          <LessonCompletedBadge
            variant="icon"
            size="medium"
            style={styles.videoBadge}
          />
        )}
      </View>

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
  heroSection: {
    marginBottom: 20,
  },
  thumbnailContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.grey,
    marginBottom: 16,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  courseInfoSection: {
    paddingHorizontal: 4,
  },
  courseName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  courseDescription: {
    color: COLORS.darkWhite,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  watchButton: {
    backgroundColor: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  learnCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  learnList: {
    marginTop: 8,
  },
  learnItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  learnText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  courseCompletedBadge: {
    alignSelf: "center",
    marginBottom: 16,
  },
  videoPreviewContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    marginBottom: 24,
  },
  videoPreview: {
    width: "100%",
    height: "100%",
  },
  videoBadge: {
    position: "absolute",
    top: 12,
    right: 12,
  },
});

export default SingleCourse;
