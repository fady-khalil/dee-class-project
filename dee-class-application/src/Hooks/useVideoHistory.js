import { useContext, useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import { usePostData } from "./usePostData";
import { LoginAuthContext } from "../context/Authentication/LoginAuth";
import { useNetwork } from "../context/Network";

/**
 * Format time as MM:SS (like website)
 */
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Hook to handle video history tracking (continue watching)
 * - Saves progress to API (no localStorage)
 * - For subscribers (active plan): tracks at PROFILE level
 * - For course purchasers (no plan): tracks at USER level
 * - Matches d-class website implementation
 */
const useVideoHistory = (courseSlug, videoId, totalDuration, isVideoDone = false) => {
  const { postData } = usePostData();
  const { token, selectedUser, user, isAuthenticated } = useContext(LoginAuthContext);
  const { isConnected } = useNetwork();

  // Determine the correct ID to use
  const trackingId = isAuthenticated ? selectedUser?.id : (user?._id || user?.id);

  // Refs
  const timestampRef = useRef(0);
  const durationRef = useRef(0);
  const hasReached20PercentRef = useRef(false);
  const lastSaveTimeRef = useRef(0);
  const isVideoDoneRef = useRef(isVideoDone);
  const isMountedRef = useRef(true);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Store current values in refs for use in callbacks
  const trackingIdRef = useRef(trackingId);
  const videoIdRef = useRef(videoId);
  const courseSlugRef = useRef(courseSlug);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const tokenRef = useRef(token);
  const isConnectedRef = useRef(isConnected);

  // Update refs when values change
  useEffect(() => {
    trackingIdRef.current = trackingId;
    videoIdRef.current = videoId;
    courseSlugRef.current = courseSlug;
    isAuthenticatedRef.current = isAuthenticated;
    tokenRef.current = token;
    isVideoDoneRef.current = isVideoDone;
    isConnectedRef.current = isConnected;
  }, [trackingId, videoId, courseSlug, isAuthenticated, token, isVideoDone, isConnected]);

  // Parse duration
  useEffect(() => {
    const d = parseFloat(totalDuration);
    if (!isNaN(d) && d > 0) {
      durationRef.current = d;
    }
  }, [totalDuration]);

  // Reset state when video changes
  useEffect(() => {
    timestampRef.current = 0;
    hasReached20PercentRef.current = false;
    lastSaveTimeRef.current = 0;
  }, [videoId]);

  // Save to API
  const saveToApi = useCallback(async (forceUpdate = false) => {
    // Skip if component is unmounted (unless forcing on unmount)
    if (!isMountedRef.current && !forceUpdate) {
      return;
    }

    const tid = trackingIdRef.current;
    const vid = videoIdRef.current;
    const slug = courseSlugRef.current;
    const timestamp = timestampRef.current;
    const auth = isAuthenticatedRef.current;
    const tkn = tokenRef.current;
    const connected = isConnectedRef.current;

    // Don't save if video is already done - no need for continue watching
    if (isVideoDoneRef.current) {
      return;
    }

    // Don't save if offline
    if (!connected) {
      return;
    }

    // Only save if we have required data and meaningful progress
    if (!tid || !vid || !tkn || timestamp <= 5) {
      return;
    }

    // Throttle saves - only save every 10 seconds unless forced
    const now = Date.now();
    if (!forceUpdate && now - lastSaveTimeRef.current < 10000) {
      return;
    }

    // Only save after reaching 20% threshold (unless forced on exit)
    if (!forceUpdate && !hasReached20PercentRef.current) {
      return;
    }

    lastSaveTimeRef.current = now;

    try {
      const payload = {
        ...(auth ? { profile_id: tid } : { user_id: tid }),
        course_slug: slug,
        video_id: vid,
        time_slap: formatTime(timestamp),
        timestamp: Math.floor(timestamp),
      };

      console.log("[useVideoHistory] Saving progress:", payload);
      await postData("profile-video-history", payload, tkn);
    } catch (error) {
      console.error("[useVideoHistory] Error saving video history:", error);
    }
  }, [postData]);

  // Update current playback time
  const updateCurrentTime = useCallback((currentTime) => {
    if (!currentTime || isNaN(currentTime) || !isMountedRef.current) return;

    timestampRef.current = currentTime;

    // Check if reached 20% threshold
    const duration = durationRef.current;
    const threshold = duration * 0.2;

    if (duration > 0 && currentTime >= threshold && !hasReached20PercentRef.current) {
      hasReached20PercentRef.current = true;
      console.log("[useVideoHistory] 20% threshold reached, starting to save");
      // Save to API when threshold is reached
      saveToApi(false);
    }

    // Periodic save (throttled inside saveToApi)
    if (hasReached20PercentRef.current && currentTime > 5) {
      saveToApi(false);
    }
  }, [saveToApi]);

  // Handle exit event - force save
  const onExitVideo = useCallback(() => {
    if (timestampRef.current > 5) {
      console.log("[useVideoHistory] Forcing save on exit");
      saveToApi(true);
    }
  }, [saveToApi]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // Save when app goes to background
        if (timestampRef.current > 5 && hasReached20PercentRef.current) {
          saveToApi(true);
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      if (subscription && typeof subscription.remove === "function") {
        subscription.remove();
      }
    };
  }, [saveToApi]);

  return {
    updateCurrentTime,
    onExitVideo,
    formatTime,
  };
};

export default useVideoHistory;
