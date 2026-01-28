import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import COLORS from "../../../styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import BASE_URL from "../../../config/BASE_URL";

// Get server URL without /api for image paths
const getServerUrl = () => {
  return BASE_URL.replace("/api", "");
};

// Get thumbnail URL - prefer trailer thumbnail, fallback to course image
const getThumbnailUrl = (item) => {
  // First try trailer thumbnail (full URL from api.video)
  if (item?.trailer?.assets?.thumbnail) {
    return item.trailer.assets.thumbnail;
  }
  // Fallback to course image (relative path needs server URL)
  if (item?.image) {
    // If it's already a full URL, return as is
    if (item.image.startsWith("http")) {
      return item.image;
    }
    // Otherwise prepend server URL
    return `${getServerUrl()}/${item.image}`;
  }
  return null;
};

const CourseSlider = ({ title, data = [] }) => {
  const navigation = useNavigation();
  if (!data || data.length === 0) return null;

  const renderItem = ({ item }) => {
    const thumbnailUrl = getThumbnailUrl(item);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("CourseDetail", { slug: item.slug })}
        style={styles.courseCard}
      >
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View
              key={
                tag.id?.toString() ||
                `${item.id || item.course || ""}-tag-${index}`
              }
              style={[styles.tagPill, { backgroundColor: tag.color }]}
            >
              <Text style={[styles.tagText, { color: tag.text_color }]}>
                {tag.name}
              </Text>
            </View>
          ))}
        </View>
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
        locations={[0.5, 0.7, 1]}
        style={styles.gradient}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.courseTitle}>{item.name}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item._id?.toString() || item.id?.toString() || item.slug || item.name
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={320}
        snapToAlignment="start"
        disableIntervalMomentum={true}
        contentContainerStyle={styles.listContent}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        getItemLayout={(data, index) => ({
          length: 320,
          offset: 320 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginBottom: 48,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 4,
    marginTop: 10,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "start",
  },
  listContent: {
    paddingHorizontal: 4,
  },
  courseCard: {
    width: 300,
    marginRight: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: 350,
    borderRadius: 8,
  },
  tagsContainer: {
    position: "absolute",
    top: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    zIndex: 1,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  titleContainer: {
    padding: 16,
    paddingBottom: 12,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "90%",
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
    letterSpacing: 0.2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default CourseSlider;
