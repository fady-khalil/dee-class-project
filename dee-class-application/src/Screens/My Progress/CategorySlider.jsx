import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Text,
  FlatList,
} from "react-native";
import { useTranslation } from "react-i18next";
import { I18nText } from "../../components/common/I18nComponents";
import COLORS from "../../styles/colors";
import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get("window");
const SLIDE_WIDTH = width * 0.3; // 30% of screen width
const SLIDE_SPACING = 8; // Small spacing between slides

const CategoryTabs = ({ categories }) => {
  const { t } = useTranslation();
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  const renderCategoryItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.categorySlide]}
        onPress={() =>
          navigation.navigate("Library", { categorySlug: item.slug })
        }
      >
        <View style={styles.categoryIconContainer}>
          {item.icon && (
            <Image
              source={{ uri: item.icon }}
              style={styles.categoryIcon}
              resizeMode="contain"
            />
          )}
        </View>
        <I18nText style={styles.categoryText}>
          {item.title || item.name}
        </I18nText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>{t("general.categories")}</Text>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          ref={flatListRef}
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.slug}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SLIDE_WIDTH + SLIDE_SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.flatListContent}
          ItemSeparatorComponent={() => (
            <View style={{ width: SLIDE_SPACING }} />
          )}
          getItemLayout={(data, index) => ({
            length: SLIDE_WIDTH + SLIDE_SPACING,
            offset: (SLIDE_WIDTH + SLIDE_SPACING) * index,
            index,
          })}
          onMomentumScrollEnd={(event) => {
            const contentOffset = event.nativeEvent.contentOffset.x;
            const index = Math.round(
              contentOffset / (SLIDE_WIDTH + SLIDE_SPACING)
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginRight: 10,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  listContainer: {
    height: 150,
    paddingHorizontal: 16,
  },
  flatListContent: {
    paddingVertical: 10,
    paddingRight: 16, // Extra padding at the end
  },
  categorySlide: {
    width: SLIDE_WIDTH,
    height: 120,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  activeSlide: {
    borderColor: COLORS.primary,
  },
  categoryIconContainer: {
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryIcon: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default CategoryTabs;
