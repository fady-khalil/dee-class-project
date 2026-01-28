import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  StatusBar,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import ReelContainer from "./ReelContainer";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../../styles/colors";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Reels = ({ isAuthenticated, trending }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReelModalVisible, setIsReelModalVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isRTL = i18n.language === "ar";

  // Get reels from trending data passed from parent
  const reelsData = trending?.reels || [];
  const sectionTitle = trending?.title || t("home.featured_reels");
  const sectionDescription = trending?.text || t("home.reels_description");

  // Open full-screen reel
  const openReelModal = () => {
    setIsReelModalVisible(true);
    StatusBar.setHidden(true);
  };

  // Close full-screen reel view
  const closeReelModal = () => {
    setIsReelModalVisible(false);
    StatusBar.setHidden(false);
  };

  const handleJoinPress = () => {
    navigation.navigate("Plans");
  };

  const handleViewCategoriesPress = () => {
    navigation.navigate("Library");
  };

  // Get the featured reel (first one)
  const featuredReel = reelsData.length > 0 ? reelsData[0] : null;

  // Don't render if no reels available
  if (!featuredReel) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section header with subtle gradient */}
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0)"]}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>{sectionTitle}</Text>
        <Text style={styles.description}>{sectionDescription}</Text>
      </LinearGradient>

      {/* Featured reel preview - now smaller and more modern */}
      <View style={styles.contentWrapper}>
        <TouchableOpacity
          style={styles.featuredReelContainer}
          onPress={openReelModal}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: featuredReel.assets?.thumbnail }}
            style={styles.featuredThumbnail}
            resizeMode="cover"
          />

          {/* Play icon overlay with subtle animation */}
          <View style={styles.playIconContainer}>
            <View style={styles.playIconCircle}>
              <Ionicons name="play" size={24} color="#fff" />
            </View>
          </View>

          {/* Gradient overlay for better text readability */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
            style={styles.gradient}
          />

          {/* Info overlay */}
          <View style={styles.featuredInfoOverlay}>
            <Text style={styles.featuredTitle}>{featuredReel.title}</Text>
            {featuredReel.description && (
              <Text style={styles.statsText} numberOfLines={2}>
                {featuredReel.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actionPanel}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={handleViewCategoriesPress}
          >
            <Ionicons
              name="grid-outline"
              size={16}
              color={COLORS.primary}
              style={styles.buttonIcon}
            />
            <Text numberOfLines={1} style={styles.outlineButtonText}>
              {t("navigation.all_categories")}
            </Text>
          </TouchableOpacity>
          {!isAuthenticated && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleJoinPress}
            >
              <Ionicons
                name="play-circle-outline"
                size={18}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text numberOfLines={1} style={styles.primaryButtonText}>
                {t("courses.join_to_watch")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Full-screen reel modal */}
      <Modal
        visible={isReelModalVisible}
        animationType="slide"
        onRequestClose={closeReelModal}
        statusBarTranslucent={true}
        presentationStyle="fullScreen"
      >
        <View style={styles.modalBackground}>
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeReelModal}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <ReelContainer
              reelsData={reelsData}
              activeIndex={0}
              setActiveIndex={setActiveIndex}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 0,
    backgroundColor: COLORS.backgroundColor,
    overflow: "hidden",
    marginTop: 32,
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    color: "#cccccc",
    textAlign: "center",
    maxWidth: "85%",
    alignSelf: "center",
  },
  contentWrapper: {
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  featuredReelContainer: {
    width: "70%",
    marginLeft: "auto",
    marginRight: "auto",
    height: 400,
    // aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: COLORS.grey,
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featuredThumbnail: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  featuredInfoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    color: "#ddd",
    fontSize: 12,
  },
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  actionPanel: {
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0c0c0c",
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  buttonIcon: {
    marginRight: 8,
  },
  modalBackground: {
    flex: 1,
    height: "100%",
    backgroundColor: COLORS.backgroundColor,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 16,
    zIndex: 100,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
});

export default Reels;
