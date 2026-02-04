import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import COLORS from "../../styles/colors";
import { useAuth } from "../../context/Authentication/LoginAuth";
import { GlobalStyle } from "../../styles/GlobalStyle";
import HeaderBack from "../../components/navigation/HeaderBack";
import useAuthFetchNoLang from "../../Hooks/useAuthFetchNoLang";

import BASE_URL from "../../config/BASE_URL";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

// Strip HTML tags from description
const stripHtmlTags = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");
};

// Get course thumbnail
const getCourseImage = (item) => {
  if (item?.trailer?.assets?.thumbnail) return item.trailer.assets.thumbnail;
  if (item?.thumbnail) return item.thumbnail;
  if (item?.image) {
    if (item.image.startsWith("http")) return item.image;
    return `${BASE_URL.replace("/api", "")}/${item.image}`;
  }
  return null;
};

const MyCourses = () => {
  const { t } = useTranslation();
  const { token, setAllowedCoursesHandler } = useAuth();
  const navigation = useNavigation();
  const { fetchData, isLoading } = useAuthFetchNoLang();
  const [purchasedCourses, setPurchasedCourses] = useState([]);

  // Fetch purchased courses from API (same as website)
  useEffect(() => {
    const loadPurchasedCourses = async () => {
      if (token) {
        const response = await fetchData("my-courses", token);
        console.log("MyCourses API response:", response);
        if (response?.success && response?.data) {
          setPurchasedCourses(response.data);

          // Sync purchased course IDs with context so CourseDetail can check access
          const courseIds = response.data.map(course =>
            course?.id?.toString() || course?._id?.toString()
          ).filter(Boolean);

          if (courseIds.length > 0) {
            setAllowedCoursesHandler(courseIds);
          }
        }
      }
    };

    loadPurchasedCourses();
  }, [token]);

  // Animated Course Card Component
  const CourseCard = ({ item, index }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageUrl = getCourseImage(item);
    const instructorName = item?.instructor?.name || item?.instructorName;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
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
        onPress={() => navigation.navigate("CourseDetail", { slug: item.slug, isPurchased: true })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.cardWrapper, index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }]}
      >
        <Animated.View style={[styles.courseCard, { transform: [{ scale: scaleAnim }] }]}>
          {/* Skeleton loader */}
          {!imageLoaded && <View style={styles.skeleton} />}

          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.courseImage, !imageLoaded && styles.hiddenImage]}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <View style={[styles.courseImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>{item.name?.charAt(0) || "C"}</Text>
            </View>
          )}

          {/* Purchased badge */}
          <View style={styles.purchasedBadge}>
            <Icon name="check-circle" size={12} color={COLORS.white} />
            <Text style={styles.purchasedText}>{t("courses.purchased")}</Text>
          </View>

          {/* Gradient overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.95)"]}
            locations={[0.4, 0.65, 1]}
            style={styles.gradient}
          />

          {/* Content at bottom */}
          <View style={styles.cardContent}>
            <Text style={styles.courseTitle} numberOfLines={2}>
              {item.name}
            </Text>
            {instructorName && (
              <Text style={styles.instructorName} numberOfLines={1}>
                {instructorName}
              </Text>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }) => <CourseCard item={item} index={index} />;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, GlobalStyle.safeAreaView]}>
        <View style={[GlobalStyle.container, styles.content]}>
          <HeaderBack screenName="my_courses" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, GlobalStyle.safeAreaView]}>
      <View style={[GlobalStyle.container, styles.content]}>
        <HeaderBack screenName="my_courses" />
        {purchasedCourses.length > 0 ? (
          <FlatList
            style={styles.flatList}
            data={purchasedCourses}
            keyExtractor={(item, index) => item?.id?.toString() || item?._id?.toString() || index.toString()}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="book-open" size={48} color={COLORS.darkWhite} />
            </View>
            <Text style={styles.emptyTitle}>
              {t("my_courses.no_courses")}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t("general.join_us_subtitle")}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={() => navigation.navigate("Main", { screen: "Library" })}
        >
          <Text style={[styles.buttonText, styles.outlineButtonText]}>
            {t("general.check_all_courses") || "Browse All Courses"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.fullButton]}
          onPress={() => navigation.navigate("Plans")}
        >
          <Text style={[styles.buttonText, styles.fullButtonText]}>
            {t("general.check_our_packages") || "View Our Plans"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MyCourses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  courseCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1c1c1c",
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#2a2a2a",
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
  hiddenImage: {
    opacity: 0,
  },
  placeholderImage: {
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.white,
  },
  purchasedBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  purchasedText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    lineHeight: 18,
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "column",
    paddingVertical: 16,
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  button: {
    alignSelf: "stretch",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  outlineButtonText: {
    color: COLORS.primary,
  },
  fullButton: {
    backgroundColor: COLORS.primary,
  },
  fullButtonText: {
    color: COLORS.white,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.darkWhite,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
