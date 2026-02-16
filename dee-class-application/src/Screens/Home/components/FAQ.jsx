import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ = ({ items = [] }) => {
  const { t, i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);
  const isRTL = i18n.language === "ar";

  if (!items || items.length === 0) return null;

  const toggle = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("general.faq_title")}</Text>

      <View style={styles.list}>
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          const question = isRTL
            ? item.question_ar || item.question
            : item.question;
          const answer = isRTL ? item.answer_ar || item.answer : item.answer;

          return (
            <View key={item._id || index} style={styles.item}>
              <TouchableOpacity
                style={styles.questionRow}
                onPress={() => toggle(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.questionText,
                    isActive && styles.questionTextActive,
                    isRTL && styles.textRTL,
                  ]}
                >
                  {question}
                </Text>
                <View
                  style={[
                    styles.iconCircle,
                    isActive && styles.iconCircleActive,
                  ]}
                >
                  <Ionicons
                    name={isActive ? "remove" : "add"}
                    size={16}
                    color={COLORS.white}
                  />
                </View>
              </TouchableOpacity>

              {isActive && (
                <Text style={[styles.answerText, isRTL && styles.textRTL]}>
                  {answer}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  list: {
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    overflow: "hidden",
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.white,
  },
  questionTextActive: {
    color: COLORS.primary,
  },
  textRTL: {
    textAlign: "right",
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleActive: {
    backgroundColor: COLORS.primary,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.darkWhite,
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
});

export default FAQ;
