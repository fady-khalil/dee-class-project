import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useDownload } from "../../context/Download/DownloadContext";
import COLORS from "../../styles/colors";

const OfflineScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { downloadedCourses } = useDownload();

  const hasDownloads = downloadedCourses && downloadedCourses.length > 0;

  const handleViewDownloads = () => {
    navigation.navigate("Downloads");
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <AntDesign name="wifi" size={50} color="#666" />
          <View style={styles.iconOverlay}>
            <View style={styles.iconSlash} />
          </View>
        </View>
        <Text style={styles.title}>{t("downloads.offline_banner_title")}</Text>
        <Text style={styles.message}>
          {hasDownloads
            ? t("downloads.offline_banner_message")
            : t("downloads.offline_banner_empty")}
        </Text>

        {hasDownloads && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleViewDownloads}
            activeOpacity={0.7}
          >
            <MaterialIcons name="download" size={20} color={COLORS.white} />
            <Text style={styles.downloadButtonText}>
              {t("downloads.view_downloads")}
            </Text>
          </TouchableOpacity>
        )}
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
  downloadButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 24,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default OfflineScreen;
