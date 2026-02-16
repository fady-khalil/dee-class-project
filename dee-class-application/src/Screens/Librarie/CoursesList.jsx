import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import Spinner from "../../components/RequestHandler/Spinner";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import BASE_URL from "../../config/BASE_URL";

// Get server URL without /api for image paths
const getServerUrl = () => {
  return BASE_URL.replace("/api", "");
};

// Get full image URL (handles both full URLs and relative paths)
const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${getServerUrl()}/${imagePath}`;
};

const CoursesList = ({ categoryName, courses = [], loading, navigation }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.coursesLoadingContainer}>
        <Spinner />
      </View>
    );
  }

  const handleCoursePress = (slug) => {
    navigation.navigate("CourseDetail", { slug });
  };

  // Get thumbnail URL
  const getThumbnail = (item) => {
    console.log("CoursesList course:", item?.name, "type:", item?.course_type, "thumbnail:", item?.thumbnail, "trailer:", item?.trailer?.assets?.thumbnail);
    if (item?.trailer?.assets?.thumbnail) return item.trailer.assets.thumbnail;
    if (item?.thumbnail) return item.thumbnail;
    return getImageUrl(item?.image || item?.mobileImage);
  };

  return (
    <View style={styles.coursesContainer}>
      {categoryName && (
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>{categoryName}</Text>
        </View>
      )}

      {!courses || courses.length === 0 ? (
        <View style={styles.noCoursesContainer}>
          <Text style={styles.noCoursesText}>{t("general.no_courses")}</Text>
        </View>
      ) : (
        <View style={styles.courseGrid}>
          {courses.map((item, index) => (
            <TouchableOpacity
              key={item._id || item.slug || index}
              style={styles.courseCard}
              onPress={() => handleCoursePress(item.slug)}
            >
              <Image
                source={{ uri: getThumbnail(item) }}
                style={styles.courseImage}
              />
              <View style={styles.courseContent}>
                <Text style={styles.courseTitle} numberOfLines={2}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  coursesContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  coursesLoadingContainer: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  noCoursesContainer: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  noCoursesText: {
    color: COLORS.darkWhite,
    fontSize: 16,
  },
  courseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  courseCard: {
    width: "48%",
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: SPACING.lg,
  },
  courseImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  courseContent: {
    padding: SPACING.md,
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default CoursesList;
