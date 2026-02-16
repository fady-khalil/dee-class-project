import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import { useNavigation } from "@react-navigation/native";
import BASE_URL from "../../config/BASE_URL";
import { I18nText } from "../../components/common/I18nComponents";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * 1.6; // 2:3 aspect ratio
const CARD_SPACING = SPACING.md;

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=600&fit=crop",
];

const getServerUrl = () => BASE_URL.replace("/api", "");

const getCategoryImage = (category, index) => {
  if (category.image) {
    const img = category.image;
    if (img.startsWith("http")) return img;
    return `${getServerUrl()}/${img}`;
  }
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
};

const CategoryCard = ({ item, index }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const isComingSoon = item.status === "coming_soon";
  const imageUrl = getCategoryImage(item, index);

  const handlePress = () => {
    if (!isComingSoon) {
      navigation.navigate("Library", { categorySlug: item.slug });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={isComingSoon ? 0.9 : 0.7}
      style={styles.cardWrapper}
    >
      <View style={styles.card}>
        {!imageLoaded && <View style={styles.skeleton} />}
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, !imageLoaded && styles.hiddenImage]}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)"]}
          locations={[0.3, 0.6, 1]}
          style={styles.gradient}
        />
        {isComingSoon ? (
          <>
            <View style={styles.blurOverlay} />
            <View style={styles.comingSoonCenter}>
              <I18nText style={styles.cardTitle}>
                {item.title || item.name}
              </I18nText>
              <View style={styles.comingSoonBadge}>
                <I18nText style={styles.comingSoonText}>
                  {t("general.coming_soon")}
                </I18nText>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.bottomInfo}>
            <I18nText style={styles.cardTitle} numberOfLines={2}>
              {item.title || item.name}
            </I18nText>
            <I18nText style={styles.courseCount}>
              {item.courseCount || 0} {t("general.courses_count")}
            </I18nText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const CategorySlider = ({ categories }) => {
  const { t } = useTranslation();
  if (!categories || categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <I18nText style={styles.sectionTitle}>{t("general.categories")}</I18nText>
      <FlatList
        data={categories}
        renderItem={({ item, index }) => (
          <CategoryCard item={item} index={index} />
        )}
        keyExtractor={(item) => item._id || item.slug}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.md,
    // paddingHorizontal: SPACING.lg,
  },
  listContent: {
    // paddingHorizontal: SPACING.md,
  },
  cardWrapper: {
    marginRight: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#2a2a2a",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  hiddenImage: {
    opacity: 0,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  comingSoonCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.md,
  },
  comingSoonBadge: {
    backgroundColor: "rgba(237,26,77,0.7)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  comingSoonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  bottomInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "start",
  },
  courseCount: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 3,
  },
});

export default CategorySlider;
