import { useState, useEffect, useContext, useRef, useMemo, useCallback } from "react";
import usePostData from "./usePostData";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";

/**
 * Hook to handle video completion tracking
 * - Marks videos as done at 75% progress
 * - Uses API only (no localStorage)
 */
const useVideoProgress = (courseId, videoId, initialIsDone = false) => {
  const [isVideoDone, setIsVideoDone] = useState(initialIsDone);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const markingInProgressRef = useRef(false);
  const apiCallCompleted = useRef(initialIsDone);
  const { postData, isLoading, isError } = usePostData();
  const { selectedUser, user, isAuthenticated, token } = useContext(LoginAuthContext);

  // Memoize trackingId to prevent recalculation on every render
  const trackingId = useMemo(() => {
    return isAuthenticated ? (selectedUser?._id || selectedUser?.id) : (user?._id || user?.id);
  }, [isAuthenticated, selectedUser?._id, selectedUser?.id, user?._id, user?.id]);

  // Store values in refs to avoid stale closures
  const trackingIdRef = useRef(trackingId);
  const tokenRef = useRef(token);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const currentVideoIdRef = useRef(videoId);
  const currentCourseIdRef = useRef(courseId);

  // Update refs when values change
  useEffect(() => {
    trackingIdRef.current = trackingId;
  }, [trackingId]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    currentVideoIdRef.current = videoId;
    currentCourseIdRef.current = courseId;
  }, [videoId, courseId]);

  // Function to mark video as done - use useCallback to prevent recreation
  const markVideoAsDone = useCallback(async () => {
    const currentVideoId = currentVideoIdRef.current;
    const currentCourseId = currentCourseIdRef.current;
    const currentTrackingId = trackingIdRef.current;
    const currentToken = tokenRef.current;
    const currentIsAuthenticated = isAuthenticatedRef.current;

    if (
      apiCallCompleted.current ||
      markingInProgressRef.current ||
      !currentVideoId ||
      !currentTrackingId ||
      !currentCourseId ||
      !currentToken
    ) {
      return false;
    }

    markingInProgressRef.current = true;

    try {
      const payload = {
        ...(currentIsAuthenticated ? { profile_id: currentTrackingId } : { user_id: currentTrackingId }),
        course_id: currentCourseId,
        video_id: currentVideoId,
      };

      const response = await postData("videos-done", payload, currentToken);

      if (response.success) {
        setIsVideoDone(true);
        apiCallCompleted.current = true;
        return true;
      }
    } catch (error) {
      console.error("Error marking video as done:", error);
    } finally {
      markingInProgressRef.current = false;
    }
    return false;
  }, [postData]);

  // Function to update progress
  const updateProgress = useCallback((percent) => {
    setProgressPercentage(percent);

    if (
      percent >= 75 &&
      !apiCallCompleted.current &&
      !markingInProgressRef.current
    ) {
      markVideoAsDone();
    }
  }, [markVideoAsDone]);

  // Reset state when video changes
  useEffect(() => {
    setProgressPercentage(0);
    markingInProgressRef.current = false;

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
    isError,
  };
};

export default useVideoProgress;
