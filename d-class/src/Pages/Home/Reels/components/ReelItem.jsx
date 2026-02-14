import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ApiVideoPlayer from "@api.video/react-player";

const ReelItem = ({ video, isCurrent, onVideoEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef(null);
  const interval = useRef(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const courseSlug = video.course?.slug;

  // Progress bar tracking
  useEffect(() => {
    if (isPlaying && isReady) {
      interval.current = setInterval(() => {
        if (playerRef.current) {
          const duration = playerRef.current.getDuration?.() || 1;
          const currentTime = playerRef.current.getCurrentTime?.() || 0;
          setProgress((currentTime / duration) * 100);

          if (duration > 0 && currentTime >= duration - 0.2) {
            setIsPlaying(false);
            onVideoEnd();
          }
        }
      }, 100);
    }

    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [isPlaying, isReady]);

  // Pause and reset when scrolled away from this reel
  useEffect(() => {
    if (!isCurrent && isReady && playerRef.current) {
      playerRef.current.pause?.();
      playerRef.current.seekTo?.(0);
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isCurrent, isReady]);

  // Sync player play/pause state
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play?.();
    } else {
      playerRef.current.pause?.();
    }
  }, [isPlaying, isReady]);

  const togglePlay = (e) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  const toggleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setShowAction(true);
    setTimeout(() => setShowAction(false), 1500);
  };

  return (
    <div className="relative w-full h-full flex-shrink-0 group">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
          <div className="relative w-12 sm:w-16 h-12 sm:h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-300/30 border-t-primary animate-spin" />
          </div>
        </div>
      )}

      {/* Video */}
      <div className="w-full h-full overflow-hidden">
        <div className="w-full h-full">
          {video.videoId && (
            <ApiVideoPlayer
              ref={playerRef}
              onReady={() => {
                setIsReady(true);
                setIsLoading(false);
              }}
              hideTitle
              video={{ id: video.videoId }}
              autoplay={false}
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>
      </div>

      {/* Play / Pause overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
        onClick={togglePlay}
      >
        {!isPlaying && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/40 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 sm:h-10 sm:w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gray-700/40 z-10">
        <div
          className="h-full bg-primary transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

      {/* Like Action Animation */}
      <AnimatePresence>
        {showAction && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 sm:h-24 sm:w-24 fill-red-500 text-red-500"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video info */}
      <div
        className={`absolute bottom-3 ${isRTL ? "right-2" : "left-2"} max-w-[70%] z-30`}
      >
        <h3 className="text-base sm:text-lg font-bold text-white">
          {video.title}
        </h3>
        <p className="text-xs sm:text-sm text-white/90 mb-2 line-clamp-2">
          {(video.description || "").length > 20
            ? `${(video.description || "").substring(0, 20)}...`
            : video.description || ""}
        </p>
        {courseSlug && (
          <Link
            to={`/course/${courseSlug}`}
            className="inline-block bg-primary hover:bg-darkPrimary text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 z-30 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {t("home.watch_course")}
          </Link>
        )}
      </div>

      {/* Right side controls */}
      <div
        className={`absolute bottom-4 sm:bottom-8 ${
          isRTL ? "left-2 sm:left-3" : "right-2 sm:right-3"
        } flex flex-col items-center space-y-3 sm:space-y-5 z-10`}
      >
        <button
          onClick={toggleLike}
          className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/30 flex flex-col items-center justify-center text-white border border-white/10 hover:bg-black/50 transition-colors"
        >
          {isLiked ? (
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 fill-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
          <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">
            {isLiked ? (video.views || 0) + 1 : video.views || 0}
          </span>
        </button>

        <button
          className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/30 flex items-center justify-center text-white border border-white/10 hover:bg-black/50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            const shareUrl = video.course?.slug
              ? `/course/${video.course.slug}`
              : window.location.pathname;
            navigator
              .share({
                title: video.title,
                text: video.description || "",
                url: shareUrl,
              })
              .catch(() => {
                navigator.clipboard.writeText(window.location.origin + shareUrl);
              });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReelItem;
