import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";
import { I18nText } from "../../../components/common/I18nComponents";

const AboutSection = ({ data }) => {
  const { t } = useTranslation();

  // Function to strip HTML tags for plain text display
  const stripHtmlTags = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");
  };

  // Get the description text
  const getDescription = () => {
    if (data?.description) {
      return stripHtmlTags(data.description);
    }
    return data?.bio || "";
  };

  const description = getDescription();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("instructor.about", { name: data?.name })}
        </Text>
        <View style={styles.descriptionContainer}>
          <I18nText style={styles.descriptionText}>{description}</I18nText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 0,
    marginBottom: 0,
  },
  card: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  descriptionText: {
    color: COLORS.darkWhite,
    fontSize: 16,
    lineHeight: 18,
    paddingVertical: 20,
  },
});

export default AboutSection;
