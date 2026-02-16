import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import AddProfileForm from "./AddProfileForm";
import DeleteProfileModal from "./DeleteProfileModal";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import { I18nText, I18nView } from "../../components/common/I18nComponents";
import { HeaderBack } from "../../components/navigation";
import Icon from "react-native-vector-icons/Feather";

const MyProfiles = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { profiles, allowedProfiles, setSelectedUserState } =
    useContext(LoginAuthContext);

  const [isAddProfileFormOpen, setIsAddProfileFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isManageMode, setIsManageMode] = useState(false);

  // Use ref to prevent flickering by tracking when we've made a decision
  const initialDecisionMade = useRef(false);

  // Handle profile form visibility based on profile data
  useEffect(() => {
    // Only make this decision once when we have valid data and haven't made a decision yet
    if (allowedProfiles !== undefined && !initialDecisionMade.current) {
      // Wait briefly to ensure we have the latest data
      const timer = setTimeout(() => {
        // Case 1: User has no profiles but is allowed to create one
        if (
          (profiles === false ||
            profiles === null ||
            (Array.isArray(profiles) && profiles.length === 0)) &&
          allowedProfiles > 0
        ) {
          setIsAddProfileFormOpen(true);
        }
        // Case 2: User already has profiles
        else if (Array.isArray(profiles) && profiles.length > 0) {
          setIsAddProfileFormOpen(false);
        }

        // Mark that we've made our decision
        initialDecisionMade.current = true;
      }, 300); // Small delay to ensure we have final data

      return () => clearTimeout(timer);
    }
  }, [profiles, allowedProfiles]);

  // Profile colors
  const profileColors = [
    "#0369a1", // Blue
    "#059669", // Green
    "#f59e0b", // Amber
    "#6366f1", // Indigo
    "#f43f5e", // Rose
    "#14b8a6", // Teal
    "#64748b", // Slate
  ];

  // Get color based on profile index
  const getProfileColor = (index) => {
    return profileColors[index % profileColors.length];
  };

  // Check if we can add more profiles
  const profilesArray = Array.isArray(profiles) ? profiles : [];
  const profileCount = profilesArray.length;
  // Handle allowedProfiles being false, "false", number, or string number
  const maxProfiles = allowedProfiles && allowedProfiles !== "false" && allowedProfiles !== false
    ? Number(allowedProfiles)
    : 0;
  const canAddProfile = maxProfiles > 0 && profileCount < maxProfiles;

  // Create data array with add button placeholder if allowed
  const listData = canAddProfile
    ? [...profilesArray, { _isAddButton: true }]
    : profilesArray;

  // Open edit profile form
  const handleEditProfile = (profile) => {
    setSelectedProfile(profile);
    setIsAddProfileFormOpen(true);
  };

  // Open delete profile modal
  const handleDeleteProfile = (profile) => {
    setSelectedProfile(profile);
    setIsDeleteModalOpen(true);
  };

  // Toggle manage mode
  const toggleManageMode = () => {
    setIsManageMode(!isManageMode);
  };

  // Select a profile and navigate to the main screen
  const handleSelectProfile = (profile) => {
    setSelectedUserState(profile);
    navigation.navigate("Main");
  };

  // Render a profile item or add button
  const renderProfileItem = ({ item, index }) => {
    // Render add profile button
    if (item._isAddButton) {
      return (
        <View style={styles.profileItemWrapper}>
          <TouchableOpacity
            style={styles.profileItem}
            onPress={() => {
              setSelectedProfile(null);
              setIsAddProfileFormOpen(true);
            }}
          >
            <View style={styles.addProfileCircle}>
              <Text style={styles.addProfilePlus}>+</Text>
            </View>
            <I18nText style={styles.profileName}>
              {t("profiles.add_profile")}
            </I18nText>
          </TouchableOpacity>
        </View>
      );
    }

    // Render regular profile
    return (
      <View style={styles.profileItemWrapper}>
        <TouchableOpacity
          style={styles.profileItem}
          onPress={() => handleSelectProfile(item)}
          disabled={isManageMode}
        >
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              style={styles.profileAvatar}
              onError={() => (
                <View
                  style={[
                    styles.profileInitial,
                    { backgroundColor: getProfileColor(index) },
                  ]}
                >
                  <Text style={styles.initialText}>{item.name.charAt(0)}</Text>
                </View>
              )}
            />
          ) : (
            <View
              style={[
                styles.profileInitial,
                { backgroundColor: getProfileColor(index) },
              ]}
            >
              <Text style={styles.initialText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <I18nText style={styles.profileName}>{item.name}</I18nText>
        </TouchableOpacity>

        {isManageMode && (
          <View style={styles.managementOptions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditProfile(item)}
            >
              <Icon
                name="edit-2"
                size={16}
                color={COLORS.white}
                style={styles.buttonIcon}
              />
              <I18nText style={styles.buttonText}>
                {t("profiles.manage_profile")}
              </I18nText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteProfile(item)}
            >
              <Icon
                name="trash-2"
                size={16}
                color={COLORS.white}
                style={styles.buttonIcon}
              />
              <I18nText style={styles.buttonText}>
                {t("profiles.delete_profile")}
              </I18nText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={"#000"} barStyle="light-content" />
      <HeaderBack
        screenName="my_profiles"
        hideBackButton={!navigation.canGoBack()}
      />

      <View style={styles.contentContainer}>
        <I18nText style={styles.title}>{t("profiles.whos_watching")}</I18nText>

        <FlatList
          data={listData}
          renderItem={({ item, index }) => renderProfileItem({ item, index })}
          keyExtractor={(item, index) => item?._isAddButton ? "add-button" : (item?.id?.toString() || item?._id?.toString() || index.toString())}
          numColumns={2}
          columnWrapperStyle={listData.length > 1 ? styles.columnWrapper : undefined}
          contentContainerStyle={styles.profilesListContainer}
          ListEmptyComponent={
            <I18nText style={styles.emptyText}>
              {t("profiles.no_profiles")}
            </I18nText>
          }
        />

        <TouchableOpacity
          style={[
            styles.manageButton,
            isManageMode && styles.manageButtonActive,
          ]}
          onPress={toggleManageMode}
        >
          <I18nText style={styles.manageButtonText}>
            {isManageMode ? t("buttons.cancel") : t("profiles.manage_profile")}
          </I18nText>
        </TouchableOpacity>
      </View>

      <AddProfileForm
        isVisible={isAddProfileFormOpen}
        onClose={() => {
          setIsAddProfileFormOpen(false);
          setSelectedProfile(null);
        }}
        profileToEdit={selectedProfile}
      />

      <DeleteProfileModal
        isVisible={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProfile(null);
        }}
        profile={selectedProfile}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  profilesListContainer: {
    paddingBottom: SPACING.xl,
    alignItems: "center",
    width: "100%",
  },
  columnWrapper: {
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: SPACING.lg,
  },
  profileItemWrapper: {
    alignItems: "center",
    width: 140,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  profileItem: {
    alignItems: "center",
    width: "100%",
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.md,
  },
  profileInitial: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  initialText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: "bold",
  },
  profileName: {
    color: COLORS.darkWhite,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  managementOptions: {
    marginTop: SPACING.md,
    width: "100%",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkGrey,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: COLORS.primary,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
  },
  addProfileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.darkGrey,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  addProfilePlus: {
    fontSize: 40,
    color: COLORS.white,
    fontWeight: "300",
  },
  manageButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: SPACING.lg,
    alignSelf: "center",
    minWidth: 180,
    alignItems: "center",
  },
  manageButtonActive: {
    backgroundColor: COLORS.darkGrey,
  },
  manageButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    color: COLORS.darkWhite,
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});

export default MyProfiles;
