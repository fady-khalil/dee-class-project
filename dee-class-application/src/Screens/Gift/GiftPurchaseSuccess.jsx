import React, { useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import usePostDataNoLang from "../../Hooks/usePostDataNoLang";
import COLORS from "../../styles/colors";
import logo from "../../Assests/logos/dclass.png";

const GiftPurchaseSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { session_id } = route.params || {};
  const { user } = useContext(LoginAuthContext);
  const isRTL = i18n.language === "ar";

  const [isLoading, setIsLoading] = useState(true);
  const [giftData, setGiftData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showCopiedModal, setShowCopiedModal] = useState(false);

  const { postData } = usePostDataNoLang();

  useEffect(() => {
    verifyPurchase();
  }, []);

  const verifyPurchase = async () => {
    if (!session_id) {
      setError(t("gift_plan.invalid_session"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await postData("gift/verify-purchase", {
        session_id: session_id,
        user_id: user?._id,
      });

      if (response?.success && response?.data) {
        setGiftData(response.data);
      } else {
        setError(response?.message || t("gift_plan.verification_error"));
      }
    } catch (err) {
      setError(t("gift_plan.verification_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (giftData?.code) {
      // Use Share to copy the code since Clipboard requires extra setup
      try {
        await Share.share({
          message: giftData.code,
        });
      } catch (err) {
        // Show copied modal as fallback
        setShowCopiedModal(true);
        setTimeout(() => setShowCopiedModal(false), 2000);
      }
    }
  };

  const handleShare = async () => {
    if (!giftData?.code) return;

    const shareMessage = t("gift_plan.share_message", {
      code: giftData.code,
      plan: isRTL ? giftData.plan?.title_ar : giftData.plan?.title,
    });

    try {
      await Share.share({
        message: shareMessage,
      });
    } catch (err) {
      // User cancelled or error
    }
  };

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t("gift_plan.verifying_purchase")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <View style={styles.errorCard}>
          <Ionicons name="close-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>{t("gift_plan.error_title")}</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleDone}>
            <Text style={styles.retryButtonText}>{t("gift_plan.done")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      <View style={styles.card}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <MaterialIcons name="card-giftcard" size={64} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>{t("gift_plan.success_title")}</Text>
        <Text style={styles.subtitle}>{t("gift_plan.success_subtitle")}</Text>

        {/* Gift Code Display */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>{t("gift_plan.your_gift_code")}</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{giftData?.code}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <Ionicons name="copy-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Plan Info */}
        <View style={styles.planInfo}>
          <Text style={styles.planLabel}>{t("gift_plan.plan_gifted")}</Text>
          <Text style={styles.planTitle}>
            {isRTL ? giftData?.plan?.title_ar : giftData?.plan?.title}
          </Text>
          <Text style={styles.planDuration}>
            {giftData?.billingCycle === "yearly"
              ? t("gift.one_year")
              : t("gift.one_month")}
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>
            {t("gift_plan.how_to_share")}
          </Text>
          <Text style={styles.instructionsText}>
            {t("gift_plan.instructions_text")}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color={COLORS.white} />
          <Text style={styles.shareButtonText}>{t("gift_plan.share_code")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>{t("gift_plan.done")}</Text>
        </TouchableOpacity>
      </View>

      {/* Copied Modal */}
      <Modal
        visible={showCopiedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCopiedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            <Text style={styles.modalText}>{t("gift_plan.code_copied")}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logo: {
    height: 48,
    width: 150,
    marginBottom: 32,
  },
  loadingText: {
    color: COLORS.darkWhite,
    fontSize: 14,
    marginTop: 16,
  },
  errorCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.darkWhite,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.grey,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkWhite,
    textAlign: "center",
    marginBottom: 24,
  },
  codeContainer: {
    width: "100%",
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 12,
    color: COLORS.darkWhite,
    marginBottom: 8,
    textAlign: "center",
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  codeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 2,
    flex: 1,
    textAlign: "center",
  },
  copyButton: {
    padding: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  planInfo: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  planLabel: {
    fontSize: 12,
    color: COLORS.darkWhite,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 14,
    color: COLORS.primary,
  },
  instructionsBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: COLORS.darkWhite,
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    marginBottom: 12,
  },
  shareButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  doneButtonText: {
    color: COLORS.darkWhite,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalText: {
    color: COLORS.white,
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },
});

export default GiftPurchaseSuccess;
