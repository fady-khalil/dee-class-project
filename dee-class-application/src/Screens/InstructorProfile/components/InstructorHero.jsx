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
import { GlobalStyle } from "../../../styles/GlobalStyle";

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
            source={{ uri: data?.image || "https://via.placeholder.com/130" }}
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
          {data?.social_media_links && (
            <View style={styles.socialContainer}>
              {data.social_media_links.facebook && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() =>
                    handleOpenLink(data.social_media_links.facebook)
                  }
                  activeOpacity={0.7}
                >
                  <Icon name="logo-facebook" size={22} color={COLORS.white} />
                </TouchableOpacity>
              )}

              {data.social_media_links.instagram && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() =>
                    handleOpenLink(data.social_media_links.instagram)
                  }
                  activeOpacity={0.7}
                >
                  <Icon name="logo-instagram" size={22} color={COLORS.white} />
                </TouchableOpacity>
              )}

              {data.social_media_links.linkedin && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() =>
                    handleOpenLink(data.social_media_links.linkedin)
                  }
                  activeOpacity={0.7}
                >
                  <Icon name="logo-linkedin" size={22} color={COLORS.white} />
                </TouchableOpacity>
              )}

              {data.social_media_links.twitter && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() =>
                    handleOpenLink(data.social_media_links.twitter)
                  }
                  activeOpacity={0.7}
                >
                  <Icon name="logo-twitter" size={22} color={COLORS.white} />
                </TouchableOpacity>
              )}

              {data.social_media_links.youtube && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() =>
                    handleOpenLink(data.social_media_links.youtube)
                  }
                  activeOpacity={0.7}
                >
                  <Icon name="logo-youtube" size={22} color={COLORS.white} />
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
    paddingTop: 25,
    paddingBottom: 20,
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
    marginBottom: 20,
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
    marginBottom: 10,
    fontWeight: "500",
  },
  bio: {
    fontSize: 15,
    color: COLORS.darkWhite,
    textAlign: "center",
    marginBottom: 16,
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
    marginHorizontal: 8,
    marginBottom: 8,
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
