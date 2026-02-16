import React, { useState } from "react";
import {
  View,
  StyleSheet,
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
import SPACING from "../../../styles/spacing";
import { LinearGradient } from "expo-linear-gradient";
import { I18nText } from "../../../components/common/I18nComponents";

const Reels = ({
  isAuthenticated,
  allowedProfiles,
  allowedCourses,
  isVerified,
  user,
  trending,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReelModalVisible, setIsReelModalVisible] = useState(false);
  const { t } = useTranslation();
  const navigation = useNavigation();

  const reelsData = trending?.reels || [];
  const sectionTitle = trending?.title || t("home.featured_reels");
  const sectionDescription = trending?.text || t("home.reels_description");
  const featuredReel = reelsData[0];

  const isLoggedIn = !!user;
  const emailVerified = isVerified || user?.verified || user?.email_verified;

  const getButtonConfig = () => {
    if (!isLoggedIn) {
      return {
        text: t("navigation.sign_up"),
        onPress: () => navigation.navigate("Register"),
      };
    }
    if (!emailVerified) {
      return {
        text: t("general.verify_email"),
        onPress: () => navigation.navigate("VerifyEmail", { email: user?.email }),
      };
    }
    if (allowedProfiles > 0) {
      return {
        text: t("navigation.my_progress"),
        onPress: () => navigation.navigate("MyProgress"),
      };
    }
    if (allowedCourses?.length > 0) {
      return {
        text: t("general.check_my_courses"),
        onPress: () => navigation.navigate("MyCourses"),
      };
    }
    return {
      text: t("general.check_our_packages"),
      onPress: () => navigation.navigate("Plans"),
    };
  };

  const buttonConfig = getButtonConfig();

  const openReelModal = () => {
    setIsReelModalVisible(true);
    StatusBar.setHidden(true);
  };

  const closeReelModal = () => {
    setIsReelModalVisible(false);
    StatusBar.setHidden(false);
  };

  if (!featuredReel) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <I18nText style={styles.title}>{sectionTitle}</I18nText>
        <I18nText style={styles.description}>{sectionDescription}</I18nText>
      </View>

      <TouchableOpacity
        style={styles.reelPreview}
        onPress={openReelModal}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: featuredReel.assets?.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.playOverlay}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={24} color="#fff" />
          </View>
        </View>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
          style={styles.gradient}
        />
        <View style={styles.reelInfo}>
          <I18nText style={styles.reelTitle}>{featuredReel.title}</I18nText>
          {featuredReel.description && (
            <I18nText style={styles.reelDesc} numberOfLines={2}>
              {featuredReel.description}
            </I18nText>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={buttonConfig.onPress}
        >
          <I18nText style={styles.primaryBtnText}>{buttonConfig.text}</I18nText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => navigation.navigate("Library")}
        >
          <I18nText style={styles.outlineBtnText}>
            {t("general.view_all_categories")}
          </I18nText>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isReelModalVisible}
        animationType="slide"
        onRequestClose={closeReelModal}
        statusBarTranslucent={true}
        presentationStyle="fullScreen"
      >
        <View style={styles.modalBg}>
          <TouchableOpacity
            style={styles.closeBtn}
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
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    maxWidth: "85%",
    alignSelf: "center",
  },
  reelPreview: {
    width: "70%",
    height: 400,
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.grey,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  reelInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  reelTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  reelDesc: {
    color: "#ddd",
    fontSize: 12,
  },
  buttonsRow: {
    flexDirection: "column",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  modalBg: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: SPACING.lg,
    zIndex: 100,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Reels;
