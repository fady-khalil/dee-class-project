import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import COLORS from "../../styles/colors";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useDownload } from "../../context/Download/DownloadContext";

const { width } = Dimensions.get("window");

const Profile = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    logoutHandler,
    user,
    selectedUserState,
    allowedProfiles,
    allowedCourses,
    isAuthenticated,
    isVerified,
  } = useContext(LoginAuthContext);
  const { downloadedCourses } = useDownload();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logoutHandler();
    navigation.navigate("Main");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Check if email is verified
  const emailVerified = isVerified || user?.verified || user?.email_verified;

  // Check if user has active subscription (handle string/number)
  const hasActiveSubscription = Number(allowedProfiles) > 0;

  // Get first letter of name for avatar
  const getInitial = () => {
    const name = selectedUserState?.name || user?.fullName || user?.email || "User";
    return name.charAt(0).toUpperCase();
  };

  // Menu item component
  const MenuItem = ({ icon, iconType = "feather", title, onPress, showBadge, badgeCount, textColor, iconColor }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      {iconType === "feather" ? (
        <Icon name={icon} size={22} color={iconColor || COLORS.white} style={styles.menuIcon} />
      ) : (
        <MaterialIcon name={icon} size={22} color={iconColor || COLORS.white} style={styles.menuIcon} />
      )}
      <Text style={[styles.menuText, textColor && { color: textColor }]}>{title}</Text>
      {showBadge && badgeCount > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
      <Icon name="chevron-right" size={20} color={textColor || COLORS.darkWhite} style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.backgroundColor} barStyle="light-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("screens.settings")}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitial()}</Text>
          </View>
          <Text style={styles.userName}>
            {selectedUserState?.name || user?.fullName || user?.email || "User"}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Not Verified Warning */}
        {!emailVerified && (
          <TouchableOpacity
            style={styles.verifyWarning}
            onPress={() => navigation.navigate("VerifyEmail", { email: user?.email })}
          >
            <Icon name="alert-circle" size={20} color="#F59E0B" />
            <View style={styles.verifyWarningContent}>
              <Text style={styles.verifyWarningTitle}>{t("verify_email.title")}</Text>
              <Text style={styles.verifyWarningText}>{t("account.verify_email_first")}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#F59E0B" />
          </TouchableOpacity>
        )}

        {/* Account Section */}
        {emailVerified && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("account.profile_section")}</Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon="edit-2"
                title={t("account.edit_profile")}
                onPress={() => navigation.navigate("EditProfile")}
              />
              <MenuItem
                icon="lock"
                title={t("account.change_password")}
                onPress={() => navigation.navigate("ChangePassword")}
              />
            </View>
          </View>
        )}

        {/* Subscription Section - only if has plan */}
        {emailVerified && hasActiveSubscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("account.subscription_section")}</Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon="card-membership"
                iconType="material"
                title={t("account.my_subscription")}
                onPress={() => navigation.navigate("SubscriptionDetails")}
              />
              <MenuItem
                icon="users"
                title={t("account.manage_profiles")}
                onPress={() => navigation.navigate("MyProfiles")}
              />
              <MenuItem
                icon="card-giftcard"
                iconType="material"
                title={t("gift_plan.title")}
                onPress={() => navigation.navigate("GiftPlan")}
              />
            </View>
          </View>
        )}

        {/* Courses Section - only if has purchased courses */}
        {emailVerified && allowedCourses?.length > 0 && !hasActiveSubscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("account.my_courses")}</Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon="book"
                title={t("general.check_my_courses")}
                onPress={() => navigation.navigate("MyCourses")}
              />
            </View>
          </View>
        )}

        {/* Downloads Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("downloads.screen_title")}</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="download"
              iconType="material"
              title={t("downloads.screen_title")}
              onPress={() => navigation.navigate("Downloads")}
              showBadge
              badgeCount={downloadedCourses.length}
            />
          </View>
        </View>

        {/* No Plan Section - prompt to subscribe */}
        {emailVerified && !hasActiveSubscription && allowedCourses?.length === 0 && (
          <View style={styles.section}>
            <View style={styles.subscribeCard}>
              <MaterialIcon name="card-membership" size={32} color={COLORS.primary} />
              <Text style={styles.subscribeTitle}>{t("account.no_subscription")}</Text>
              <Text style={styles.subscribeText}>{t("account.no_subscription_desc")}</Text>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => navigation.navigate("Plans")}
              >
                <Text style={styles.subscribeButtonText}>{t("navigation.plans")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logout Section */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.menuCard}>
            <MenuItem
              icon="log-out"
              title={t("account.logout")}
              onPress={handleLogout}
              textColor="#EF4444"
              iconColor="#EF4444"
            />
          </View>
        </View>
      </ScrollView>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("general.confirm_logout")}</Text>
            <Text style={styles.modalMessage}>{t("general.logout_message")}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelLogout}
              >
                <Text style={styles.cancelButtonText}>{t("general.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>{t("general.logout")}</Text>
              </TouchableOpacity>
            </View>
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
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.darkWhite,
  },
  verifyWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  verifyWarningContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  verifyWarningTitle: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "600",
  },
  verifyWarningText: {
    color: "#F59E0B",
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.darkWhite,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  menuIcon: {
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "500",
  },
  chevron: {
    opacity: 0.5,
  },
  badgeContainer: {
    backgroundColor: COLORS.primary,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  subscribeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
  },
  subscribeTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  subscribeText: {
    color: COLORS.darkWhite,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  subscribeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  versionContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  versionText: {
    color: COLORS.darkWhite,
    opacity: 0.5,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#E0E0E0",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  confirmButton: {
    backgroundColor: "#EF4444",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Profile;
