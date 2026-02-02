import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import COLORS from "../../styles/colors";
import Spinner from "../../components/RequestHandler/Spinner";
import useFetch from "../../Hooks/useFetch";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/Authentication/LoginAuth";
import Header from "../../components/common/Header";

// Import component files
import CategoryTabs from "./CategoryTabs";
import CoursesList from "./CoursesList";
import ForYouSection from "./ForYouSection";

// Main Library Component
const Library = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const [activeCategorySlug, setActiveCategorySlug] = useState(undefined);
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    fetchData: fetchCategories,
  } = useFetch();
  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
    fetchData: fetchCourses,
  } = useFetch();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories("categories");
  }, []);

  // Set default active category
  useEffect(() => {
    if (route?.params?.slug) {
      setActiveCategorySlug(route.params.slug);
    } else if (isAuthenticated) {
      // If user is authenticated, set "For You" tab as default
      setActiveCategorySlug("for-you");
    } else if (categories?.length > 0) {
      setActiveCategorySlug(categories[0]?.slug);
    }
  }, [categories, route?.params?.slug, isAuthenticated]);

  // Fetch courses when active category changes
  useEffect(() => {
    if (activeCategorySlug && activeCategorySlug !== "for-you") {
      fetchCourses(`categories/${activeCategorySlug}`);
    }
  }, [activeCategorySlug]);

  // Handle category selection
  const handleCategoryClick = (categorySlug) => {
    if (activeCategorySlug === categorySlug) {
      setActiveCategorySlug(undefined);
    } else {
      setActiveCategorySlug(categorySlug);
    }
  };

  // Handle "For You" selection
  const handleForYouClick = () => {
    if (activeCategorySlug === "for-you") {
      setActiveCategorySlug(undefined);
    } else {
      setActiveCategorySlug("for-you");
    }
  };

  // Render loading state
  if (categoriesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner />
        <Text style={styles.loadingText}>{t("general.loading")}</Text>
      </View>
    );
  }

  // Render error state
  if (categoriesError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("general.error")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <CategoryTabs
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        handleCategoryClick={handleCategoryClick}
        handleForYouClick={handleForYouClick}
      />

      <ScrollView
        style={styles.coursesScroll}
        contentContainerStyle={styles.coursesScrollContent}
      >
        {activeCategorySlug === "for-you" ? (
          <ForYouSection />
        ) : (
          <CoursesList
            courses={courses}
            loading={coursesLoading}
            navigation={navigation}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
  },
  loadingText: {
    color: COLORS.white,
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
  },
  coursesScroll: {
    flex: 1,
  },
  coursesScrollContent: {
    padding: 16,
  },
});

export default Library;
