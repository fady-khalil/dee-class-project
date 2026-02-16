import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { HeaderBack } from "../../components/navigation";
import { useDownload } from "../../context/Download/DownloadContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import COLORS from "../../styles/colors";
import SPACING from "../../styles/spacing";

const { width } = Dimensions.get("window");

const DownloadCoursesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    downloadedCourses,
    downloadQueue,
    currentDownload,
    downloadProgress,
    deleteCourse,
    getDaysRemaining,
  } = useDownload();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDeleteCourse = (course) => {
    Alert.alert(t("downloads.delete_title"), t("downloads.delete_message"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        onPress: () => deleteCourse(course),
        style: "destructive",
      },
    ]);
  };

  const handleCourseTap = (course) => {
    navigation.navigate("CourseDetail", {
      slug: course.slug,
      isCoursePurchased: true,
    });
  };

  const renderDownloadedCourse = ({ item }) => {
    const daysRemaining = getDaysRemaining(item.expiresAt);

    return (
      <TouchableOpacity
        style={styles.courseItem}
        onPress={() => handleCourseTap(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.courseImage}
          resizeMode="cover"
        />

        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.courseMetadata}>
            <View style={styles.metadataItem}>
              <Icon name="alarm" size={16} color={COLORS.white} />
              <Text style={styles.metadataText}>
                {daysRemaining === 0
                  ? t("downloads.expires_today")
                  : t("downloads.expires_days", { days: daysRemaining })}
              </Text>
            </View>

            <View style={styles.metadataItem}>
              <Icon name="movie" size={16} color={COLORS.white} />
              <Text style={styles.metadataText}>
                {item.downloadedFiles?.length || 0} {t("downloads.videos")}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCourse(item)}
        >
          <Icon name="delete" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderCurrentDownload = () => {
    if (!currentDownload) return null;

    // Calculate overall progress
    let totalProgress = 0;
    let itemCount = 0;

    for (const key in downloadProgress) {
      if (downloadProgress[key].courseId === currentDownload.id) {
        totalProgress += downloadProgress[key].progress;
        itemCount++;
      }
    }

    const overallProgress = itemCount > 0 ? totalProgress / itemCount : 0;

    return (
      <View style={styles.currentDownload}>
        <Text style={styles.sectionTitle}>{t("downloads.downloading")}</Text>

        <View style={styles.downloadItem}>
          <Image
            source={{ uri: currentDownload.image }}
            style={styles.downloadImage}
            resizeMode="cover"
          />

          <View style={styles.downloadInfo}>
            <Text style={styles.downloadTitle} numberOfLines={2}>
              {currentDownload.name}
            </Text>

            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${overallProgress * 100}%` },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              {`${Math.round(overallProgress * 100)}%`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQueuedDownloads = () => {
    if (downloadQueue.length === 0) return null;

    return (
      <View style={styles.queuedDownloads}>
        <Text style={styles.sectionTitle}>{t("downloads.queue")}</Text>

        {downloadQueue.map((course, index) => (
          <View style={styles.queueItem} key={`queue-${course.id}`}>
            <Image
              source={{ uri: course.image }}
              style={styles.queueImage}
              resizeMode="cover"
            />

            <View style={styles.queueInfo}>
              <Text style={styles.queueTitle} numberOfLines={2}>
                {course.name}
              </Text>
              <Text style={styles.queuePosition}>
                {t("downloads.queue_position", { position: index + 1 })}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (
      currentDownload ||
      downloadQueue.length > 0 ||
      downloadedCourses.length > 0
    ) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="cloud-download" size={64} color={COLORS.grey} />
        <Text style={styles.emptyText}>{t("downloads.empty_state")}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBack
        screenName={t("download")}
        onBack={() => navigation.goBack()}
        isBack={true}
      />

      <FlatList
        data={downloadedCourses}
        keyExtractor={(item) => `downloaded-${item.id}`}
        renderItem={renderDownloadedCourse}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {renderCurrentDownload()}
            {renderQueuedDownloads()}
            {downloadedCourses.length > 0 && (
              <Text style={styles.sectionTitle}>
                {t("downloads.your_downloads")}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={renderEmptyState()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  courseItem: {
    flexDirection: "row",
    backgroundColor: COLORS.black,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  },
  courseImage: {
    width: 120,
    height: 80,
  },
  courseInfo: {
    flex: 1,
    padding: SPACING.md,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  courseMetadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  metadataText: {
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 4,
  },
  deleteButton: {
    padding: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
  },
  currentDownload: {
    marginTop: SPACING.lg,
  },
  downloadItem: {
    flexDirection: "row",
    backgroundColor: COLORS.black,
    borderRadius: 12,
    overflow: "hidden",
  },
  downloadImage: {
    width: 120,
    height: 80,
  },
  downloadInfo: {
    flex: 1,
    padding: SPACING.md,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  progressContainer: {
    height: 8,
    backgroundColor: COLORS.grey,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.white,
    alignSelf: "flex-end",
  },
  queuedDownloads: {
    marginTop: SPACING.lg,
  },
  queueItem: {
    flexDirection: "row",
    backgroundColor: COLORS.black,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  queueImage: {
    width: 120,
    height: 80,
  },
  queueInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: "center",
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  queuePosition: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    marginTop: SPACING.lg,
    opacity: 0.7,
  },
});

export default DownloadCoursesScreen;
