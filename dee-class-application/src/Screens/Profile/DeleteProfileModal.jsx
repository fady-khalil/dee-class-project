import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import useDelete from "../../Hooks/useDelete";
import {
  StatusHandler,
  useStatusHandler,
} from "../../components/RequestHandler";
import Spinner from "../../components/RequestHandler/Spinner";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import { I18nText } from "../../components/common/I18nComponents";

const DeleteProfileModal = ({ isVisible, onClose, profile }) => {
  const { t } = useTranslation();
  const { setProfiles, token } = useContext(LoginAuthContext);
  const { deleteData, isLoading } = useDelete();
  const {
    isVisible: statusVisible,
    status,
    message,
    showSuccess,
    showError,
    hideStatus,
    messages,
  } = useStatusHandler();

  const handleDeleteProfile = async () => {
    if (!profile) return;

    try {
      const response = await deleteData(`delete-profile/${profile.id}`, token);

      if (response.success) {
        showSuccess(
          t("profile.delete_profile_success") || "Profile deleted successfully"
        );
        setProfiles(response.data?.profiles);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showError(response.message || t("general.something_went_wrong"));
      }
    } catch (error) {
      console.error(error);
      showError(t("general.something_went_wrong"));
    }
  };

  if (!profile) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <StatusHandler
            isVisible={statusVisible}
            status={status}
            message={message}
            hideStatus={hideStatus}
            messages={messages}
          />

          <I18nText style={styles.title}>
            {t("profiles.delete_profile")}
          </I18nText>

          <I18nText style={styles.message}>
            {t("profiles.confirm_delete")}
          </I18nText>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <I18nText style={styles.cancelButtonText}>
                {t("buttons.cancel")}
              </I18nText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner isSmall={true} isWhite={true} />
              ) : (
                <I18nText style={styles.deleteButtonText}>
                  {t("profiles.yes_delete")}
                </I18nText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.backgroundColor,
    borderRadius: 12,
    padding: SPACING.xl,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: COLORS.darkWhite,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: COLORS.darkGrey,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 6,
    flex: 1,
    marginRight: SPACING.sm,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 6,
    flex: 1,
    marginLeft: SPACING.sm,
    alignItems: "center",
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default DeleteProfileModal;
