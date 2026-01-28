import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import COLORS from "../../styles/colors";
import { useNavigation } from "@react-navigation/native";
import { LoginAuthContext } from "../../context/Authentication/LoginAuth";
import { useContext } from "react";

const AuthExpiredAlert = ({ onLogin, onCancel }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const auth = useContext(LoginAuthContext);

  const handleLogin = () => {
    // Logout first to clear any expired tokens
    if (auth && auth.logoutHandler) {
      auth.logoutHandler();
    }

    // Navigate to login
    if (onLogin) {
      onLogin();
    } else {
      navigation.navigate("Login");
    }
  };

  const handleCancel = () => {
    // Logout on cancel too, to ensure consistent app state
    if (auth && auth.logoutHandler) {
      auth.logoutHandler();
    }

    if (onCancel) {
      onCancel();
    } else {
      // Navigate to Main screen or refresh current page
      navigation.navigate("Main");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Icon
            name="warning"
            size={24}
            color={COLORS.warning}
            style={styles.icon}
          />
          <Text style={styles.title}>{t("auth.login.session_expired")}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>
              {t("navigation.sign_in")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              {t("auth.logout.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFBEB", // amber-50
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  content: {
    flexDirection: "column",
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  title: {
    color: "#92400E", // amber-800
    fontWeight: "600",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.warning,
    borderRadius: 6,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#E5E7EB", // gray-200
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: "#374151", // gray-700
    fontWeight: "500",
  },
});

export default AuthExpiredAlert;
