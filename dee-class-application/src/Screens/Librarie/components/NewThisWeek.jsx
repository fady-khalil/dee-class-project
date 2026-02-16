import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";
import BASE_URL from "../../../config/BASE_URL";
import useFetch from "../../../Hooks/useFetch";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

const getServerUrl = () => BASE_URL.replace("/api", "");

const getThumbnail = (course) => {
  if (course?.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
  if (course?.thumbnail) return course.thumbnail;
  const img = course?.image || course?.mobileImage;
  if (img) return img.startsWith("http") ? img : `${getServerUrl()}/${img}`;
  return null;
};

const CinemaCard = ({ course }) => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("CourseDetail", { slug: course.slug })}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.cardWrapper}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        {!imageLoaded && <View style={styles.skeleton} />}
        <Image
          source={{ uri: getThumbnail(course) }}
          style={[styles.cardImage, !imageLoaded && styles.hiddenImage]}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />

        {/* NEW badge */}
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.95)"]}
          locations={[0.3, 0.6, 1]}
          style={styles.gradient}
        />

        {/* Bottom info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{course.name}</Text>
          {course.instructor?.name && (
            <Text style={styles.instructorName}>{course.instructor.name}</Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const NewThisWeek = () => {
  const { t } = useTranslation();
  const { data, fetchData } = useFetch();

  useEffect(() => {
    fetchData("courses/new-this-week");
  }, []);

  const courses = data?.data || [];
  if (!courses.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.fireIcon}>
          <Icon name="flame" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>{t("explore.new_this_week", "New This Week")}</Text>
      </View>
      <FlatList
        data={courses}
        renderItem={({ item }) => <CinemaCard course={item} />}
        keyExtractor={(item) => item._id || item.slug}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + SPACING.md}
        snapToAlignment="start"
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.xl },
  header: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  fireIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(237,26,77,0.15)",
    alignItems: "center", justifyContent: "center", marginRight: SPACING.md,
  },
  title: { color: COLORS.white, fontSize: 20, fontWeight: "bold" },
  listContent: {},
  cardWrapper: { marginRight: SPACING.md },
  card: {
    width: CARD_WIDTH, height: CARD_HEIGHT,
    borderRadius: 16, overflow: "hidden", backgroundColor: "#1c1c1c",
  },
  skeleton: { ...StyleSheet.absoluteFillObject, backgroundColor: "#2a2a2a" },
  cardImage: { width: "100%", height: "100%" },
  hiddenImage: { opacity: 0 },
  newBadge: {
    position: "absolute", top: SPACING.md, left: SPACING.md, zIndex: 10,
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  newBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  gradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60%" },
  cardInfo: { position: "absolute", bottom: 0, left: 0, right: 0, padding: SPACING.lg },
  cardTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  instructorName: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: SPACING.xs },
});

export default NewThisWeek;
