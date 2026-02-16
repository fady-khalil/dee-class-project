import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { I18nText } from "../../../components/common/I18nComponents";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";

const ContinueWatching = ({ data = [] }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) return null;

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.courseCard}>
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(item.progress / item.total_duration) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.courseInfo}>
        <I18nText style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </I18nText>
        <Text style={styles.progressText}>
          {t("for_you.continue_watching_progress", {
            progress: Math.round((item.progress / item.total_duration) * 100),
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <I18nText style={styles.sectionTitle}>
        {t("for_you.continue_watching")}
      </I18nText>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  courseCard: {
    width: 280,
    marginRight: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: 160,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.grey,
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  courseInfo: {
    padding: SPACING.md,
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  progressText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
});

export default ContinueWatching;
