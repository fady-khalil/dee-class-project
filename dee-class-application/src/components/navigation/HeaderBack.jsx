import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  I18nManager,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";
import { useTranslation } from "react-i18next";
import { GlobalStyle } from "../../styles/GlobalStyle";
/**
 * Reusable header component with back navigation
 *
 * @param {Object} props
 * @param {string} props.screenName - The name of the screen (e.g., "login", "register") - will be translated
 * @param {Function} props.onBack - Custom back action (optional, uses navigation.goBack by default)
 * @param {boolean} props.hideBackButton - Option to hide the back button (default: false)
 * @param {Object} props.style - Additional styles for the container
 * @param {Object} props.titleStyle - Additional styles for the title
 * @param {Object} props.backButtonStyle - Additional styles for the back button
 */
const HeaderBack = ({
  screenName,
  onBack,
  hideBackButton = false,
  style,
  titleStyle,
  backButtonStyle,
  pageName,
}) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  // Choose correct back icon based on RTL direction
  const backIconName = isRTL ? "chevron-forward" : "chevron-back";

  return (
    <View style={[GlobalStyle.container, styles.container, style]}>
      <View style={styles.headerContainer}>
        {/* Back button - positioned according to RTL/LTR */}
        <TouchableOpacity onPress={handleBack} style={[styles.backButton]}>
          <Icon name={backIconName} size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Title with minimal spacing from back button */}
        <View style={[styles.titleContainer]}>
          <Text style={[styles.title, titleStyle]} numberOfLines={2}>
            {screenName ? t(`screens.${screenName}`) : pageName}
          </Text>
        </View>

        {/* Home button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Main")}
          style={styles.homeButton}
        >
          <Icon name="home-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.md,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    alignItems: "flex-start",
  },
  backButton: {
    padding: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },
  homeButton: {
    padding: SPACING.sm,
  },
});

export default HeaderBack;
