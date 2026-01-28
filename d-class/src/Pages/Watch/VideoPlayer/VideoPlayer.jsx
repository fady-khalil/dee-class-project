import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import ApiVideoPlayer from "@api.video/react-player";
import Spinner from "Components/RequestHandler/Spinner";
import useVideoProgress from "Hooks/useVideoProgress";
import useVideoHistory from "Hooks/useVideoHistory";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { useTranslation } from "react-i18next";
import formatTime from "Utilities/formatTime";
import placeholder from "assests/courses/1.jpg";

/**
 * VideoPlayer component
 * - Shows resume modal based on video_progress from API (no localStorage)
 * - Tracks progress and marks videos as done via API
 */
const VideoPlayer = ({
  videoData,
  videoId,
  courseId,
  courseSlug,
  videoProgress, // { timestamp, timeSlap } from API - for resume modal
  initialIsDone, // boolean from API - if video is already done
  onProgressUpdate,
  onVideoCompleted,
}) => {
  const { t } = useTranslation();
  const { selectedUser, user, isAuthenticated } = useContext(LoginAuthContext);

  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);

  const playerRef = useRef(null);
  const durationRef = useRef(0);
  const currentTimeRef = useRef(0);
  const currentVideoIdRef = useRef(videoId);
  const hasCheckedProgressRef = useRef(false);
  const lastVideoIdRef = useRef(null);

  // Update the videoId ref whenever the prop changes
  useEffect(() => {
    currentVideoIdRef.current = videoId;
  }, [videoId]);

  // Use our progress tracking hook (for marking videos as done at 75%)
  const { updateProgress, isVideoDone } = useVideoProgress(courseId, videoId, initialIsDone);

  // Notify parent when video is marked as done
  useEffect(() => {
    if (isVideoDone && onVideoCompleted) {
      onVideoCompleted(videoId);
    }
  }, [isVideoDone, videoId, onVideoCompleted]);

  // Use our video history hook (for continue watching)
  // Pass isVideoDone to stop saving progress once video is completed
  const { updateCurrentTime, onExitVideo } = useVideoHistory(
    courseSlug,
    videoId,
    duration,
    isVideoDone
  );

  // Reset state when video changes
  useEffect(() => {
    const isVideoChange = lastVideoIdRef.current !== null && lastVideoIdRef.current !== videoId;

    if (isVideoChange) {
      // Only reset these when switching videos
      setShowResumePrompt(false);
      setSavedProgress(null);
      hasCheckedProgressRef.current = false;
      durationRef.current = 0;
      currentTimeRef.current = 0;
    }

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);

    lastVideoIdRef.current = videoId;
    return () => clearTimeout(timer);
  }, [videoId]);

  // Check for saved progress from API when video loads
  useEffect(() => {
    if (!videoId) return;
    if (hasCheckedProgressRef.current) return;

    console.log("=== VideoPlayer Resume Check ===");
    console.log("videoId:", videoId);
    console.log("videoProgress from API:", videoProgress);

    // Use video_progress from API (passed as prop)
    if (videoProgress && videoProgress.timestamp && videoProgress.timestamp > 5) {
      console.log("Setting resume prompt with timestamp:", videoProgress.timestamp);
      setSavedProgress({
        timestamp: videoProgress.timestamp,
        timeSlap: videoProgress.timeSlap || formatTime(videoProgress.timestamp),
      });
      setShowResumePrompt(true);
    } else {
      console.log("No progress or timestamp too low:", videoProgress?.timestamp);
    }

    hasCheckedProgressRef.current = true;
  }, [videoId, videoProgress]);

  // Store onExitVideo in a ref to avoid dependency issues
  const onExitVideoRef = useRef(onExitVideo);
  useEffect(() => {
    onExitVideoRef.current = onExitVideo;
  }, [onExitVideo]);

  // Handle video switching - save progress for previous video
  const prevVideoIdRef = useRef(videoId);
  useEffect(() => {
    if (prevVideoIdRef.current !== videoId && prevVideoIdRef.current) {
      // Use ref to avoid dependency on onExitVideo
      onExitVideoRef.current();
    }
    prevVideoIdRef.current = videoId;
  }, [videoId]);

  // Save progress when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      onExitVideoRef.current();
    };
  }, []);

  // Handle resume - seek to saved position
  const handleResume = () => {
    setShowResumePrompt(false);
    if (playerRef.current && savedProgress?.timestamp) {
      // Use setTimeout to ensure player is ready
      setTimeout(() => {
        try {
          playerRef.current.setCurrentTime(savedProgress.timestamp);
          playerRef.current.play();
        } catch (e) {
          console.error("Error seeking:", e);
        }
      }, 500);
    }
  };

  // Handle start from beginning
  const handleStartOver = () => {
    setShowResumePrompt(false);
    setSavedProgress(null);
  };

  // Handle when player is ready
  const handleReady = () => {
    setIsReady(true);
  };

  // Handle when duration changes
  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);
    durationRef.current = newDuration;
  };

  // Custom progress handler
  const handleProgressUpdate = useCallback(
    (percent) => {
      updateProgress(percent);

      if (onProgressUpdate && percent > 0) {
        onProgressUpdate(currentVideoIdRef.current, percent);
      }
    },
    [updateProgress, onProgressUpdate]
  );

  // Handle time update
  const handleTimeUpdate = (currentTime) => {
    currentTimeRef.current = currentTime;
    updateCurrentTime(currentTime);

    const videoDuration = durationRef.current;
    if (videoDuration > 0) {
      const percentComplete = Math.floor((currentTime / videoDuration) * 100);
      if (percentComplete > 0) {
        handleProgressUpdate(percentComplete);
      }
    }
  };

  return (
    <>
      {/* Resume Prompt Modal - Fixed position to ensure visibility */}
      {showResumePrompt && savedProgress && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-[9999]">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm mx-4 text-center">
            <h3 className="text-white text-lg font-bold mb-2">
              {t("video.resume_watching") || "Resume Watching?"}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("video.resume_message", { time: savedProgress.timeSlap }) ||
                `You stopped at ${savedProgress.timeSlap}. Would you like to continue from where you left off?`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleStartOver}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {t("video.start_over") || "Start Over"}
              </button>
              <button
                onClick={handleResume}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                {t("video.continue") || "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="">
        {!isReady && (
          <div className="">
            <img
              src={videoData?.trailer?.assets?.thumbnail || videoData?.api_video_object?.assets?.thumbnail || placeholder}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = placeholder; }}
            />
          </div>
        )}
        <div className="relative">
          {loading && isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
              <Spinner />
            </div>
          )}

          {videoId && (
            <ApiVideoPlayer
              ref={playerRef}
              onReady={handleReady}
              onDurationChange={handleDurationChange}
              onTimeUpdate={handleTimeUpdate}
              hideTitle
              video={{ id: videoId }}
              autoplay={false}
              responsive
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          )}
        </div>
        <div className="header_container">
          <div className="flex flex-col mt-4 gap-y-4 mb-10 lg:pb-secondary">
            <h1 className="text-white text-2xl font-bold">{videoData?.name}</h1>
            <p
              className="text-white text-sm lg:w-1/2"
              dangerouslySetInnerHTML={{ __html: videoData?.description }}
            ></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
