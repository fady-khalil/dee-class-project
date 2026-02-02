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
  Platform,
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
  onProgressUpdate,    // Callback for progress updates (for loading indicator)
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
  const [currentVideoId, setCurrentVideoId] = useState(null); // Start as null
  // Add a delay state to prevent the "viewState" error
  const [shouldRenderPlayer, setShouldRenderPlayer] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  // Add a render key to force complete remount
  const [playerKey, setPlayerKey] = useState(0);

  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const durationRef = useRef(0);
  const currentTimeRef = useRef(0);
  const hasCheckedProgressRef = useRef(false);
  const lastVideoIdRef = useRef(null);
  const isMountedRef = useRef(true);
  const renderTimeoutRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const pendingVideoIdRef = useRef(null);

  // Use our progress tracking hook (for marking videos as done at 75%)
  const { updateProgress, isVideoDone, courseCompleted } = useVideoProgress(courseId, videoId, initialIsDone);

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
      // Clear any pending timeouts
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Delay rendering the player to prevent viewState error with debouncing
  useEffect(() => {
    const targetVideoId = videoId;

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Clear any existing render timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    if (targetVideoId && !isOfflineMode) {
      // Store pending video ID for debounce check
      pendingVideoIdRef.current = targetVideoId;

      // Immediately unmount the current player
      setShouldRenderPlayer(false);
      setPlayerError(null);
      setCurrentVideoId(null);
      setLoading(true);
      setIsReady(false);

      console.log(`[VideoPlayer] Debouncing video change to: ${targetVideoId}`);

      // Debounce the video change - wait for rapid changes to settle
      debounceTimeoutRef.current = setTimeout(() => {
        // Check if this is still the video we want to render
        if (!isMountedRef.current || pendingVideoIdRef.current !== targetVideoId) {
          console.log(`[VideoPlayer] Skipping ${targetVideoId}, pending is ${pendingVideoIdRef.current}`);
          return;
        }

        console.log(`[VideoPlayer] Setting up player for video: ${targetVideoId}`);

        // Increment player key to force complete remount
        setPlayerKey(prev => prev + 1);
        setCurrentVideoId(targetVideoId);

        // Wait for React to process the state changes before rendering player
        renderTimeoutRef.current = setTimeout(() => {
          // Final check before rendering
          if (isMountedRef.current && pendingVideoIdRef.current === targetVideoId) {
            console.log(`[VideoPlayer] Rendering player for video: ${targetVideoId}`);
            setShouldRenderPlayer(true);
          }
        }, 400); // Delay to ensure unmount is complete
      }, 300); // Debounce delay - wait for video selection to settle
    } else if (isOfflineMode) {
      setShouldRenderPlayer(true);
    } else if (!targetVideoId) {
      setShouldRenderPlayer(false);
      setCurrentVideoId(null);
      pendingVideoIdRef.current = null;
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [videoId, isOfflineMode]);

  // Notify parent when video is marked as done
  useEffect(() => {
    if (isVideoDone && onVideoCompleted && isMountedRef.current) {
      onVideoCompleted(videoId, courseCompleted);
    }
  }, [isVideoDone, videoId, onVideoCompleted, courseCompleted]);

  // Handle video change - save progress and reset state
  useEffect(() => {
    const isVideoChange = lastVideoIdRef.current !== null && lastVideoIdRef.current !== videoId;

    if (isVideoChange) {
      console.log(`[VideoPlayer] Video changed from ${lastVideoIdRef.current} to ${videoId}`);
      // Save progress for previous video (with safety check)
      if (typeof onExitVideo === 'function') {
        try {
          onExitVideo();
        } catch (e) {
          console.warn("[VideoPlayer] Error saving progress:", e);
        }
      }

      // Reset progress-related state for new video
      if (isMountedRef.current) {
        setShowResumePrompt(false);
        setSavedProgress(null);
        hasCheckedProgressRef.current = false;
        durationRef.current = 0;
        currentTimeRef.current = 0;
      }
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

  // Handle resume - seek to saved position and auto-play
  const handleResume = useCallback(() => {
    setShowResumePrompt(false);
    if (savedProgress?.timestamp && isMountedRef.current) {
      // Use longer timeout to ensure player is fully ready
      setTimeout(() => {
        if (!isMountedRef.current) return;
        try {
          // For ApiVideoPlayer (online) - play first, then seek
          if (playerRef.current) {
            console.log("[VideoPlayer] Resuming at:", savedProgress.timestamp);
            // Start playing first
            if (typeof playerRef.current.play === 'function') {
              playerRef.current.play();
            }
            // Then seek after video starts playing
            setTimeout(() => {
              if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                console.log("[VideoPlayer] Seeking to:", savedProgress.timestamp);
                playerRef.current.seekTo(savedProgress.timestamp);
              }
            }, 500);
          }
          // For Expo Video (offline)
          if (videoRef.current) {
            if (typeof videoRef.current.playAsync === 'function') {
              videoRef.current.playAsync().then(() => {
                if (videoRef.current && typeof videoRef.current.setPositionAsync === 'function') {
                  videoRef.current.setPositionAsync(savedProgress.timestamp * 1000);
                }
              });
            }
          }
        } catch (e) {
          console.error("[VideoPlayer] Error resuming:", e);
        }
      }, 800);
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
        // Notify parent of progress for loading indicator
        if (onProgressUpdate) {
          onProgressUpdate(videoId, percentComplete);
        }
      }
    }
  }, [updateCurrentTime, updateProgress, onProgressUpdate, videoId]);

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
        {hasValidOnlineVideo && currentVideoId && shouldRenderPlayer && !playerError && (
          <View
            key={`player-container-${playerKey}-${currentVideoId}`}
            style={[styles.playerContainer, loading && styles.hidden]}
          >
            <ApiVideoPlayer
              key={`api-player-${playerKey}-${currentVideoId}`}
              videoId={currentVideoId}
              onReady={handleReady}
              onDurationChange={handleDurationChange}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => isMountedRef.current && updateProgress(100)}
              onError={(e) => {
                console.error("[VideoPlayer] Online error:", e);
                // Handle the viewState error gracefully
                const errorMsg = e?.message || e?.toString() || '';
                if (errorMsg.includes('viewState') || errorMsg.includes('Surface stopped') || errorMsg.includes('tag')) {
                  console.log("[VideoPlayer] Caught viewState error, attempting recovery...");
                  if (isMountedRef.current) {
                    setPlayerError(e);
                    // Attempt to re-render the player after a delay
                    setTimeout(() => {
                      if (isMountedRef.current) {
                        setPlayerError(null);
                        setShouldRenderPlayer(false);
                        setPlayerKey(prev => prev + 1);
                        setTimeout(() => {
                          if (isMountedRef.current) {
                            setShouldRenderPlayer(true);
                          }
                        }, 500);
                      }
                    }, 500);
                  }
                }
              }}
              ref={playerRef}
              responsive
              resizeMode="cover"
              onFullScreenChange={handleFullScreenChange}
              style={styles.player}
              autoplay={false}
            />
          </View>
        )}

        {/* Show loading indicator while waiting to render player */}
        {hasValidOnlineVideo && !shouldRenderPlayer && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
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
