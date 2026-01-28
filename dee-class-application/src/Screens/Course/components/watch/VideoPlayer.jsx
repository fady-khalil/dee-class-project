import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Video } from "expo-av";
import COLORS from "../../../../styles/colors";
import ApiVideoPlayer from "@api.video/react-native-player";
import useVideoProgress from "../../../../Hooks/useVideoProgress";
import useVideoHistory from "../../../../Hooks/useVideoHistory";

/**
 * VideoPlayer component
 * - Shows resume modal based on video_progress from API
 * - Tracks progress and marks videos as done via API
 * - Matches d-class website implementation
 */
const VideoPlayer = ({
  videoData,           // Full course data (for thumbnail fallback)
  videoId,             // The video ID to play
  courseId,            // Course ID for tracking
  courseSlug,          // Course slug for history
  videoProgress,       // { timestamp, timeSlap } from API - for resume modal
  initialIsDone,       // boolean from API - if video is already done
  onVideoCompleted,    // Callback when video marked as done
  isOfflineMode = false,
  localUri = null,     // Local URI for offline playback
  thumbnail = null,    // Video thumbnail URL
}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(videoId);

  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const durationRef = useRef(0);
  const currentTimeRef = useRef(0);
  const hasCheckedProgressRef = useRef(false);
  const lastVideoIdRef = useRef(null);
  const isMountedRef = useRef(true);

  // Use our progress tracking hook (for marking videos as done at 75%)
  const { updateProgress, isVideoDone } = useVideoProgress(courseId, videoId, initialIsDone);

  // Use our video history hook (for continue watching)
  const { updateCurrentTime, onExitVideo, formatTime } = useVideoHistory(
    courseSlug,
    videoId,
    duration,
    isVideoDone || initialIsDone
  );

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update currentVideoId when videoId prop changes
  useEffect(() => {
    if (videoId && videoId !== currentVideoId) {
      setCurrentVideoId(videoId);
    }
  }, [videoId, currentVideoId]);

  // Notify parent when video is marked as done
  useEffect(() => {
    if (isVideoDone && onVideoCompleted && isMountedRef.current) {
      onVideoCompleted(videoId);
    }
  }, [isVideoDone, videoId, onVideoCompleted]);

  // Reset state when video changes
  useEffect(() => {
    const isVideoChange = lastVideoIdRef.current !== null && lastVideoIdRef.current !== videoId;

    if (isVideoChange) {
      // Save progress for previous video (with safety check)
      if (typeof onExitVideo === 'function') {
        try {
          onExitVideo();
        } catch (e) {
          console.warn("[VideoPlayer] Error saving progress:", e);
        }
      }

      // Reset state for new video
      if (isMountedRef.current) {
        setShowResumePrompt(false);
        setSavedProgress(null);
        hasCheckedProgressRef.current = false;
        durationRef.current = 0;
        currentTimeRef.current = 0;
      }
    }

    if (isMountedRef.current) {
      setLoading(true);
      setIsReady(false);
    }

    lastVideoIdRef.current = videoId;
  }, [videoId, onExitVideo]);

  // Check for saved progress from API when video loads
  useEffect(() => {
    if (!videoId) return;
    if (hasCheckedProgressRef.current) return;
    if (initialIsDone) {
      // Don't show resume for completed videos
      hasCheckedProgressRef.current = true;
      return;
    }

    console.log("[VideoPlayer] Checking resume progress:", videoProgress);

    // Use video_progress from API (passed as prop)
    if (videoProgress && videoProgress.timestamp && videoProgress.timestamp > 5) {
      console.log("[VideoPlayer] Setting resume prompt with timestamp:", videoProgress.timestamp);
      setSavedProgress({
        timestamp: videoProgress.timestamp,
        timeSlap: videoProgress.timeSlap || formatTime(videoProgress.timestamp),
      });
      setShowResumePrompt(true);
    }

    hasCheckedProgressRef.current = true;
  }, [videoId, videoProgress, initialIsDone, formatTime]);

  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (typeof onExitVideo === 'function') {
        try {
          onExitVideo();
        } catch (e) {
          console.warn("[VideoPlayer] Error saving progress on unmount:", e);
        }
      }
    };
  }, [onExitVideo]);

  // Handle resume - seek to saved position
  const handleResume = useCallback(() => {
    setShowResumePrompt(false);
    if (savedProgress?.timestamp && isMountedRef.current) {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        try {
          if (playerRef.current && typeof playerRef.current.seek === 'function') {
            playerRef.current.seek(savedProgress.timestamp);
          }
          if (videoRef.current && typeof videoRef.current.setPositionAsync === 'function') {
            videoRef.current.setPositionAsync(savedProgress.timestamp * 1000);
          }
        } catch (e) {
          console.error("[VideoPlayer] Error seeking:", e);
        }
      }, 500);
    }
  }, [savedProgress]);

  // Handle start from beginning
  const handleStartOver = useCallback(() => {
    if (isMountedRef.current) {
      setShowResumePrompt(false);
      setSavedProgress(null);
    }
  }, []);

  // Handle when player is ready
  const handleReady = useCallback(() => {
    if (isMountedRef.current) {
      setIsReady(true);
      setLoading(false);
    }
  }, []);

  // Handle when duration changes (API Video)
  const handleDurationChange = useCallback((newDuration) => {
    if (newDuration > 0 && isMountedRef.current) {
      setDuration(newDuration);
      durationRef.current = newDuration;
    }
  }, []);

  // Handle time update (API Video)
  const handleTimeUpdate = useCallback((currentTime) => {
    currentTimeRef.current = currentTime;
    updateCurrentTime(currentTime);

    const videoDuration = durationRef.current;
    if (videoDuration > 0) {
      const percentComplete = Math.floor((currentTime / videoDuration) * 100);
      if (percentComplete > 0) {
        updateProgress(percentComplete);
      }
    }
  }, [updateCurrentTime, updateProgress]);

  // Handle offline video ready
  const handleOfflineVideoReady = useCallback((status) => {
    if (!isMountedRef.current) return;
    setIsReady(true);
    setLoading(false);
    if (status?.durationMillis) {
      const durationSeconds = status.durationMillis / 1000;
      setDuration(durationSeconds);
      durationRef.current = durationSeconds;
    }
  }, []);

  // Handle offline video progress
  const handleOfflineVideoProgress = useCallback((status) => {
    if (!status || !status.isPlaying || !isMountedRef.current) return;

    if (status.durationMillis > 0 && status.positionMillis > 0) {
      const durationSecs = status.durationMillis / 1000;
      const currentTimeSecs = status.positionMillis / 1000;

      durationRef.current = durationSecs;
      currentTimeRef.current = currentTimeSecs;

      updateCurrentTime(currentTimeSecs);

      const percent = Math.floor((currentTimeSecs / durationSecs) * 100);
      if (percent > 0) {
        updateProgress(percent);
      }
    }
  }, [updateCurrentTime, updateProgress]);

  // Handle fullscreen changes
  const handleFullScreenChange = useCallback((isInFullScreen) => {
    if (isInFullScreen) {
      StatusBar.setHidden(true);
    } else {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        StatusBar.setHidden(false);
        StatusBar.setBackgroundColor(COLORS.backgroundColor || "#000000");
        StatusBar.setBarStyle("light-content");
      }, 300);
    }
  }, []);

  // Get thumbnail URL
  const thumbnailUrl = thumbnail ||
    videoData?.trailer?.assets?.thumbnail ||
    videoData?.api_video_object?.assets?.thumbnail ||
    videoData?.thumbnail;

  // Determine what to render
  const hasValidOfflineVideo = isOfflineMode && localUri;
  const hasValidOnlineVideo = !isOfflineMode && videoId;

  if (!videoId && !localUri) {
    return (
      <View style={styles.container}>
        <View style={styles.noVideoContainer}>
          <Text style={styles.noVideoText}>
            {t("general.no_video_available")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Resume Modal */}
      <Modal
        visible={showResumePrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={handleStartOver}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("video.resume_watching") || "Resume Watching?"}
            </Text>
            <Text style={styles.modalMessage}>
              {t("video.resume_message", { time: savedProgress?.timeSlap }) ||
                `You stopped at ${savedProgress?.timeSlap}. Would you like to continue?`}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.startOverButton]}
                onPress={handleStartOver}
              >
                <Text style={styles.startOverButtonText}>
                  {t("video.start_over") || "Start Over"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.continueButton]}
                onPress={handleResume}
              >
                <Text style={styles.continueButtonText}>
                  {t("video.continue") || "Continue"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.videoContainer}>
        {/* Thumbnail while loading */}
        {loading && thumbnailUrl && (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          </View>
        )}

        {/* Offline Video Player */}
        {hasValidOfflineVideo && (
          <Video
            key={`offline-${localUri}`}
            ref={videoRef}
            source={{ uri: localUri }}
            style={[styles.player, loading && styles.hidden]}
            useNativeControls
            resizeMode="contain"
            isLooping={false}
            onReadyForDisplay={() => isMountedRef.current && setLoading(false)}
            onPlaybackStatusUpdate={handleOfflineVideoProgress}
            onLoad={handleOfflineVideoReady}
            onError={(e) => console.error("[VideoPlayer] Offline error:", e)}
          />
        )}

        {/* Online Video Player (API Video) */}
        {hasValidOnlineVideo && currentVideoId && (
          <View
            key={`player-container-${currentVideoId}`}
            style={[styles.playerContainer, loading && styles.hidden]}
          >
            <ApiVideoPlayer
              key={`api-player-${currentVideoId}`}
              videoId={currentVideoId}
              onReady={handleReady}
              onDurationChange={handleDurationChange}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => isMountedRef.current && updateProgress(100)}
              onError={(e) => console.error("[VideoPlayer] Online error:", e)}
              ref={playerRef}
              responsive
              resizeMode="cover"
              onFullScreenChange={handleFullScreenChange}
              style={styles.player}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.black,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  playerContainer: {
    width: "100%",
    height: "100%",
  },
  player: {
    width: "100%",
    height: "100%",
  },
  hidden: {
    opacity: 0,
    position: "absolute",
  },
  thumbnailContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.black,
  },
  noVideoText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  // Resume Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.grey,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    maxWidth: 340,
    width: "100%",
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  modalMessage: {
    color: COLORS.darkWhite,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  startOverButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.darkWhite,
    marginRight: 8,
  },
  startOverButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default VideoPlayer;
