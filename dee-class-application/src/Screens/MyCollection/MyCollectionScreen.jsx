import React, { useEffect, useContext, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import useFetch from "../../Hooks/useFetch";
import Header from "../../components/common/Header";
import CategorySlider from "../My Progress/CategorySlider";
import CourseSlider from "../Librarie/components/CourseSlider";
import ScrollView from "../../components/common/ScrollViewTop";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";

const MyCollectionScreen = () => {
  const { t, i18n } = useTranslation();
  const { token, selectedUser } = useContext(LoginAuthContext);
  const {
    data: categoriesData,
    fetchData: fetchCategories,
  } = useFetch();
  const {
    data: listData,
    isLoading,
    fetchData: fetchMyList,
  } = useFetch();

  useEffect(() => {
    fetchCategories("course-categories");
    if (selectedUser?.id && token) {
      fetchMyList(`my-list?profile_id=${selectedUser.id}`, token);
    }
  }, [i18n.language]);

  const categories = categoriesData?.data;
  const savedCourses = listData?.data || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>{t("screens.my_collection")}</Text>

        <CategorySlider categories={categories} />

        {savedCourses.length > 0 ? (
          <CourseSlider
            title={t("for_you.my_list")}
            data={savedCourses}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t("course.my_list")}
            </Text>
            <Text style={styles.emptySubtext}>
              {t("for_you.no_content")}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    color: COLORS.darkWhite,
    fontSize: 14,
    textAlign: "center",
  },
});

export default MyCollectionScreen;
