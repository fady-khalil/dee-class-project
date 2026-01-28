import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { AntDesign } from "@expo/vector-icons";

const OfflineScreen = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <AntDesign name="wifi" size={50} color="#666" />
          <View style={styles.iconOverlay}>
            <View style={styles.iconSlash} />
          </View>
        </View>
        <Text style={styles.title}>{t("navigation.offline_status")}</Text>
        <Text style={styles.message}>{t("navigation.offline_message")}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentContainer: {
    alignItems: "center",
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 20,
    position: "relative",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  iconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  iconSlash: {
    position: "absolute",
    width: 3,
    height: "100%",
    backgroundColor: "#e74c3c",
    transform: [{ rotate: "45deg" }],
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default OfflineScreen;
