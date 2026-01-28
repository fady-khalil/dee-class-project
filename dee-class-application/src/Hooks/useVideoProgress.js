import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { usePostData } from "./usePostData";
import { LoginAuthContext } from "../context/Authentication/LoginAuth";

/**
 * Hook to handle video completion tracking
 * - Marks videos as done at 75% progress
 * - Uses API only (no localStorage)
 * - Matches d-class website implementation
 */
const useVideoProgress = (courseId, videoId, initialIsDone = false) => {
  const [isVideoDone, setIsVideoDone] = useState(initialIsDone);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const markingInProgressRef = useRef(false);
  const apiCallCompleted = useRef(initialIsDone);
  const isMountedRef = useRef(true);
  const { postData, isLoading, error } = usePostData();
  const { selectedUser, user, isAuthenticated, token } = useContext(LoginAuthContext);

  // Use consistent tracking ID logic (profile for subscribers, user for course purchasers)
  const trackingId = isAuthenticated ? selectedUser?.id : (user?._id || user?.id);

  // Store current videoId in a ref to avoid closure issues
  const currentVideoIdRef = useRef(videoId);
  const currentCourseIdRef = useRef(courseId);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update refs when props change
  useEffect(() => {
    currentVideoIdRef.current = videoId;
    currentCourseIdRef.current = courseId;
  }, [videoId, courseId]);

  // Function to mark video as done
  const markVideoAsDone = useCallback(async () => {
    // Use the current values from refs instead of closure
    const currentVideoId = currentVideoIdRef.current;
    const currentCourseId = currentCourseIdRef.current;

    // Return early if any of these conditions are true
    if (
      apiCallCompleted.current ||
      markingInProgressRef.current ||
      !currentVideoId ||
      !trackingId ||
      !currentCourseId ||
      !token
    ) {
      console.log("[useVideoProgress] markVideoAsDone skipped:", {
        apiCallCompleted: apiCallCompleted.current,
        markingInProgress: markingInProgressRef.current,
        videoId: currentVideoId,
        trackingId,
        courseId: currentCourseId,
        hasToken: !!token,
      });
      return false;
    }

    markingInProgressRef.current = true;

    try {
      const payload = {
        ...(isAuthenticated ? { profile_id: trackingId } : { user_id: trackingId }),
        course_id: currentCourseId,
        video_id: currentVideoId,
      };

      console.log("[useVideoProgress] Marking video as done:", payload);
      const response = await postData("videos-done", payload, token);

      if (response?.success && isMountedRef.current) {
        console.log("[useVideoProgress] Video marked as done successfully");
        setIsVideoDone(true);
        apiCallCompleted.current = true;
        return true;
      }
    } catch (error) {
      console.error("[useVideoProgress] Error marking video as done:", error);
    } finally {
      markingInProgressRef.current = false;
    }
    return false;
  }, [trackingId, token, isAuthenticated, postData]);

  // Function to update progress
  const updateProgress = useCallback((percent) => {
    if (!isMountedRef.current) return;

    setProgressPercentage(percent);

    // If progress reaches 75% and video has not been marked as done
    if (
      percent >= 75 &&
      !apiCallCompleted.current &&
      !markingInProgressRef.current
    ) {
      console.log("[useVideoProgress] 75% reached, marking as done");
      markVideoAsDone();
    }
  }, [markVideoAsDone]);

  // Reset state when video changes
  useEffect(() => {
    if (!isMountedRef.current) return;

    // Reset progress state for new video
    setProgressPercentage(0);
    markingInProgressRef.current = false;

    // Set initial done state based on prop
    if (initialIsDone) {
      setIsVideoDone(true);
      apiCallCompleted.current = true;
    } else {
      setIsVideoDone(false);
      apiCallCompleted.current = false;
    }
  }, [videoId, courseId, initialIsDone]);

  return {
    isVideoDone,
    setIsVideoDone,
    progressPercentage,
    updateProgress,
    markVideoAsDone,
    isLoading,
    error,
  };
};

export default useVideoProgress;
