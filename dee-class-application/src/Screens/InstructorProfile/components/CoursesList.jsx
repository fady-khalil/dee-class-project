import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { I18nText, I18nView } from "../../../components/common/I18nComponents";
import COLORS from "../../../styles/colors";
import Icon from "react-native-vector-icons/Ionicons";
import BASE_URL from "../../../config/BASE_URL";

const CoursesList = ({ courses }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = screenWidth * 0.8; // Card takes up 80% of screen width
  const flatListRef = useRef(null);

  const navigateToCourse = (slug) => {
    navigation.navigate("CourseDetail", { slug });
  };

  // Get thumbnail URL
  const getCourseImage = (item) => {
    if (item?.trailer?.assets?.thumbnail) return item.trailer.assets.thumbnail;
    if (item?.thumbnail) return item.thumbnail;
    if (item?.image) {
      if (item.image.startsWith("http")) return item.image;
      return `${BASE_URL.replace("/api", "")}/${item.image}`;
    }
    return null;
  };

  const renderCourseItem = ({ item, index }) => {
    const imageUrl = getCourseImage(item);

    return (
      <TouchableOpacity
        style={[styles.courseCard, { width: cardWidth }]}
        onPress={() => navigateToCourse(item.slug)}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderContainer]}>
              <Icon
                name="videocam-outline"
                size={32}
                color={COLORS.darkWhite}
              />
              <Text style={styles.placeholderText}>
                {t("general.no_video_available")}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <Text style={styles.sectionTitle}>{t("instructor.courses")}</Text>
        <Text style={styles.courseCount}> {courses.length}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={courses}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `course-${item.slug || index}`}
        renderItem={renderCourseItem}
        contentContainerStyle={styles.listContent}
        snapToAlignment="center"
        snapToInterval={cardWidth + 16} // Card width + margin
        decelerationRate="fast"
        pagingEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 44,
    flexDirection: "column",
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
  courseCount: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingLeft: 20,
    paddingRight: 16,
    paddingBottom: 8,
  },
  courseCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  thumbnailContainer: {
    height: 180,
    width: "100%",
    backgroundColor: COLORS.darkGrey,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.darkGrey,
  },
  placeholderText: {
    color: COLORS.darkWhite,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  courseInfo: {
    padding: 16,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  courseName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 8,
  },
  courseMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseMeta: {
    color: COLORS.darkWhite,
    fontSize: 12,
    marginLeft: 4,
  },
  metaIcon: {
    marginLeft: 12,
  },
});

export default CoursesList;
