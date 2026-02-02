import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
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

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = 380;
const CARD_MARGIN = 10;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;
const AUTO_SCROLL_INTERVAL = 4000;

// Number of times to repeat data for "infinite" feel
const REPEAT_COUNT = 100;

// Memoized card component for better performance
const SliderCard = memo(({ item, onPress, t }) => {
  const thumbnailUrl = item?.trailer?.assets?.thumbnail || item?.image;

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
        colors={["transparent", "rgba(0,0,0,0.85)"]}
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

const HomeSlider = ({ data = [], hero, navigation, autoScroll = false }) => {
  const { t } = useTranslation();

  // Use hero data from API or fallback to translations
  const heroTitle = hero?.title || t("home.slider_subtitle");
  const heroText = hero?.text || "";
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimer = useRef(null);
  const isUserScrolling = useRef(false);
  const hasInitialized = useRef(false);

  // Create repeated data for infinite scroll effect
  const infiniteData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const repeated = [];
    for (let i = 0; i < REPEAT_COUNT; i++) {
      data.forEach((item, index) => {
        repeated.push({
          ...item,
          uniqueKey: `${i}-${item.id || item._id || index}`,
        });
      });
    }
    return repeated;
  }, [data]);

  // Start position in the middle for bi-directional infinite scroll
  const startIndex = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.floor(REPEAT_COUNT / 2) * data.length;
  }, [data.length]);

  // Initialize to middle position
  useEffect(() => {
    if (infiniteData.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: startIndex * SNAP_INTERVAL,
          animated: false,
        });
      }, 100);
    }
  }, [infiniteData.length, startIndex]);

  // Get actual index in original data
  const getActualIndex = useCallback((index) => {
    if (data.length === 0) return 0;
    return index % data.length;
  }, [data.length]);

  // Handle course press
  const handleCoursePress = useCallback((item) => {
    navigation.navigate("CourseDetail", { slug: item.slug });
  }, [navigation]);

  // Auto scroll logic
  const startAutoScroll = useCallback(() => {
    if (!autoScroll || data.length <= 1) return;

    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }

    autoScrollTimer.current = setInterval(() => {
      if (!isUserScrolling.current && flatListRef.current) {
        setCurrentIndex((prev) => {
          const nextIndex = prev + 1;
          flatListRef.current?.scrollToOffset({
            offset: nextIndex * SNAP_INTERVAL,
            animated: true,
          });
          return nextIndex;
        });
      }
    }, AUTO_SCROLL_INTERVAL);
  }, [autoScroll, data.length]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  // Setup auto scroll
  useEffect(() => {
    if (autoScroll && data.length > 1) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [autoScroll, data.length, startAutoScroll, stopAutoScroll]);

  const handleScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
    stopAutoScroll();
  }, [stopAutoScroll]);

  const handleScrollEndDrag = useCallback(() => {
    isUserScrolling.current = false;
    if (autoScroll) {
      startAutoScroll();
    }
  }, [autoScroll, startAutoScroll]);

  const handleMomentumScrollEnd = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    setCurrentIndex(index);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <SliderCard
      item={item}
      onPress={() => handleCoursePress(item)}
      t={t}
    />
  ), [handleCoursePress, t]);

  const keyExtractor = useCallback((item) => item.uniqueKey, []);

  const getItemLayout = useCallback((_, index) => ({
    length: SNAP_INTERVAL,
    offset: SNAP_INTERVAL * index,
    index,
  }), []);

  if (!data || data.length === 0) return null;

  const actualIndex = getActualIndex(currentIndex);

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
        data={infiniteData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        disableIntervalMomentum={true}
        getItemLayout={getItemLayout}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={styles.listContent}
      />

      {/* Pagination dots */}
      {data.length > 1 && (
        <View style={styles.pagination}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                actualIndex === index && styles.paginationDotActive,
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
    marginTop: 16,
  },
  headerContainer: {
    marginBottom: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 6,
  },
  courseCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.grey,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
    padding: 20,
  },
  textContainer: {
    alignItems: "flex-start",
  },
  courseTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
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
    marginTop: 16,
    gap: 8,
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
