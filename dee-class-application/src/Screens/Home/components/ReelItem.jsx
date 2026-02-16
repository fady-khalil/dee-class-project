import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ApiVideoPlayer from "@api.video/react-native-player";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ReelItem = ({ video, isActive, onVideoEnd, height }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAction, setShowAction] = useState(false);
  // Add delayed rendering to prevent viewState error
  const [shouldRenderPlayer, setShouldRenderPlayer] = useState(false);
  const playerRef = useRef(null);
  const progressInterval = useRef(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const wasActiveRef = useRef(isActive);
  const isMountedRef = useRef(true);
  const renderTimeoutRef = useRef(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Extract the thumbnail URL from video assets
  const thumbnailUrl = video.assets?.thumbnail || null;
  const videoIdentifier = video._id || video.videoId;

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
    if (video.videoId) {
      // Clear any pending timeout
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }

      // Delay rendering
      renderTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShouldRenderPlayer(true);
        }
      }, 200);
    }

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [video.videoId]);

  // Log active state changes for debugging
  useEffect(() => {
    console.log(`Video ${videoIdentifier} - isActive: ${isActive}`);
    if (isActive) {
      console.log("This video should now be playing");
    }
  }, [isActive, videoIdentifier]);

  // Handle when component becomes active or inactive
  useEffect(() => {
    // Only handle if ready
    if (!isReady) return;

    clearProgressTracking();

    // Give a small delay to let the scrolling settle
    const timer = setTimeout(() => {
      if (isActive) {
        console.log(`Playing video ${videoIdentifier}`);
        if (playerRef.current) {
          playerRef.current.play && playerRef.current.play();
          startProgressTracking();
        }
      } else {
        console.log(`Pausing video ${videoIdentifier}`);
        if (playerRef.current) {
          playerRef.current.pause && playerRef.current.pause();

          // Reset video position when no longer active
          playerRef.current.seekTo && playerRef.current.seekTo(0);
          setProgress(0);
          progressAnimation.setValue(0);
        }
      }

      wasActiveRef.current = isActive;
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [isActive, isReady, videoIdentifier]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearProgressTracking();
    };
  }, []);

  // Start tracking video progress
  const startProgressTracking = () => {
    clearProgressTracking(); // Clear any existing interval

    progressInterval.current = setInterval(() => {
      if (!playerRef.current) return;

      try {
        const player = playerRef.current;

        // Get current time and duration
        const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
        const duration = player.getDuration ? player.getDuration() : 0;

        if (duration > 0) {
          const progressValue = currentTime / duration;
          setProgress(progressValue * 100);

          // Update animated value
          Animated.timing(progressAnimation, {
            toValue: progressValue,
            duration: 100,
            useNativeDriver: false,
          }).start();

          // Check if video ended
          if (currentTime >= duration - 0.2) {
            console.log("Video ended, triggering next");
            onVideoEnd && onVideoEnd();
          }
        }
      } catch (error) {
        console.log("Error updating progress:", error);
      }
    }, 200);
  };

  // Clear progress tracking interval
  const clearProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // Handle video ready
  const handleVideoReady = () => {
    console.log(`Video ${videoIdentifier} is ready. isActive: ${isActive}`);
    setIsReady(true);
    setIsLoading(false);

    // If active, start playing and tracking progress
    if (isActive) {
      console.log(`Starting to play video ${videoIdentifier} because it's active`);
      if (playerRef.current) {
        playerRef.current.play && playerRef.current.play();
        startProgressTracking();
      }
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setShowAction(true);
    setTimeout(() => setShowAction(false), 1500);
  };

  return (
    <View style={[styles.container, { height }]}>
      {!isReady && isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {!isReady && thumbnailUrl && (
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
      )}

      {shouldRenderPlayer && (
        <View style={[styles.playerContainer, !isReady && styles.hiddenPlayer]}>
          <ApiVideoPlayer
            ref={playerRef}
            videoId={video.videoId}
            onReady={handleVideoReady}
            resizeMode="cover"
            responsive={true}
            hideTitle={true}
            autoplay={isActive}
            onPlay={() => console.log(`Video ${videoIdentifier} started playing`)}
            onPause={() => console.log(`Video ${videoIdentifier} paused`)}
            onEnd={() => {
              console.log(`Video ${videoIdentifier} ended`);
              onVideoEnd && onVideoEnd();
            }}
            onError={(e) => {
              console.error(`[ReelItem] Player error for ${videoIdentifier}:`, e);
              // Handle viewState error gracefully
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
      )}

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* Overlay gradient */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Video info overlay - now using SafeAreaView for bottom content */}
      <SafeAreaView style={styles.infoWrapper} pointerEvents="box-none">
        <View style={styles.infoContainer}>
          {video.title && <Text style={styles.title}>{video.title}</Text>}
          {video.description && (
            <Text style={styles.description} numberOfLines={3}>
              {video.description}
            </Text>
          )}
        </View>
      </SafeAreaView>

      {/* Action buttons */}
      <SafeAreaView style={styles.actionsWrapper} pointerEvents="box-none">
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={28}
              color={isLiked ? COLORS.primary : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Like animation */}
      {showAction && (
        <Animated.View style={styles.likeAnimation}>
          <Ionicons name="heart" size={80} color={COLORS.primary} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
    backgroundColor: "#000",
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
  thumbnailContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: "#222",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  progressBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 20,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  infoWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  infoContainer: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: SPACING.sm,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: "#eee",
    fontSize: 14,
    marginBottom: SPACING.sm,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    color: "#ddd",
    fontSize: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actionsWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    zIndex: 3,
  },
  actionContainer: {
    paddingRight: SPACING.lg,
    paddingBottom: 40,
    alignItems: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  likeAnimation: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -40,
    marginTop: -40,
    zIndex: 10,
  },
});

export default ReelItem;
