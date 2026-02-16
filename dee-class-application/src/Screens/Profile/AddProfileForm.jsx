import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import { usePostData } from "../../Hooks/usePostData";
import {
  StatusHandler,
  useStatusHandler,
} from "../../components/RequestHandler";
import Spinner from "../../components/RequestHandler/Spinner";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import {
  I18nText,
  I18nView,
} from "../../components/common/I18nComponents";
import Icon from "react-native-vector-icons/Feather";

const AddProfileForm = ({ isVisible, onClose, profileToEdit = null }) => {
  const { t } = useTranslation();
  const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const { token, setProfiles } = useContext(LoginAuthContext);
  const { postData, isLoading } = usePostData();
  const { showError } = useStatusHandler();
  const isEditMode = !!profileToEdit;

  const [profileName, setProfileName] = useState("");
  const [profileNameError, setProfileNameError] = useState(false);
  const [profileNameFocused, setProfileNameFocused] = useState(false);

  useEffect(() => {
    if (isEditMode && profileToEdit) {
      setProfileName(profileToEdit.name || "");
      setProfileImage(profileToEdit.avatar || null);
    } else {
      setProfileName("");
      setProfileImage(null);
    }
    setProfileNameError(false);
    setImageError("");
  }, [isEditMode, profileToEdit, isVisible]);

  const profileNameChangeHandler = (text) => {
    setProfileName(text);
    setProfileNameError(text.trim().length === 0);
  };

  const pickImage = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access media library is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!pickerResult.cancelled) {
      setProfileImage(pickerResult.uri);
      setImageError("");
    }
  };

  const handleSubmit = async () => {
    if (!profileName.trim()) {
      setProfileNameError(true);
      return;
    }

    if (!token) {
      showError(t("general.authentication_error") || "Authentication error");
      return;
    }

    const profileData = {
      name: profileName,
      image: profileImage,
    };

    try {
      let response;

      if (isEditMode && profileToEdit?.id) {
        response = await postData(
          `edit-profile/${profileToEdit.id}`,
          profileData,
          token
        );
      } else {
        response = await postData("create-profile", profileData, token);
      }

      if (response.success) {
        setProfiles(response.data.profiles);
        onClose();
        setProfileName("");
        setProfileImage(null);
      } else {
        showError(response.message || "api.fetch.error");
      }
    } catch (error) {
      console.error(error);
      showError("api.fetch.error");
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <I18nView style={styles.header}>
              <I18nText style={styles.title}>
                {isEditMode
                  ? t("profiles.edit_profile")
                  : t("profiles.add_profile")}
              </I18nText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="x" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </I18nView>

            <View style={styles.avatarPreviewContainer}>
              <TouchableOpacity
                style={[
                  styles.avatarUploadButton,
                  profileImage && styles.avatarUploadButtonWithImage,
                ]}
                onPress={pickImage}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatarPreview}
                  />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Icon name="plus" size={48} color="#9CA3AF" />
                  </View>
                )}
              </TouchableOpacity>

              {imageError ? (
                <I18nText style={styles.errorText}>{imageError}</I18nText>
              ) : null}
              <I18nText style={styles.uploadText}>
                {t("profiles.upload_image")}
              </I18nText>
              <I18nText style={styles.maxSizeText}>
                {t("profiles.max_file_size")}
              </I18nText>
            </View>

            <View style={styles.formGroup}>
              <TextInput
                style={[
                  styles.input,
                  profileNameError && styles.inputError,
                  profileNameFocused && styles.inputFocused,
                ]}
                value={profileName}
                onChangeText={profileNameChangeHandler}
                placeholder={t("profiles.profile_name")}
                placeholderTextColor="rgba(31, 41, 55, 0.4)"
                onFocus={() => setProfileNameFocused(true)}
                onBlur={() => setProfileNameFocused(false)}
              />
              {profileNameError && (
                <I18nText style={styles.errorText}>
                  {t("profiles.profile_name_required")}
                </I18nText>
              )}
            </View>

            <I18nView style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <I18nText style={styles.cancelButtonText}>
                  {t("buttons.cancel")}
                </I18nText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="small" color={COLORS.white} />
                ) : (
                  <I18nText style={styles.saveButtonText}>
                    {isEditMode ? t("buttons.update") : t("buttons.save")}
                  </I18nText>
                )}
              </TouchableOpacity>
            </I18nView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: SPACING.xxl,
    width: "100%",
    maxWidth: 450,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 24,
    color: "#1F2937",
    fontWeight: "700",
  },
  closeButton: {
    padding: SPACING.sm,
    borderRadius: 20,
  },
  avatarPreviewContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  avatarUploadButton: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
  },
  avatarUploadButtonWithImage: {
    borderStyle: "solid",
    borderColor: COLORS.primary,
  },
  avatarPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: SPACING.sm,
  },
  maxSizeText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: SPACING.xs,
  },
  formGroup: {
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: SPACING.lg,
    borderRadius: 12,
    color: "#1F2937",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
    marginTop: SPACING.xxl,
  },
  button: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
});

export default AddProfileForm;
