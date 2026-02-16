import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  Animated,
} from "react-native";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import BASE_URL from "../../../config/BASE_URL";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

// Get server URL without /api for image paths
const getServerUrl = () => {
  return BASE_URL.replace("/api", "");
};

// Get thumbnail URL
const getThumbnailUrl = (item) => {
  const course = item?.course || item;
  console.log(
    "CourseSlider:",
    course?.name,
    "type:",
    course?.course_type,
    "thumbnail:",
    course?.thumbnail,
    "trailer:",
    course?.trailer?.assets?.thumbnail,
  );
  if (course?.trailer?.assets?.thumbnail)
    return course.trailer.assets.thumbnail;
  if (course?.thumbnail) return course.thumbnail;
  const image = course?.image || course?.mobileImage;
  if (image) {
    if (image.startsWith("http")) return image;
    return `${getServerUrl()}/${image}`;
  }
  return null;
};

// Animated Card Component
const CourseCard = ({ item, navigation }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [imageLoaded, setImageLoaded] = useState(false);

  const course = item?.course || item;
  const slug = item?.courseSlug || course?.slug || item?.slug;
  const name = course?.name || item?.name;
  const tags = course?.tags || item?.tags;
  const thumbnailUrl = getThumbnailUrl(item);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("CourseDetail", { slug })}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.cardWrapper}
    >
      <Animated.View
        style={[styles.courseCard, { transform: [{ scale: scaleAnim }] }]}
      >
        {/* Skeleton loader */}
        {!imageLoaded && <View style={styles.skeleton} />}

        <Image
          source={{ uri: thumbnailUrl }}
          style={[styles.thumbnail, !imageLoaded && styles.hiddenImage]}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Single tag badge - top left */}
        {tags && tags.length > 0 && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{tags[0].name}</Text>
          </View>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.95)"]}
          locations={[0.5, 0.7, 1]}
          style={styles.gradient}
        />

        {/* Title at bottom */}
        <View style={styles.titleContainer}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {name}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const CourseSlider = ({ title, data = [] }) => {
  const navigation = useNavigation();
  if (!data || data.length === 0) return null;

  const renderItem = ({ item }) => (
    <CourseCard item={item} navigation={navigation} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          const course = item?.course || item;
          return (
            item?.videoId?.toString() ||
            course?._id?.toString() ||
            item?._id?.toString() ||
            item?.courseSlug ||
            course?.slug ||
            item?.slug ||
            `item-${index}`
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  headerContainer: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  listContent: {
    paddingRight: SPACING.xs,
  },
  cardWrapper: {
    marginLeft: SPACING.md,
  },
  courseCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1c1c1c",
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#2a2a2a",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  hiddenImage: {
    opacity: 0,
  },
  tagBadge: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  titleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});

export default CourseSlider;
