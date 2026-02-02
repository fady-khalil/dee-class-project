import React, { useEffect } from "react";
import {
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  View,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetch from "../../Hooks/useFetch";
import { GlobalStyle } from "../../styles/GlobalStyle";
import COLORS from "../../styles/colors";
import HomeSlider from "./components/HomeSlider";
import Header from "../../components/common/Header";
import JoinUs from "./components/JoinUs";
import Reels from "./components/Reels";
import { useTranslation } from "react-i18next";
import CategorySlider from "../../Screens/My Progress/CategorySlider";
import CourseSlider from "../Librarie/components/CourseSlider";
import { useAuth } from "../../context/Authentication/LoginAuth";

const HomeMainScreen = ({ navigation }) => {
  const {
    data: homeData,
    isLoading: homeLoading,
    fetchData: fetchHome,
  } = useFetch();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    fetchData: fetchCategories,
  } = useFetch();
  const { i18n, t } = useTranslation();
  const { isAuthenticated, allowedProfiles, allowedCourses, isVerified, user } = useAuth();

  useEffect(() => {
    fetchHome("home");
    fetchCategories("course-categories");
  }, [i18n.language]);

  // Extract data from API response (backend returns { data: { ... } })
  const home = homeData?.data;
  const categories = categoriesData?.data;

  const isLoading = homeLoading || categoriesLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* 1. Hero Section */}
            {home?.featured_courses && home.featured_courses.length > 0 && (
              <HomeSlider
                data={home.featured_courses}
                hero={home?.hero}
                navigation={navigation}
                autoScroll={false}
              />
            )}

            {/* 2. Register/JoinUs Section */}
            <JoinUs
              isAuthenticated={isAuthenticated}
              allowedProfiles={allowedProfiles}
              allowedCourses={allowedCourses}
              isVerified={isVerified}
              user={user}
              joinUs={home?.join_us}
            />

            {/* 3. Reels Section */}
            <Reels
              isAuthenticated={isAuthenticated}
              trending={home?.trending}
            />

            {/* 5. Category Slider Section */}
            <View style={{ marginTop: 36, marginBottom: 24 }}>
              <CategorySlider categories={categories} />
            </View>
            {/* 4. Latest Courses Section */}
            <CourseSlider
              title={t("for_you.new_to_master_class")}
              data={home?.newlyAddedCourses}
            />
          </>
        }
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={GlobalStyle.container}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={2}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeMainScreen;
