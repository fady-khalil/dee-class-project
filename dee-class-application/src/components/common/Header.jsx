import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image as RNImage,
  Modal,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import { changeLanguage } from "../../translations/i18n";
import Logo from "../../Assests/logos/dclass.png";
import { GlobalStyle } from "../../styles/GlobalStyle";
import Icon from "react-native-vector-icons/Ionicons";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
];

const Header = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const navigation = useNavigation();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  // Get isLoggedIn from context with fallback to false if context is undefined
  const auth = useContext(LoginAuthContext);
  const isLoggedIn = auth ? auth.isLoggedIn : false;

  const handleLanguageSelect = (languageCode) => {
    setIsLanguageModalVisible(false);
    if (languageCode !== currentLanguage) {
      changeLanguage(languageCode);
    }
  };

  const handleAuthNavigation = () => {
    if (isLoggedIn) {
      navigation.navigate("Profile");
    } else {
      navigation.navigate("Login");
    }
  };

  return (
    <View
      style={[GlobalStyle.container, styles.container, { direction: "ltr" }]}
    >
      <View style={[styles.content, { direction: "ltr" }]}>
        <View>
          <RNImage resizeMode="contain" source={Logo} style={styles.logo} />
        </View>

        <View style={[styles.rightSection]}>
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleAuthNavigation}
          >
            <Icon
              name={isLoggedIn ? "person" : "person-outline"}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setIsLanguageModalVisible(true)}
          >
            <Icon name="globe-outline" size={18} color={COLORS.white} style={styles.globeIcon} />
            <Text style={styles.languageButtonText}>
              {currentLanguage === "ar" ? "العربية" : "EN"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsLanguageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("header.selectLanguage") || "Select Language"}</Text>

            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  currentLanguage === language.code && styles.languageOptionSelected,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    currentLanguage === language.code && styles.languageOptionTextSelected,
                  ]}
                >
                  {language.nativeName}
                </Text>
                {currentLanguage === language.code && (
                  <Icon name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
    paddingTop: SPACING.sm,
  },
  content: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  logo: {
    width: 120,
    height: 50,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  authButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  languageButton: {
    backgroundColor: COLORS.grey,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  globeIcon: {
    marginRight: 6,
  },
  languageButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 300,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  languageOptionSelected: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  languageOptionText: {
    color: COLORS.white,
    fontSize: 16,
  },
  languageOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default Header;
