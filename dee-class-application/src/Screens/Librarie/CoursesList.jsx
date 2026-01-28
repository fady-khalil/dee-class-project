import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import Spinner from "../../components/RequestHandler/Spinner";
import COLORS from "../../styles/colors";
const CoursesList = ({ courses, loading, navigation }) => {
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

  return (
    <View style={styles.coursesContainer}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
        <Text style={styles.sectionTitle}>{courses?.name}</Text>
      </View>

      {courses?.courses?.length === 0 ? (
        <View style={styles.noCoursesContainer}>
          <Text style={styles.noCoursesText}>{t("general.no_courses")}</Text>
        </View>
      ) : (
        <View style={styles.courseGrid}>
          {courses?.courses?.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.courseCard}
              onPress={() => handleCoursePress(item.slug)}
            >
              <Image
                source={{
                  uri: item?.tralier_with_api_video_object?.assets?.thumbnail,
                }}
                style={styles.courseImage}
              />
              <View style={styles.courseContent}>
                <Text style={styles.courseTitle}>{item.name}</Text>
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
  sectionTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  coursesLoadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  noCoursesContainer: {
    padding: 24,
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
    marginBottom: 16,
  },
  courseImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  courseContent: {
    padding: 10,
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default CoursesList;
