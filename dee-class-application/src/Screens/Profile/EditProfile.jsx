import React, { useState, useEffect } from "react";
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
import useAuthFetchNoLang from "../../Hooks/useAuthFetchNoLang";
import BASE_URL from "../../config/BASE_URL";

const { width } = Dimensions.get("window");

const EditProfile = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { token, user, setUser } = useAuth();
  const { fetchData } = useAuthFetchNoLang();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
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

  // Fetch current profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      try {
        const response = await fetchData(`${i18n.language}/account/me`, token);
        if (response?.success && response?.data) {
          setFullName(response.data.fullName || "");
          setPhoneNumber(response.data.phoneNumber || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  const handleSave = async () => {
    // Validate
    if (fullName.trim().length < 2) {
      showErrorModal(t("account.name_required"));
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(
        `${BASE_URL}/${i18n.language}/account/me`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullName: fullName.trim(), phoneNumber: phoneNumber.trim() }),
        }
      );
      const result = await response.json();

      if (result.success) {
        // Update local user state
        if (user) {
          setUser({ ...user, fullName: fullName.trim() });
        }
        showSuccessModal(t("account.profile_updated"));
      } else {
        showErrorModal(result.message || t("account.update_error"));
      }
    } catch (error) {
      showErrorModal(t("account.update_error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, GlobalStyle.safeAreaView]}>
        <View style={[GlobalStyle.container, styles.content]}>
          <HeaderBack screenName="edit_profile" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, GlobalStyle.safeAreaView]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={[GlobalStyle.container, styles.content]}>
          <HeaderBack screenName="edit_profile" />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("account.full_name")}</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor={COLORS.darkWhite}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("account.phone_number")}</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder={t("account.phone_placeholder")}
                  placeholderTextColor={COLORS.darkWhite}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("account.email")}</Text>
                <View style={[styles.input, styles.disabledInput]}>
                  <Text style={styles.disabledText}>{user?.email}</Text>
                </View>
                <Text style={styles.helperText}>
                  {t("account.email_cannot_change")}
                </Text>
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

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  disabledInput: {
    opacity: 0.6,
  },
  disabledText: {
    color: COLORS.darkWhite,
    fontSize: 16,
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
