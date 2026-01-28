import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// A simple HTML tag stripper for descriptions
const stripHtmlTags = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");
};

// Dummy course data
const dummyCourses = [
  {
    id: "1",
    name: "Developing Leadership",
    description: "<p>Learn how to inspire and lead teams effectively.</p>",
    image: "https://via.placeholder.com/150",
    slug: "developing-leadership",
  },
  {
    id: "2",
    name: "Digital Marketing Basics",
    description: "<p>Discover essential strategies for online marketing.</p>",
    image: "https://via.placeholder.com/150",
    slug: "digital-marketing-basics",
  },
  {
    id: "3",
    name: "Introduction to Psychology",
    description: "<p>Understand the human mind and behavior.</p>",
    image: "https://via.placeholder.com/150",
    slug: "intro-psychology",
  },
  {
    id: "4",
    name: "Basics of Photography",
    description: "<p>Capture stunning images with your camera.</p>",
    image: "https://via.placeholder.com/150",
    slug: "basics-photography",
  },
  {
    id: "5",
    name: "Web Development 101",
    description: "<p>Build your first website from scratch.</p>",
    image: "https://via.placeholder.com/150",
    slug: "web-development-101",
  },
  {
    id: "6",
    name: "Finance for Beginners",
    description: "<p>Manage your money and investments wisely.</p>",
    image: "https://via.placeholder.com/150",
    slug: "finance-beginners",
  },
];

const PER_PAGE = 3;

const CourseListScreen = () => {
  const navigation = useNavigation();
  const [allCourses] = useState(dummyCourses);
  const [page, setPage] = useState(1);
  const [displayed, setDisplayed] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load initial courses
  useEffect(() => {
    const initial = allCourses.slice(0, PER_PAGE);
    setDisplayed(initial);
  }, [allCourses]);

  // Load more when page increases
  useEffect(() => {
    if (page === 1) return;
    const start = (page - 1) * PER_PAGE;
    const end = page * PER_PAGE;
    const nextItems = allCourses.slice(start, end);
    setDisplayed((prev) => [...prev, ...nextItems]);
    setLoadingMore(false);
  }, [page]);

  const handleLoadMore = () => {
    if (loadingMore) return;
    if (displayed.length >= allCourses.length) return;
    setLoadingMore(true);
    setPage((prev) => prev + 1);
  };

  const renderItem = ({ item }) => {
    const description = stripHtmlTags(item.description);
    return (
      <TouchableOpacity
        style={styles.courseRow}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("CourseDetail", { slug: item.slug })}
      >
        <Image source={{ uri: item.image }} style={styles.courseImage} />
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{item.name}</Text>
          <Text style={styles.courseDescription} numberOfLines={2}>
            {description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
        }
      />
    </SafeAreaView>
  );
};

export default CourseListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  listContainer: {
    paddingVertical: 16,
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: "cover",
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: "#666666",
  },
});
