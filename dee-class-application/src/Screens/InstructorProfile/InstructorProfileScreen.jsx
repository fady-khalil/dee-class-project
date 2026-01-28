import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import useFetch from "../../Hooks/useFetch";
import HeaderBack from "../../components/navigation/HeaderBack";
import InstructorHero from "./components/InstructorHero";
import AboutSection from "./components/AboutSection";
import CoursesList from "./components/CoursesList";
import COLORS from "../../styles/colors";
import { I18nText, I18nView } from "../../components/common/I18nComponents";
import Icon from "react-native-vector-icons/Ionicons";

const InstructorProfileScreen = ({ route, navigation }) => {
  const { instructorSlug, instructorName } = route.params;
  const { t } = useTranslation();
  const { data, isLoading, error, fetchData } = useFetch();

  const handleRefresh = () => {
    fetchData(`instructor-profile/${instructorSlug}`);
  };

  useEffect(() => {
    fetchData(`instructor-profile/${instructorSlug}`);
  }, [instructorSlug]);

  if (isLoading) {
    return (
      <I18nView style={styles.loadingContainer}>
        <StatusBar
          backgroundColor={COLORS.background}
          barStyle="light-content"
        />
        <Icon
          name="sync"
          size={32}
          color={COLORS.primary}
          className="animate-spin"
        />
        <I18nText style={styles.loadingText}>{t("common.loading")}</I18nText>
      </I18nView>
    );
  }

  if (error) {
    return (
      <I18nView style={styles.errorContainer}>
        <StatusBar
          backgroundColor={COLORS.background}
          barStyle="light-content"
        />
        <Icon name="alert-circle-outline" size={48} color={COLORS.primary} />
        <I18nText style={styles.errorText}>
          {error || t("common.error")}
        </I18nText>
        <I18nText style={styles.retryText} onPress={handleRefresh}>
          {t("common.retry")}
        </I18nText>
      </I18nView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="light-content" />
      <HeaderBack screenName="instructor_profile" />

      {data && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section with instructor image and basic info */}
          <InstructorHero data={data} />

          {/* About Section with detailed description */}
          <AboutSection data={data} />

          {/* Courses by this instructor */}
          {data.courses && data.courses.length > 0 && (
            <CoursesList courses={data.courses} />
          )}

          {/* Bottom spacing */}
          <I18nView style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.white,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    padding: 20,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  retryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default InstructorProfileScreen;
