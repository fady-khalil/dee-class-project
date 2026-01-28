import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useTranslation } from "react-i18next";
import COLORS from "../../../styles/colors";
import Icon from "react-native-vector-icons/MaterialIcons";

// Enable layout animations for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FrequentlyAskedQuestions = ({ title, data }) => {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        <Text style={styles.title}>{t("general.faq_title")}</Text>
      </View>
      {data.map((category, catIndex) => (
        <View key={catIndex} style={styles.categorySection}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }}
          >
            <Text style={styles.categoryTitle}>{category.FAQ_category}</Text>
          </View>
          {category.FAQ_content.map((faqItem, idx) => {
            const id = `${catIndex}-${idx}`;
            const question = faqItem.question ?? faqItem.FAQ_question ?? "";
            const answer = faqItem.answer ?? faqItem.FAQ_answer ?? "";
            return (
              <View key={idx} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionContainer}
                  onPress={() => toggleExpand(id)}
                >
                  <Text style={styles.question}>{question}</Text>
                  <Icon
                    name={expandedIndex === id ? "remove" : "add"}
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>

                {expandedIndex === id && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answer}>{answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 16,
    backgroundColor: COLORS.grey,
    borderRadius: 12,
    overflow: "hidden",
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    flex: 1,
    textAlign: "left",
    lineHeight: 22,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGrey,
  },
  answer: {
    fontSize: 14,
    color: COLORS.darkWhite,
    lineHeight: 22,
    textAlign: "left",
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    textAlign: "left",
    // justifyContent: "flex-start",
  },
});

export default FrequentlyAskedQuestions;
