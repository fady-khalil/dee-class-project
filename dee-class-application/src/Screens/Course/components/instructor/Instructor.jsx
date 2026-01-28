import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../../../config/BASE_URL";
import COLORS from "../../../../styles/colors";

// Get server URL without /api for image paths
const getServerUrl = () => {
  return BASE_URL.replace("/api", "");
};

// Get instructor image URL
const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return null;
  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  // Otherwise prepend server URL
  return `${getServerUrl()}/${imagePath}`;
};

const Instructor = ({ data }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (!data) {
    return null;
  }

  const handleViewProfile = () => {
    navigation.navigate("InstructorProfile", {
      instructorSlug: data.slug,
      instructorName: data.name,
    });
  };

  const imageUrl = getImageUrl(data?.image || data?.profileImage);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{t("course.about_instructor")}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.instructorImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.instructorImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="person" size={48} color={COLORS.darkWhite} />
            </View>
          )}
        </View>

        <View style={styles.instructorInfo}>
          <Text style={styles.instructorName}>{data?.name}</Text>
          <Text style={styles.bioText} numberOfLines={3}>
            {data?.bio || t("general.no_description")}
          </Text>

          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={handleViewProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.viewProfileText}>
              {t("courses.view_profile")}
            </Text>
            <Icon name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.backgroundColor,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  instructorImageContainer: {
    marginRight: 16,
    flexShrink: 0,
  },
  instructorImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.darkBlue,
  },
  placeholderImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.darkBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  instructorInfo: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    minWidth: 0,
  },
  instructorName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "left",
    flexWrap: "wrap",
    width: "100%",
  },
  bioText: {
    color: COLORS.darkWhite,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  viewProfileButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewProfileText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Instructor;
