import { useRef, useState, useEffect } from "react";
import Hls from "hls.js";

const CustomVideoPlayer = () => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  // Sample chapters data - replace with your actual chapters
  const chapters = [
    { id: 1, title: "Start", timestamp: 0 },
    { id: 2, title: "First Part", timestamp: 3 },
    { id: 3, title: "Middle", timestamp: 6 },
    { id: 4, title: "Final Part", timestamp: 9 },
    { id: 5, title: "End", timestamp: 11 },
  ];

  // Sample HLS URL
  const videoUrl =
    "https://vod.api.video/vod/vi2E5vAUFeWzGHccQ1oa3frI/hls/manifest.m3u8";

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      // First, check if the browser natively supports HLS
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari can play HLS natively
        video.src = videoUrl;
      }
      // For other browsers, use HLS.js if the browser supports MSE
      else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest loaded");
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data);
        });
      } else {
        console.error("Neither native HLS support nor HLS.js is supported");
      }

      // Add ended event listener
      video.addEventListener("ended", () => {
        setIsEnded(true);
        setIsPlaying(false);
      });
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (video) {
        video.removeEventListener("ended", () => {});
      }
    };
  }, [videoUrl]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isEnded) {
        videoRef.current.currentTime = 0;
        setIsEnded(false);
      }

      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const jumpToChapter = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="bg-black pt-32">
      <div
        className="w-3/4 mx-auto relative border"
        style={{ height: "500px" }}
      >
        <video
          // poster="../../assests/courses/1.jpg"
          poster="https://vod.api.video/vod/vi2E5vAUFeWzGHccQ1oa3frI/thumbnail.jpg"
          ref={videoRef}
          className="w-full border border-primary object-cover h-full"
          playsInline
          controls
        >
          Your browser does not support the video tag.
        </video>

        {/* Dark overlay when paused */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            !isPlaying ? "opacity-50" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Chapters Panel */}
        <div
          className={`absolute top-0 right-0 h-full bg-black bg-opacity-90 transition-all duration-300 ease-in-out z-[100] t overflow-y-auto ${
            showChapters ? "w-1/2" : "w-0"
          }`}
        >
          <div className="p-4 text-white">
            <h3 className="text-xl font-bold mb-4">Chapters</h3>
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => jumpToChapter(chapter.timestamp)}
                className="w-full text-left p-2 hover:bg-gray-800 rounded mb-2 transition-colors"
              >
                <div className="font-medium">{chapter.title}</div>
                <div className="text-sm text-gray-400">
                  {formatTime(chapter.timestamp)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chapters Toggle Button */}
        <button
          onClick={() => setShowChapters(!showChapters)}
          className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-300 z-[1000]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Centered play/pause/replay button */}
        <button
          onClick={handlePlayPause}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-4 w-16 h-16 flex items-center justify-center transition-all duration-300 z-10"
        >
          {isEnded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 4h4v16H6zM14 4h4v16h-4z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
