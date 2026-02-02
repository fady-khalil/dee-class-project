import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  Share,
  Alert,
  Clipboard,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Video } from "expo-av";
import LessonCompletedBadge from "../../../../components/common/LessonCompletedBadge";
import COLORS from "../../../../styles/colors";
import { LoginAuthContext } from "../../../../context/Authentication/LoginAuth";
import { usePostData } from "../../../../Hooks/usePostData";
import ActionButtons from "../purchase/ActionButtons";
import PurchaseModal from "../purchase/PurchaseModal";
import ApiVideoPlayer from "@api.video/react-native-player";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetwork } from "../../../../context/Network";
import { useDownload } from "../../../../context/Download/DownloadContext";

const { width, height } = Dimensions.get("window");

// Helper function to strip HTML tags
const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const TrailerVideo = ({
  data,
  videoId,
  trailerData,
  navigation,
  isCoursePurchased,
  isOfflineMode,
}) => {
  const { t } = useTranslation();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isCourseInMyList, setIsCourseInMyList] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [localVideoUri, setLocalVideoUri] = useState(null);
  // Add delayed rendering to prevent viewState error
  const [shouldRenderPlayer, setShouldRenderPlayer] = useState(false);
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const isMountedRef = useRef(true);
  const renderTimeoutRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetwork();
  const { getCourseDownloadInfo } = useDownload();

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  // Delay rendering the player to prevent viewState error
  useEffect(() => {
    if (videoId && !isOfflineMode) {
      setShouldRenderPlayer(false);
      renderTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShouldRenderPlayer(true);
        }
      }, 300);
    } else if (isOfflineMode || localVideoUri) {
      setShouldRenderPlayer(true);
    }

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [videoId, isOfflineMode, localVideoUri]);

  // Context and hooks
  const auth = useContext(LoginAuthContext);
  const token = auth ? auth.token : null;
  const selectedUser = auth ? auth.user : null;
  const isAuthenticated = auth ? auth.isAuthenticated : false;

  const { postData: addToPlaylist, isLoading: isAddLoading } = usePostData();
  const { postData: fetchMyList, isLoading: myListLoading } = usePostData();

  // Check for offline video file
  useEffect(() => {
    if (isOfflineMode && data?.id) {
      const downloadInfo = getCourseDownloadInfo(data.id);

      if (downloadInfo) {
        // Find trailer video in downloaded files
        const trailerFile = downloadInfo.downloadedFiles.find(
          (file) => file.type === "trailer"
        );

        if (trailerFile && trailerFile.localPath) {
          console.log("Using local trailer video:", trailerFile.localPath);
          setLocalVideoUri(trailerFile.localPath);
          setIsReady(true);
        }
      }
    }
  }, [isOfflineMode, data?.id]);

  // Simple fullscreen handler
  const handleFullScreenChange = (isInFullScreen) => {
    setIsFullScreen(isInFullScreen);

    if (isInFullScreen) {
      StatusBar.setHidden(true);
    } else {
      // When exiting fullscreen, ensure proper StatusBar appearance
      setTimeout(() => {
        StatusBar.setHidden(false);
        StatusBar.setBackgroundColor(COLORS.backgroundColor || "#000000");
        StatusBar.setBarStyle("light-content");
      }, 300);
    }
  };

  // Listen for dimension changes (rotation)
  useEffect(() => {
    const dimensionsChangeHandler = ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    };

    // Add event listener
    const subscription = Dimensions.addEventListener(
      "change",
      dimensionsChangeHandler
    );

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  // Setup StatusBar on mount
  useEffect(() => {
    // Set initial StatusBar
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor(COLORS.backgroundColor || "#000000");

    return () => {
      // Make sure StatusBar is visible when unmounting
      StatusBar.setHidden(false);
    };
  }, []);

  // Extract the thumbnail URL - support both field names
  const thumbnailUrl = trailerData?.assets?.thumbnail ||
    data?.trailer_with_api_video_object?.assets?.thumbnail ||
    data?.trailer?.assets?.thumbnail;

  // Handle video ready
  const handleVideoReady = () => {
    setIsReady(true);
  };

  // Share course
  const handleShare = async () => {
    if (!isConnected) {
      Alert.alert(
        t("navigation.offline_status"),
        t("courses.share_not_available_offline")
      );
      return;
    }

    try {
      const shareText = `${t("courses.check_out")}: ${data?.name}`;
      await Share.share({
        message: shareText,
        title: data?.name,
      });
    } catch (error) {
      // If sharing not available, copy to clipboard
      try {
        await Clipboard.setString(data?.name);
        Alert.alert(t("course.link_copied"));
      } catch (clipboardError) {
        Alert.alert(t("course.share_not_supported"));
      }
    }
  };

  // Get user's course list
  const getMyList = async () => {
    if (!selectedUser?.id || !token || !isConnected) return;

    try {
      const body = {
        profile_id: selectedUser.id,
      };
      const response = await fetchMyList("profile-list", body, token);

      if (response?.data?.length > 0) {
        const found = response.data.some((item) => item?.slug === data?.slug);
        setIsCourseInMyList(found);
      } else if (response?.message === "Unauthenticated.") {
        // Handle unauthenticated error
        setAuthError("Unauthenticated.");
      }
    } catch (error) {
      console.log("Error fetching my list:", error);
      // Check for auth error but don't interrupt the UI flow
      if (
        error?.message === "Unauthenticated." ||
        error?.response?.data?.message === "Unauthenticated."
      ) {
        setAuthError("Unauthenticated.");
      }
    }
  };

  // Handle add to playlist
  const handleAddToPlaylist = async () => {
    if (!isConnected) {
      Alert.alert(
        t("navigation.offline_status"),
        t("courses.feature_not_available_offline")
      );
      return;
    }

    if (isCourseInMyList && navigation) {
      // Navigate to Main (which contains the bottom tabs) and then to MyProgress tab
      navigation.navigate("Main", { screen: "MyProgress" });
      return;
    }

    if (!isAuthenticated && !isCoursePurchased) {
      // Show purchase modal if not authenticated and not purchased
      setShowPurchaseModal(true);
      return;
    }

    if (!selectedUser?.id || !token) return;

    try {
      const body = {
        profile_id: selectedUser.id,
        course_slug: data?.slug,
      };
      const response = await addToPlaylist("add-profile-list", body, token);

      if (response?.success) {
        setIsCourseInMyList(true);
      } else if (response?.message === "Unauthenticated.") {
        // Handle unauthenticated error
        setAuthError("Unauthenticated.");
      }
    } catch (error) {
      console.log("Error adding to playlist:", error);
      if (
        error?.message === "Unauthenticated." ||
        error?.response?.data?.message === "Unauthenticated."
      ) {
        setAuthError("Unauthenticated.");
      }
    }
  };

  // Handle open course
  const handleOpenCourseClick = () => {
    if (isAuthenticated || isCoursePurchased || isOfflineMode) {
      navigation.navigate("CourseContent", {
        slug: data?.slug,
        isCoursePurchased: isCoursePurchased || isOfflineMode, // Consider offline mode as purchased for access
        isOfflineMode: isOfflineMode, // Explicitly pass the offline mode flag
      });
    } else {
      if (!isConnected) {
        Alert.alert(
          t("navigation.offline_status"),
          t("downloads.purchase_not_available_offline")
        );
        return;
      }
      setShowPurchaseModal(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated && selectedUser?.id && isConnected) {
      getMyList();
    }
  }, [isAuthenticated, selectedUser, isConnected]);

  const descriptionText = data?.description
    ? stripHtml(data.description)
    : t("general.no_description");

  // Check if we have trailer data available (support both field names)
  // Need either a valid videoId for online playback or localVideoUri for offline
  const hasTrailerData = videoId || localVideoUri;

  // Get a fallback thumbnail from course image if no trailer thumbnail
  const fallbackThumbnail = thumbnailUrl || data?.thumbnail || data?.image;

  return (
    <SafeAreaView style={styles.container}>
      {/* Video/Thumbnail Section */}
      <View style={styles.videoContainer}>
        {hasTrailerData ? (
          <>
            {!isReady && thumbnailUrl && !localVideoUri && (
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: thumbnailUrl }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              </View>
            )}

            {localVideoUri ? (
              // Use Expo Video player for offline videos
              <Video
                ref={videoRef}
                source={{ uri: localVideoUri }}
                style={styles.player}
                useNativeControls
                resizeMode="contain"
                isLooping={false}
                onReadyForDisplay={handleVideoReady}
              />
            ) : videoId && !isOfflineMode && shouldRenderPlayer ? (
              // Use API Video player for online videos (with delayed rendering)
              <View
                style={[
                  styles.playerContainer,
                  !isReady && styles.hiddenPlayer,
                ]}
              >
                <ApiVideoPlayer
                  videoId={videoId}
                  onReady={handleVideoReady}
                  ref={playerRef}
                  responsive
                  resizeMode="cover"
                  onFullScreenChange={handleFullScreenChange}
                  autoplay={false}
                  onError={(e) => {
                    console.error("[TrailerVideo] Player error:", e);
                    // Handle viewState error gracefully by re-rendering
                    if (e?.message?.includes('viewState') || e?.message?.includes('Surface stopped')) {
                      if (isMountedRef.current) {
                        setShouldRenderPlayer(false);
                        setTimeout(() => {
                          if (isMountedRef.current) {
                            setShouldRenderPlayer(true);
                          }
                        }, 500);
                      }
                    }
                  }}
                />
              </View>
            ) : null}
          </>
        ) : (
          // Show course thumbnail or placeholder when no trailer
          <View style={styles.thumbnailContainer}>
            {fallbackThumbnail ? (
              <Image
                source={{ uri: fallbackThumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  {t("general.no_video_available")}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Course Info - Always show */}
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{data?.name}</Text>
        <Text style={styles.courseDescription}>{descriptionText}</Text>
      </View>

      {/* Badges */}
      {data?.is_done && (
        <LessonCompletedBadge
          variant="text"
          size="medium"
          style={styles.courseCompletedBadge}
        />
      )}
      {isOfflineMode && (
        <View style={[styles.badgeContainer, styles.offlineBadge]}>
          <Text style={styles.badgeText}>{t("downloads.downloaded")}</Text>
        </View>
      )}

      {/* Action Buttons - Always show */}
      <View style={styles.actionsContainer}>
        <ActionButtons
          handleOpenCourseClick={handleOpenCourseClick}
          handleAddToPlaylist={handleAddToPlaylist}
          handleShare={handleShare}
          isLoading={isAddLoading}
          myListLoading={myListLoading}
          isCourseInMyList={isCourseInMyList}
          navigation={navigation}
          authError={authError}
          data={data}
          setAuthError={setAuthError}
          isPurchased={isCoursePurchased}
          isOfflineMode={isOfflineMode}
        />
      </View>

      {!isOfflineMode && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          data={data}
          isLoading={isAddLoading}
          navigation={navigation}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: COLORS.backgroundColor || "#000000",
  },
  videoContainer: {
    width: "100%",
    height: width * 0.56, // 16:9 aspect ratio
    position: "relative",
  },
  thumbnailContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: COLORS.grey,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playerContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  hiddenPlayer: {
    zIndex: 0,
  },
  player: {
    width: "100%",
    height: "100%",
  },
  courseInfo: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  descriptionContainer: {
    maxHeight: 120, // Limit height to prevent taking too much space
  },
  courseDescription: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "left",
  },
  actionsContainer: {
    width: "100%",
  },
  fallbackContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.grey,
  },
  fallbackText: {
    color: COLORS.white,
    fontSize: 16,
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.grey,
  },
  placeholderText: {
    color: COLORS.darkWhite,
    fontSize: 14,
  },
  badgeContainer: {
    backgroundColor: COLORS.primary,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  offlineBadge: {
    backgroundColor: COLORS.grey,
    marginTop: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  courseCompletedBadge: {
    alignSelf: "center",
    marginBottom: 12,
  },
});

export default TrailerVideo;
