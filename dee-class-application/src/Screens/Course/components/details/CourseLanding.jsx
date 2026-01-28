import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  I18nText,
  I18nView,
} from "../../../../components/common/I18nComponents";
import COLORS from "../../../../styles/colors";
import Icon from "react-native-vector-icons/MaterialIcons";

const CourseLanding = ({ data, isAuthenticated, isLoggedIn, navigation }) => {
  const { t } = useTranslation();

  // Check if user is enrolled in the course
  const isEnrolled = data?.is_enrolled;

  const handleEnrollment = () => {
    if (!isLoggedIn) {
      // Navigate to login if not logged in
      navigation.navigate("Login", {
        redirectTo: "CourseDetail",
        params: { slug: data?.slug },
      });
      return;
    }

    if (isEnrolled) {
      // Navigate to course content if already enrolled
      navigation.navigate("CourseContent", { courseId: data?.id });
    } else {
      // Handle enrollment process
      // For free courses, direct enrollment
      // For paid courses, navigate to payment
      if (data?.is_free) {
        // TODO: Implement enrollment API call
        console.log("Enrolling in free course");
      } else {
        navigation.navigate("Payment", { courseId: data?.id });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t("course.about_course")}</Text>

      {/* Course Description */}
      <View style={styles.descriptionCard}>
        <Text style={styles.description}>{data?.description}</Text>
      </View>

      {/* Course Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>{t("course.course_details")}</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Icon name="access-time" size={24} color={COLORS.primary} />
            <Text style={styles.detailValue}>
              {data?.duration
                ? `${data.duration} ${t("general.hours")}`
                : t("general.not_specified")}
            </Text>
            <Text style={styles.detailLabel}>{t("course.duration")}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon name="school" size={24} color={COLORS.primary} />
            <Text style={styles.detailValue}>{data?.enrolled_count || 0}</Text>
            <Text style={styles.detailLabel}>{t("course.students")}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon name="language" size={24} color={COLORS.primary} />
            <Text style={styles.detailValue}>
              {data?.language || t("general.english")}
            </Text>
            <Text style={styles.detailLabel}>{t("course.language")}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon name="star" size={24} color={COLORS.primary} />
            <Text style={styles.detailValue}>
              {data?.average_rating || "0.0"}
            </Text>
            <Text style={styles.detailLabel}>{t("course.rating")}</Text>
          </View>
        </View>
      </View>

      {/* What You Will Learn */}
      {data?.what_you_will_learn && (
        <View style={styles.learnCard}>
          <Text style={styles.cardTitle}>
            {t("course.what_you_will_learn")}
          </Text>

          <View style={styles.learnList}>
            {data.what_you_will_learn.split("\n").map((item, index) => (
              <View key={index} style={styles.learnItem}>
                <Icon name="check-circle" size={20} color={COLORS.primary} />
                <Text style={styles.learnText}>{item.trim()}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Course Price and Enrollment Button */}
      <View style={styles.enrollmentCard}>
        <View style={styles.priceContainer}>
          {data?.is_free ? (
            <Text style={styles.freeText}>{t("course.free")}</Text>
          ) : (
            <>
              <Text style={styles.priceText}>{data?.price || ""}</Text>
              {data?.original_price && (
                <Text style={styles.originalPriceText}>
                  {data.original_price}
                </Text>
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.enrollButton, isEnrolled && styles.enrolledButton]}
          onPress={handleEnrollment}
        >
          <Text style={styles.enrollButtonText}>
            {isEnrolled
              ? t("course.continue_learning")
              : t("course.enroll_now")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.backgroundColor,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  descriptionCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  description: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  detailValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  detailLabel: {
    color: COLORS.darkWhite,
    fontSize: 12,
    marginTop: 2,
  },
  learnCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 16,
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
  enrollmentCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "column",
  },
  priceText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  originalPriceText: {
    color: COLORS.darkWhite,
    fontSize: 14,
    textDecorationLine: "line-through",
    marginTop: 4,
  },
  freeText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  enrollButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enrolledButton: {
    backgroundColor: COLORS.lightGrey,
  },
  enrollButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CourseLanding;
