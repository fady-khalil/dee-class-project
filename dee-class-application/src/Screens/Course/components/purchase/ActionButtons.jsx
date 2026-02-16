import React, { useContext, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import COLORS from "../../../../styles/colors";
import SPACING from "../../../../styles/spacing";
import { LoginAuthContext } from "../../../../context/Authentication/LoginAuth";
import { usePostData } from "../../../../Hooks/usePostData";
import AuthExpiredAlert from "../../../../components/common/AuthExpiredAlert";
import CommentsModal from "./CommentsModal";
import MembershipModal from "./MembershipModal";
import { useDownload } from "../../../../context/Download/DownloadContext";

const { width } = Dimensions.get("window");

const ActionButtons = ({
  handleOpenCourseClick,
  handleAddToPlaylist,
  handleShare,
  isLoading,
  myListLoading,
  isCourseInMyList,
  navigation,
  authError,
  data,
  setAuthError,
  isPurchased,
  isOfflineMode = false,
}) => {
  const { t } = useTranslation();
  const auth = useContext(LoginAuthContext);
  const isAuthenticated = auth ? auth.isAuthenticated : false;
  const token = auth ? auth.token : null;
  const selectedUser = auth ? auth.selectedUser : null;
  const canDownload = auth ? auth.canDownload : false;

  // Combined access check - user can watch if authenticated OR purchased
  const hasAccess = isAuthenticated || isPurchased || isOfflineMode;

  // Download state
  const {
    downloadCourse,
    isCourseDownloaded,
    downloadProgress,
    currentDownload,
  } = useDownload();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Like state
  const [isLiked, setIsLiked] = useState(
    data?.course_engagement?.is_like || false
  );
  const [likesCount, setLikesCount] = useState(
    data?.course_engagement?.like_count || 0
  );
  const [likeLoading, setLikeLoading] = useState(false);
  const { postData: postLikeData } = usePostData();

  // Comments state
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Membership modal state
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const [showAuthAlert, setShowAuthAlert] = useState(false);

  // Use ref to track the auth error
  const errorRef = useRef(null);

  // Check if the course is already downloaded
  useEffect(() => {
    if (data?.id) {
      setIsDownloaded(isCourseDownloaded(data.id));
    }
  }, [data?.id, isCourseDownloaded]);

  // Watch for active download of this course
  useEffect(() => {
    if (currentDownload && data?.id && currentDownload.id === data.id) {
      setIsDownloading(true);
    } else {
      setIsDownloading(false);
    }
  }, [currentDownload, data?.id]);

  // Watch for auth error changes
  React.useEffect(() => {
    if (authError && authError !== errorRef.current) {
      errorRef.current = authError;
      setShowAuthAlert(true);
    }
  }, [authError]);

  // Initialize like state when data changes
  React.useEffect(() => {
    if (data?.course_engagement) {
      setIsLiked(data.course_engagement.is_like || false);
      setLikesCount(data.course_engagement.like_count || 0);
    }
  }, [data?.course_engagement]);

  // Handle download button press
  const handleDownloadPress = async () => {
    // canDownload check is already done via button visibility, but double-check
    if (!canDownload) {
      return;
    }

    if (!isDownloaded && !isDownloading && data) {
      const result = await downloadCourse(data);
      if (result) {
        setIsDownloading(true);
      }
    } else if (isDownloaded) {
      // Navigate to downloads screen to manage downloaded courses
      navigation.navigate("Downloads");
    }
  };

  // Handle like functionality
  const handleLike = async () => {
    if (!hasAccess) {
      // Show purchase modal if no access
      handleOpenCourseClick();
      return;
    }

    if (!isAuthenticated) {
      // Show membership modal if purchased but not authenticated (need profile for like)
      setShowMembershipModal(true);
      return;
    }

    // Use the selected profile ID
    const profileId = selectedUser?.id || selectedUser?._id;
    if (!profileId || likeLoading) return;

    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));
    setLikeLoading(true);

    try {
      const body = {
        course_id: data?.id || data?._id,
        profile_id: profileId,
      };

      // Use like or unlike endpoint based on current state
      const endpoint = isLiked ? "unlike-course" : "like-course";
      const response = await postLikeData(endpoint, body, token);

      if (!response?.success) {
        // Revert the state if API call failed
        setIsLiked(!newLikedState);
        setLikesCount((prev) =>
          !newLikedState ? prev + 1 : Math.max(0, prev - 1)
        );

        if (response?.message === "Unauthenticated.") {
          setAuthError("Unauthenticated.");
        }
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount((prev) =>
        !newLikedState ? prev + 1 : Math.max(0, prev - 1)
      );

      if (
        error?.message === "Unauthenticated." ||
        error?.response?.data?.message === "Unauthenticated."
      ) {
        setAuthError("Unauthenticated.");
      }
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle comment button press
  const handleCommentPress = () => {
    if (!hasAccess) {
      // Show purchase modal if no access
      handleOpenCourseClick();
      return;
    }

    if (!isAuthenticated) {
      // Show membership modal if purchased but not authenticated (need profile for comments)
      setShowMembershipModal(true);
      return;
    }

    setShowCommentModal(true);
  };

  const handleMyListPress = () => {
    if (isCourseInMyList) {
      navigation.navigate("Main", { screen: "MyProgress" });
    } else {
      handleAddToPlaylist();
    }
  };

  const handleAuthError = (error) => {
    if (
      error?.message === "Unauthenticated." ||
      error?.response?.data?.message === "Unauthenticated."
    ) {
      setShowAuthAlert(true);
      return true;
    }
    return false;
  };

  const handleLoginRedirect = () => {
    if (auth && auth.logoutHandler) {
      auth.logoutHandler();
    }
    navigation.navigate("Login");
    setShowAuthAlert(false);
  };

  const handleCancel = () => {
    if (auth && auth.logoutHandler) {
      auth.logoutHandler();
    }
    navigation.navigate("Main");
    setShowAuthAlert(false);
  };

  const handleCommentAdded = (result) => {
    if (result?.success) {
      // We could update the parent component here if needed
      console.log("Comment added successfully");
    }
  };

  // Membership modal handlers
  const handleCloseMembershipModal = () => {
    setShowMembershipModal(false);
  };

  const handleViewPlans = () => {
    setShowMembershipModal(false);
    navigation.navigate("Plans");
  };

  // Calculate download progress if downloading
  const getDownloadProgress = () => {
    if (!isDownloading || !data?.id || !downloadProgress) return 0;

    // Find progress values for this course
    const courseProgress = Object.values(downloadProgress).filter(
      (p) => p.courseId === data.id
    );

    if (courseProgress.length === 0) return 0;

    // Calculate average progress
    const totalProgress = courseProgress.reduce(
      (sum, item) => sum + item.progress,
      0
    );
    return Math.round((totalProgress / courseProgress.length) * 100);
  };

  return (
    <View style={styles.container}>
      {showAuthAlert && (
        <View style={styles.alertContainer}>
          <AuthExpiredAlert
            onLogin={handleLoginRedirect}
            onCancel={handleCancel}
          />
        </View>
      )}

      {/* Icon buttons row (Like, Comments, Share, My List) */}
      <View style={styles.iconButtonsRow}>
        {/* Download button - HIDDEN FOR NOW - TODO: implement native encryption for security */}
        {/* {canDownload && (
          <TouchableOpacity
            style={[styles.iconButton, isDownloaded && styles.downloadedButton]}
            onPress={handleDownloadPress}
            disabled={isDownloading && !isDownloaded}
            activeOpacity={0.7}
            accessibilityLabel={
              isDownloaded
                ? t("downloads.downloaded")
                : isDownloading
                ? t("downloads.downloading")
                : t("downloads.download")
            }
          >
            {isDownloading ? (
              <View style={styles.downloadingContainer}>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.progressText}>
                  {getDownloadProgress()}%
                </Text>
              </View>
            ) : (
              <Icon
                name={isDownloaded ? "download-done" : "download"}
                size={24}
                color={isDownloaded ? COLORS.primary : COLORS.white}
              />
            )}
          </TouchableOpacity>
        )} */}

        {/* Like Button */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            isLiked && styles.likedButton,
            isLiked && !isAuthenticated && styles.disabledButton,
          ]}
          onPress={handleLike}
          disabled={likeLoading}
          activeOpacity={0.7}
        >
          {likeLoading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <View style={styles.iconWithCount}>
              <Icon
                name={isLiked ? "favorite" : "favorite-outline"}
                size={24}
                color={isLiked ? COLORS.primary : COLORS.white}
              />
              {likesCount > 0 && (
                <Text style={styles.countText}>{likesCount}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Comments button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleCommentPress}
          activeOpacity={0.7}
          accessibilityLabel={t("courses.comments")}
        >
          <View style={styles.iconWithCount}>
            <Icon name="chat" size={24} color={COLORS.white} />
            {data?.course_engagement?.course_comments_count > 0 && (
              <Text style={styles.countText}>
                {data?.course_engagement?.course_comments_count}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Share button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleShare}
          activeOpacity={0.7}
          accessibilityLabel={t("common.share")}
        >
          <Icon name="share" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* My List button - only for authenticated users */}
        {isAuthenticated && (
          <TouchableOpacity
            style={[styles.iconButton, isCourseInMyList && styles.activeButton]}
            onPress={handleMyListPress}
            disabled={isLoading || myListLoading}
            activeOpacity={0.7}
            accessibilityLabel={
              isCourseInMyList
                ? t("courses.in_my_list")
                : t("courses.add_to_playlist")
            }
          >
            {myListLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Icon
                name={isCourseInMyList ? "bookmark" : "bookmark-border"}
                size={24}
                color={isCourseInMyList ? COLORS.primary : COLORS.white}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Comments Modal */}
      <CommentsModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        data={data}
        onCommentAdded={handleCommentAdded}
      />

      {/* Use the new MembershipModal component */}
      <MembershipModal
        visible={showMembershipModal}
        onClose={handleCloseMembershipModal}
        onViewPlans={handleViewPlans}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    paddingHorizontal: width < 350 ? SPACING.sm : SPACING.lg,
  },
  alertContainer: {
    marginBottom: SPACING.md,
  },
  iconButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: width < 350 ? SPACING.md : SPACING.lg,
  },
  iconButton: {
    backgroundColor: COLORS.grey,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  downloadedButton: {
    backgroundColor: COLORS.grey,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  activeButton: {
    backgroundColor: COLORS.grey,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  downloadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    color: COLORS.white,
    fontSize: 10,
    marginTop: 2,
  },
  likedButton: {
    opacity: 0.9,
  },
  disabledButton: {
    opacity: 0.5,
  },
  iconWithCount: {
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: COLORS.white,
    fontSize: 10,
    marginTop: 2,
  },
});

export default ActionButtons;
