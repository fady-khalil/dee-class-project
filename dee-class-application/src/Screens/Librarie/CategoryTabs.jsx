import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";

import COLORS from "../../styles/colors";
import { useAuth } from "../../context/Authentication/LoginAuth";

const CategoryTabs = ({
  categories,
  activeCategorySlug,
  handleCategoryClick,
  handleForYouClick,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const flatListRef = useRef(null);

  // Create a full data array including "For You" if authenticated
  const data = isAuthenticated
    ? [{ slug: "for-you", name: t("general.for_you") }, ...(categories || [])]
    : categories || [];

  // Find the index of the active category
  useEffect(() => {
    if (flatListRef.current && activeCategorySlug) {
      const activeIndex = data.findIndex(
        (item) => item.slug === activeCategorySlug
      );
      if (activeIndex !== -1) {
        flatListRef.current.scrollToIndex({
          index: activeIndex,
          animated: true,
          viewPosition: 0.5, // Center the item
        });
      }
    }
  }, [activeCategorySlug, data]);

  const renderItem = ({ item, index }) => {
    const isActive = activeCategorySlug === item.slug;
    const isForYou = item.slug === "for-you";

    return (
      <TouchableOpacity
        style={[
          styles.categoryTab,
          isActive && styles.activeTab,
          isForYou && styles.forYouTab,
        ]}
        onPress={() => {
          if (isForYou) {
            handleForYouClick();
          } else {
            handleCategoryClick(item.slug);
          }
        }}
      >
        {isForYou && (
          <Icon
            name="sparkles"
            size={16}
            color={isActive ? COLORS.white : COLORS.white}
            style={styles.forYouIcon}
          />
        )}
        <Text
          style={[
            styles.categoryText,
            isActive && styles.activeText,
            isForYou && styles.forYouText,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Handle scroll to index failure
  const handleScrollToIndexFailed = (info) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    wait.then(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: Math.min(info.index, data.length - 1),
          animated: true,
          viewPosition: 0.5,
        });
      }
    });
  };

  return (
    <View style={styles.categoriesContainer}>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollContent}
        keyExtractor={(item, index) => item.slug || index.toString()}
        renderItem={renderItem}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        initialNumToRender={data.length}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: COLORS.grey,
    flexDirection: "row",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  forYouTab: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 14,
  },
  activeText: {
    fontWeight: "bold",
  },
  forYouText: {
    fontWeight: "bold",
    color: COLORS.white,
  },
  forYouIcon: {
    marginRight: 2,
  },
});

export default CategoryTabs;
