import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import COLORS from "../../styles/colors";
import placeholder from "../../Assests/courses/1.jpg";
import BASE_URL from "../../config/BASE_URL";

const CompletedCourses = ({ data }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  if (!data || data.length === 0) {
    return null;
  }

  // Get course link based on course type
  const handleCoursePress = (course) => {
    const slug = course?.slug;
    if (!slug) return;

    navigation.navigate("CourseContent", {
      slug,
      isCoursePurchased: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderCourseItem = ({ item, index }) => {
    const { name, image, trailer, instructor, completedAt } = item;

    // Get thumbnail URL
    const thumbnailUrl = trailer?.assets?.thumbnail ||
      (image ? `${BASE_URL}/${image}` : null);

    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={() => handleCoursePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            source={thumbnailUrl ? { uri: thumbnailUrl } : placeholder}
            style={styles.thumbnail}
            resizeMode="cover"
            defaultSource={placeholder}
          />
          {/* Completed badge */}
          <View style={styles.completedBadge}>
            <Icon name="check-circle" size={14} color={COLORS.white} />
            <Text style={styles.completedBadgeText}>
              {t("progress.completed") || "Completed"}
            </Text>
          </View>
        </View>

        <View style={styles.courseInfo}>
          <Text style={styles.courseName} numberOfLines={2}>
            {name}
          </Text>
          {instructor && (
            <Text style={styles.instructorName} numberOfLines={1}>
              {instructor.name}
            </Text>
          )}
          {completedAt && (
            <Text style={styles.completedDate}>
              {t("progress.completed_on") || "Completed on"} {formatDate(completedAt)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {t("progress.completed_courses") || "Completed Courses"}
      </Text>
      <FlatList
        data={data}
        renderItem={renderCourseItem}
        keyExtractor={(item, index) => item._id || `completed-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 12,
  },
  courseCard: {
    width: 160,
    marginHorizontal: 4,
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: 100,
    backgroundColor: COLORS.lightGrey,
  },
  completedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  completedBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  courseInfo: {
    padding: 10,
  },
  courseName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructorName: {
    color: COLORS.darkWhite,
    fontSize: 11,
    marginBottom: 4,
  },
  completedDate: {
    color: COLORS.darkWhite,
    fontSize: 10,
    opacity: 0.7,
  },
});

export default CompletedCourses;
