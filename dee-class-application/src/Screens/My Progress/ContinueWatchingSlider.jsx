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
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import BASE_URL from "../../config/BASE_URL";

// Get server URL without /api for image paths
const getServerUrl = () => {
  return BASE_URL.replace("/api", "");
};

/**
 * ContinueWatchingSlider - Shows videos user is currently watching
 * Matches d-class website implementation with:
 * - Time badge showing where user stopped
 * - Navigation to course with video resume info
 */
const ContinueWatchingSlider = ({ data = [] }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (!data || data.length === 0) return null;

  // Handle navigation to course with resume info
  const handlePress = (item) => {
    // Support both flat and nested data formats (like web)
    const course = item.course || item;
    const videoId = item.videoId || item.video_id;
    const timeSlap = item.timeSlap || item.time_slap;
    const timestamp = item.timestamp || item.time;
    const slug = item.courseSlug || item.course_slug || course?.slug;

    if (!slug) return;

    // Navigate to CourseContent with resume info (like web does)
    navigation.navigate("CourseContent", {
      slug,
      isCoursePurchased: true,
      fromContinueWatching: true,
      video_id: videoId,
      time: timestamp,
      timeSlap: timeSlap,
    });
  };

  // Get thumbnail URL
  const getThumbnailUrl = (item) => {
    const course = item.course || item;
    if (course?.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
    if (course?.thumbnail) return course.thumbnail;
    if (course?.image) {
      if (course.image.startsWith("http")) return course.image;
      return `${getServerUrl()}/${course.image}`;
    }
    return null;
  };

  const renderItem = ({ item }) => {
    const course = item.course || item;
    const name = course?.name;
    const timeSlap = item.timeSlap || item.time_slap;
    const thumbnailUrl = getThumbnailUrl(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
            locations={[0.4, 0.7, 1]}
            style={styles.gradient}
          />

          {/* Time badge - shows where user stopped */}
          {timeSlap && (
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText}>{timeSlap}</Text>
            </View>
          )}

          {/* Course name */}
          <View style={styles.titleContainer}>
            <Text style={styles.courseName} numberOfLines={2}>
              {name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {t("for_you.continue_watching") || "Continue Watching"}
      </Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item._id || item.video_id || item.videoId || `continue-${index}`
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        decelerationRate="fast"
        snapToInterval={220}
        snapToAlignment="start"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    width: 200,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 280,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.grey,
    borderRadius: 12,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  timeBadge: {
    position: "absolute",
    bottom: 50,
    right: SPACING.sm,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  timeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  titleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  courseName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default ContinueWatchingSlider;
