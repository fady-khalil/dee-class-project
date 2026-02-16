import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { I18nText, I18nView } from "../../../components/common/I18nComponents";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";
import { GlobalStyle } from "../../../styles/GlobalStyle";
import BASE_URL from "../../../config/BASE_URL";

const { width } = Dimensions.get("window");

const InstructorHero = ({ data }) => {
  const handleOpenLink = (url) => {
    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            console.log(`Cannot open URL: ${url}`);
          }
        })
        .catch((err) => console.error("Error opening URL:", err));
    }
  };

  // Build full image URL - remove /api from BASE_URL for static files
  const getImageUrl = () => {
    const imagePath = data?.profileImage || data?.image;
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL.replace("/api", "")}/${imagePath}`;
  };

  const imageUrl = getImageUrl();

  if (!data) {
    return (
      <I18nView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading instructor data...</Text>
      </I18nView>
    );
  }

  return (
    <I18nView style={styles.container}>
      <View style={styles.content}>
        {/* Instructor Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl || "https://via.placeholder.com/130" }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Instructor Info */}
        <View style={styles.infoContainer}>
          <I18nText style={styles.name}>{data?.name}</I18nText>

          {data?.specialty && (
            <Text style={styles.specialty}>{data.specialty}</Text>
          )}

          <Text style={styles.bio}>
            {data?.bio || "No biography available."}
          </Text>

          {/* Social Media Icons */}
          {(data?.facebook || data?.instagram || data?.linkedin) && (
            <View style={styles.socialContainer}>
              {data?.facebook && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(data.facebook)}
                  activeOpacity={0.7}
                >
                  <Icon name="logo-facebook" size={22} color={COLORS.white} />
                </TouchableOpacity>
              )}

              {data?.instagram && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(data.instagram)}
                  activeOpacity={0.7}
                >
                  <Icon name="logo-instagram" size={22} color={COLORS.white} />
                </TouchableOpacity>
              )}

              {data?.linkedin && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(data.linkedin)}
                  activeOpacity={0.7}
                >
                  <Icon name="logo-linkedin" size={22} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </I18nView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...GlobalStyle.container,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    marginBottom: 0,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 250,
  },
  loadingText: {
    color: COLORS.darkWhite,
    fontSize: 16,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  imageContainer: {
    width: width < 380 ? 110 : 130,
    height: width < 380 ? 110 : 130,
    borderRadius: width < 380 ? 55 : 65,
    overflow: "hidden",
    marginBottom: SPACING.lg,
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    backgroundColor: COLORS.grey,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    alignItems: "center",
    width: "100%",
  },
  name: {
    fontSize: width < 380 ? 24 : 26,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 5,
    textAlign: "center",
  },
  specialty: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    fontWeight: "500",
  },
  bio: {
    fontSize: 15,
    color: COLORS.darkWhite,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 22,
    paddingHorizontal: width < 380 ? 0 : 5,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
    flexWrap: "wrap",
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.grey,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default InstructorHero;
