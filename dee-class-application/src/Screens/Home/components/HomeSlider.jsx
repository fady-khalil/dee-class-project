import React, { useState, useRef, useCallback, memo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";
import BASE_URL from "../../../config/BASE_URL";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7;
const CARD_HEIGHT = 400;
const CARD_GAP = SPACING.md;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

const getServerUrl = () => BASE_URL.replace("/api", "");

const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${getServerUrl()}/${imagePath}`;
};

const getThumbnailUrl = (item) => {
  if (item?.trailer?.assets?.thumbnail) return item.trailer.assets.thumbnail;
  if (item?.thumbnail) return item.thumbnail;
  return getImageUrl(item?.image || item?.mobileImage);
};

const SliderCard = memo(({ item, onPress, t }) => {
  const thumbnailUrl = getThumbnailUrl(item);

  return (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <Image
        source={{ uri: thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.95)"]}
        locations={[0.4, 1]}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.courseTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>
                {t("courses.watch_trailer")}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const HomeSlider = ({ data = [], hero, navigation }) => {
  const { t } = useTranslation();
  const heroTitle = hero?.title || t("home.slider_subtitle");
  const heroText = hero?.text || "";
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleCoursePress = useCallback(
    (item) => {
      navigation.navigate("CourseDetail", { slug: item.slug });
    },
    [navigation],
  );

  const handleMomentumScrollEnd = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    setCurrentIndex(index);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <SliderCard item={item} onPress={() => handleCoursePress(item)} t={t} />
    ),
    [handleCoursePress, t],
  );

  const keyExtractor = useCallback(
    (item) => item.id || item._id || item.slug,
    [],
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: SNAP_INTERVAL,
      offset: SNAP_INTERVAL * index,
      index,
    }),
    [],
  );

  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>{heroTitle}</Text>
        {heroText ? (
          <Text style={styles.sectionSubtitle}>{heroText}</Text>
        ) : null}
      </View>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="center"
        disableIntervalMomentum={true}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={styles.listContent}
      />

      {data.length > 1 && (
        <View style={styles.pagination}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  headerContainer: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  listContent: {
    // paddingHorizontal: 16,
    gap: CARD_GAP,
  },
  courseCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.grey,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    borderRadius: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 6,
  },
  textContainer: {
    alignItems: "flex-start",
  },
  courseTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: SPACING.md,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
});

export default memo(HomeSlider);
