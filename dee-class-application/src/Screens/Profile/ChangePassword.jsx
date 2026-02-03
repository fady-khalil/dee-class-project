import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Feather";
import COLORS from "../../styles/colors";
import { GlobalStyle } from "../../styles/GlobalStyle";
import HeaderBack from "../../components/navigation/HeaderBack";
import { useAuth } from "../../context/Authentication/LoginAuth";
import BASE_URL from "../../config/BASE_URL";

const { width } = Dimensions.get("window");

const ChangePassword = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { token } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success"); // "success" or "error"
  const [modalMessage, setModalMessage] = useState("");

  const showSuccessModal = (message) => {
    setModalType("success");
    setModalMessage(message);
    setShowModal(true);
  };

  const showErrorModal = (message) => {
    setModalType("error");
    setModalMessage(message);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (modalType === "success") {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    // Validate
    if (!currentPassword) {
      showErrorModal(t("account.current_password_required"));
      return;
    }
    if (newPassword.length < 8) {
      showErrorModal(t("account.password_too_short"));
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorModal(t("account.password_mismatch"));
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(
        `${BASE_URL}/${i18n.language}/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
          }),
        }
      );
      const result = await response.json();

      if (result.success) {
        showSuccessModal(t("account.password_changed"));
      } else {
        showErrorModal(result.message || t("account.update_error"));
      }
    } catch (error) {
      showErrorModal(t("account.update_error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, GlobalStyle.safeAreaView]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={[GlobalStyle.container, styles.content]}>
          <HeaderBack screenName="change_password" />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("account.current_password")}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                    placeholderTextColor={COLORS.darkWhite}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Icon
                      name={showCurrentPassword ? "eye" : "eye-off"}
                      size={20}
                      color={COLORS.darkWhite}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("account.new_password")}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    placeholderTextColor={COLORS.darkWhite}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Icon
                      name={showNewPassword ? "eye" : "eye-off"}
                      size={20}
                      color={COLORS.darkWhite}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>
                  {t("account.password_min_chars")}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("account.confirm_password")}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor={COLORS.darkWhite}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon
                      name={showConfirmPassword ? "eye" : "eye-off"}
                      size={20}
                      color={COLORS.darkWhite}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {t("account.save_changes")}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => navigation.goBack()}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>{t("account.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Success/Error Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View
              style={[
                styles.modalIconContainer,
                modalType === "success"
                  ? styles.successIconContainer
                  : styles.errorIconContainer,
              ]}
            >
              <Icon
                name={modalType === "success" ? "check" : "alert-circle"}
                size={32}
                color={modalType === "success" ? "#10B981" : "#EF4444"}
              />
            </View>
            <Text style={styles.modalTitle}>
              {modalType === "success"
                ? t("general.success")
                : t("errors.general.title")}
            </Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={[
                styles.modalButton,
                modalType === "success"
                  ? styles.successButton
                  : styles.errorButton,
              ]}
              onPress={handleModalClose}
            >
              <Text style={styles.modalButtonText}>{t("general.ok")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.white,
  },
  eyeButton: {
    padding: 14,
  },
  helperText: {
    color: COLORS.darkWhite,
    fontSize: 12,
    marginTop: 6,
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },
  // Modal styles
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
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIconContainer: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  errorIconContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#E0E0E0",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  successButton: {
    backgroundColor: "#10B981",
  },
  errorButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
