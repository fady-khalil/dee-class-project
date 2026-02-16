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
import SPACING from "../../styles/spacing";
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
    const isComingSoon = item.status === "coming_soon";

    return (
      <TouchableOpacity
        style={[
          styles.categoryTab,
          isActive && styles.activeTab,
          isForYou && styles.forYouTab,
          isComingSoon && styles.comingSoonTab,
        ]}
        disabled={isComingSoon}
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
            color={COLORS.white}
            style={styles.forYouIcon}
          />
        )}
        <Text
          style={[
            styles.categoryText,
            isActive && styles.activeText,
            isForYou && styles.forYouText,
            isComingSoon && styles.comingSoonText,
          ]}
        >
          {item.name || item.title}
        </Text>
        {isComingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonBadgeText}>
              {t("general.coming_soon", "Soon")}
            </Text>
          </View>
        )}
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
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  categoriesScrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  categoryTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginHorizontal: SPACING.xs,
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
  comingSoonTab: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  comingSoonText: {
    color: "rgba(255,255,255,0.3)",
  },
  comingSoonBadge: {
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "rgba(237,26,77,0.5)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comingSoonBadgeText: {
    color: "rgba(237,26,77,0.7)",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default CategoryTabs;
