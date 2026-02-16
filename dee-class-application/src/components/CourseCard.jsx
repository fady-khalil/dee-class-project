import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { I18nText } from "./common/I18nComponents";
import COLORS from "../styles/colors";
import SPACING from "../styles/spacing";

const CourseCard = ({ title, category, image }) => {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <I18nText style={styles.title}>{title}</I18nText>
        <I18nText style={styles.category}>{category}</I18nText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    marginHorizontal: SPACING.sm,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 120,
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: SPACING.xs,
  },
  category: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
});

export default CourseCard;
