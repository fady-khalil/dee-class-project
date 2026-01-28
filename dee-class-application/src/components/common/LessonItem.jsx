import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../styles/colors";
import LessonCompletedBadge from "./LessonCompletedBadge";

const LessonItem = ({
  thumbnailUri,
  title,
  description,
  lessonNumber,
  isDone,
  isAuthenticated,
  isCoursePurchased,
  navigation,
  courseSlug,
}) => {
  const { t } = useTranslation();
  const unlocked = isAuthenticated || isCoursePurchased;
  const handlePress = () => {
    if (unlocked) {
      navigation.navigate("CourseContent", { courseId: courseSlug });
    } else {
      navigation.navigate("Plans");
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        {isDone && (
          <LessonCompletedBadge
            variant="icon"
            size="small"
            style={styles.badgeIcon}
          />
        )}
      </View>
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.indexText}>
            {`${t("courses.lessons")} ${lessonNumber}`}
          </Text>
          {isDone && (
            <LessonCompletedBadge
              variant="text"
              size="small"
              style={styles.badgeText}
            />
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.button, unlocked && styles.buttonUnlocked]}
          onPress={handlePress}
        >
          <Text style={styles.buttonText}>
            {unlocked
              ? t("courses.start_watching")
              : t("courses.join_to_watch")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnailContainer: {
    position: "relative",
    width: 100,
    height: 56,
    backgroundColor: COLORS.darkGrey,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  badgeIcon: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  details: {
    flex: 1,
    padding: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  indexText: {
    color: COLORS.darkWhite,
    fontSize: 12,
    marginRight: 8,
  },
  badgeText: {
    // inherits text badge styles
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  description: {
    color: COLORS.darkWhite,
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonUnlocked: {
    backgroundColor: COLORS.darkBlue,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default LessonItem;
