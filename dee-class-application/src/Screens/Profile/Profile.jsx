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

  const handleManageProfiles = () => {
    navigation.navigate("MyProfiles");
  };

  const handleCompleteRegistration = () => {
    navigation.navigate("Plans");
  };

  const handleVerifyEmail = () => {
    navigation.navigate("VerifyEmail", { email: user?.email });
  };

  const handleCheckCourses = () => {
    navigation.navigate("MyCourses");
  };

  const handleDownloadsPress = () => {
    navigation.navigate("Downloads");
  };

  // Get first letter of name for avatar
  const getInitial = () => {
    const name = selectedUserState?.name || user?.email || "User";
    return name.charAt(0).toUpperCase();
  };

  const renderActionButton = () => {
    // First check if email is verified (API returns 'verified' not 'email_verified')
    const emailVerified = isVerified || user?.verified || user?.email_verified;

    // Scenario 1: Email not verified - show verify email button
    if (!emailVerified) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 8 }]}
          onPress={handleVerifyEmail}
        >
          <Icon
            name="mail"
            size={22}
            color={COLORS.primary}
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>
            {t("verify_email.title")}
          </Text>
          <Icon
            name="chevron-right"
            size={20}
            color={COLORS.darkWhite}
            style={styles.chevron}
          />
        </TouchableOpacity>
      );
    }

    // Scenario 2: Has specific courses (purchased individually) - show Check My Courses
    if (allowedCourses?.length > 0) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 8 }]}
          onPress={handleCheckCourses}
        >
          <Icon
            name="book"
            size={22}
            color={COLORS.white}
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>
            {t("general.check_my_courses")}
          </Text>
          <Icon
            name="chevron-right"
            size={20}
            color={COLORS.darkWhite}
            style={styles.chevron}
          />
        </TouchableOpacity>
      );
    }

    // Scenario 3: Has active plan (allowedProfiles > 0) - show My Profiles
    if (allowedProfiles > 0) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 8 }]}
          onPress={handleManageProfiles}
        >
          <Icon
            name="users"
            size={22}
            color={COLORS.white}
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>{t("general.my_profiles")}</Text>
          <Icon
            name="chevron-right"
            size={20}
            color={COLORS.darkWhite}
            style={styles.chevron}
          />
        </TouchableOpacity>
      );
    }

    // Scenario 4: Verified but no plan and no courses - show Complete Registration (go to Plans)
    return (
      <TouchableOpacity
        style={[styles.actionButton, { marginTop: 8 }]}
        onPress={handleCompleteRegistration}
      >
        <Icon
          name="user-plus"
          size={22}
          color={COLORS.white}
          style={styles.actionIcon}
        />
        <Text style={styles.actionText}>
          {t("general.complete_registration")}
        </Text>
        <Icon
          name="chevron-right"
          size={20}
          color={COLORS.darkWhite}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.backgroundColor}
        barStyle="light-content"
      />

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("screens.settings")}</Text>
      </View>

      {/* Profile Info Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>
        <Text style={styles.userName}>
          {selectedUserState?.name || user?.email || "User"}
        </Text>
        <Text style={styles.userSubtitle}>{t("general.login_subtitle")}</Text>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsContainer}>
        {renderActionButton()}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDownloadsPress}
        >
          <MaterialIcon
            name="download"
            size={22}
            color={COLORS.white}
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>{t("downloads.screen_title")}</Text>
          {downloadedCourses.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{downloadedCourses.length}</Text>
            </View>
          )}
          <Icon
            name="chevron-right"
            size={20}
            color={COLORS.darkWhite}
            style={styles.chevron}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 8, borderBottomWidth: 0 }]}
          onPress={handleLogout}
        >
          <Icon
            name="log-out"
            size={22}
            color="#FF5A5A"
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, { color: "#FF5A5A" }]}>
            {t("screens.logout")}
          </Text>
          <Icon
            name="chevron-right"
            size={20}
            color="#FF5A5A"
            style={[styles.chevron, { opacity: 0.7 }]}
          />
        </TouchableOpacity>
      </View>

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
            <Text style={styles.modalMessage}>
              {t("general.logout_message")}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelLogout}
              >
                <Text style={styles.cancelButtonText}>
                  {t("general.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>
                  {t("general.logout")}
                </Text>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
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
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: COLORS.darkWhite,
    opacity: 0.8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  actionsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
    width: "100%",
  },
  actionIcon: {
    marginRight: 16,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  chevron: {
    opacity: 0.5,
  },
  versionContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
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
    backgroundColor: "#FF5A5A",
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
});

export default Profile;
