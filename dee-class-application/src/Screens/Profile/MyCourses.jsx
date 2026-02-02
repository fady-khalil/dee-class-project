import React, { useState, useEffect } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import COLORS from "../../styles/colors";
import { useAuth } from "../../context/Authentication/LoginAuth";
import { GlobalStyle } from "../../styles/GlobalStyle";
import HeaderBack from "../../components/navigation/HeaderBack";
import useAuthFetchNoLang from "../../Hooks/useAuthFetchNoLang";
import { useCallback } from "react";

import BASE_URL from "../../config/BASE_URL";

// Strip HTML tags from description
const stripHtmlTags = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");
};

// Get course thumbnail - same logic as website
const getCourseImage = (item) => {
  // Try trailer thumbnail first
  if (item?.trailer?.assets?.thumbnail) {
    return item.trailer.assets.thumbnail;
  }
  // Try mobileImage
  if (item?.mobileImage) {
    return item.mobileImage;
  }
  // Try image
  if (item?.image) {
    // If image is a full URL, use it directly
    if (item.image.startsWith("http")) {
      return item.image;
    }
    // Otherwise prepend BASE_URL
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

  const renderItem = ({ item }) => {
    const desc = stripHtmlTags(item.description);
    const imageUrl = getCourseImage(item);

    return (
      <TouchableOpacity
        style={styles.courseRow}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("CourseDetail", { slug: item.slug, isPurchased: true })}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.courseImage} />
        ) : (
          <View style={[styles.courseImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>{item.name?.charAt(0) || "C"}</Text>
          </View>
        )}
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{item.name}</Text>
          <Text style={styles.courseDescription} numberOfLines={2}>
            {desc}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t("my_courses.no_courses") || "You haven't purchased any courses yet."}
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
  listContainer: {
    paddingVertical: 16,
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.grey,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: "cover",
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
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 16,
    color: COLORS.darkWhite,
  },
  content: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  footer: {
    flexDirection: "column",
    paddingVertical: 16,
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: 16,
  },
  button: {
    alignSelf: "stretch",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: COLORS.darkWhite,
    fontSize: 16,
    textAlign: "center",
  },
});
