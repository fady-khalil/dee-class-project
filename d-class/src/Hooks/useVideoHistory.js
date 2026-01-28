import { useContext, useEffect, useRef, useCallback } from "react";
import usePostDataNoLang from "./usePostDataNoLang";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import formatTime from "Utilities/formatTime";

/**
 * Hook to handle video history tracking (continue watching)
 * - Saves progress to API (no localStorage)
 * - For subscribers (active plan): tracks at PROFILE level
 * - For course purchasers (no plan): tracks at USER level
 */
const useVideoHistory = (courseSlug, videoId, totalDuration, isVideoDone = false) => {
  const { postData } = usePostDataNoLang();
  const { token, selectedUser, user, isAuthenticated } = useContext(LoginAuthContext);

  // Determine the correct ID to use
  const trackingId = isAuthenticated ? selectedUser?.id : (user?._id || user?.id);

  // Refs
  const timestampRef = useRef(0);
  const durationRef = useRef(0);
  const hasReached20PercentRef = useRef(false);
  const hasSavedToApiRef = useRef(false);
  const lastSaveTimeRef = useRef(0);
  const isVideoDoneRef = useRef(isVideoDone);

  // Store current values in refs for use in callbacks
  const trackingIdRef = useRef(trackingId);
  const videoIdRef = useRef(videoId);
  const courseSlugRef = useRef(courseSlug);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const tokenRef = useRef(token);

  // Update refs when values change
  useEffect(() => {
    trackingIdRef.current = trackingId;
    videoIdRef.current = videoId;
    courseSlugRef.current = courseSlug;
    isAuthenticatedRef.current = isAuthenticated;
    tokenRef.current = token;
    isVideoDoneRef.current = isVideoDone;
  }, [trackingId, videoId, courseSlug, isAuthenticated, token, isVideoDone]);

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
    hasSavedToApiRef.current = false;
    lastSaveTimeRef.current = 0;
  }, [videoId]);

  // Save to API
  const saveToApi = useCallback(async (forceUpdate = false) => {
    const tid = trackingIdRef.current;
    const vid = videoIdRef.current;
    const slug = courseSlugRef.current;
    const timestamp = timestampRef.current;
    const auth = isAuthenticatedRef.current;
    const tkn = tokenRef.current;

    // Don't save if video is already done - no need for continue watching
    if (isVideoDoneRef.current) {
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
        timestamp: timestamp,
      };

      await postData("profile-video-history", payload, tkn);
    } catch (error) {
      console.error("Error saving video history:", error);
    }
  }, [postData]);

  // Update current playback time
  const updateCurrentTime = useCallback((currentTime) => {
    if (!currentTime || isNaN(currentTime)) return;

    timestampRef.current = currentTime;

    // Check if reached 20% threshold
    const duration = durationRef.current;
    const threshold = duration * 0.2;

    if (duration > 0 && currentTime >= threshold && !hasReached20PercentRef.current) {
      hasReached20PercentRef.current = true;
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
      saveToApi(true);
    }
  }, [saveToApi]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Don't save if video is already done
      if (isVideoDoneRef.current) {
        return;
      }

      if (timestampRef.current > 5 && hasReached20PercentRef.current) {
        // Use sendBeacon for reliable save on page close
        const tid = trackingIdRef.current;
        const vid = videoIdRef.current;
        const slug = courseSlugRef.current;
        const auth = isAuthenticatedRef.current;
        const tkn = tokenRef.current;
        const timestamp = timestampRef.current;

        if (tid && vid && tkn) {
          const payload = {
            ...(auth ? { profile_id: tid } : { user_id: tid }),
            course_slug: slug,
            video_id: vid,
            time_slap: formatTime(timestamp),
            timestamp: timestamp,
          };

          // Try sendBeacon first (more reliable on page close)
          const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
          navigator.sendBeacon?.(`${process.env.REACT_APP_BASE_URL || ''}/api/profile-video-history`, blob);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return {
    updateCurrentTime,
    onExitVideo,
  };
};

export default useVideoHistory;
