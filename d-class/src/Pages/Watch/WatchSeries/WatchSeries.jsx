import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import useFetch from "Hooks/useFetch";
import IsLoading from "Components/RequestHandler/IsLoading";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import { useTranslation } from "react-i18next";
import "../index.css";
import InstructorCard from "../Common/InstructorCard";
import { t } from "i18next";
import VideoStatusIndicator from "../Common/VideoStatusIndicator";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import LessonCompletedBadge from "Components/LessonCompletedBadge";
import placeholder from "assests/courses/1.jpg";

const WatchSeries = () => {
  const { i18n } = useTranslation();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const { fetchData } = useFetch(`courses/${slug}`);
  const { token, selectedUser } = useContext(LoginAuthContext);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [completedVideos, setCompletedVideos] = useState({});
  const [videoProgress, setVideoProgress] = useState({}); // Map of videoId -> { timestamp, timeSlap }
  const [loadingVideoId, setLoadingVideoId] = useState(null);

  const getCourse = async () => {
    try {
      const profileParam = selectedUser?.id ? `?profile_id=${selectedUser.id}` : "";
      const response = await fetchData(`courses/${slug}${profileParam}`, token);
      const data = response?.data;

      console.log("=== WatchSeries API Response ===");
      console.log("Profile ID used:", selectedUser?.id);
      console.log("completed_videos from API:", data?.completed_videos);
      console.log("video_progress from API:", data?.video_progress);

      setCourseData(data);

      // Find the first video ID to set as default if there's no trailer
      const firstVideoId = data?.series?.[0]?.series_video_id?.videoId;
      setSelectedVideo(data?.trailer?.videoId || firstVideoId);

      // Set completed videos from API response
      const completed = {};
      if (data?.completed_videos) {
        data.completed_videos.forEach((videoId) => {
          completed[videoId] = true;
        });
      }

      // Also check is_done flag on each series item (set by backend)
      if (data?.series) {
        data.series.forEach((item) => {
          if (item?.is_done) {
            const videoId = item?.series_video_id?.videoId;
            if (videoId) {
              completed[videoId] = true;
            }
          }
        });
      }

      setCompletedVideos(completed);

      // Set video progress from API response
      if (data?.video_progress) {
        setVideoProgress(data.video_progress);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCourse();
  }, [slug, token, selectedUser?.id]);

  // Add effect to scroll to top when selected video changes
  useEffect(() => {
    if (selectedVideo) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedVideo]);

  // Handle video progress updates
  const handleProgressUpdate = (videoId, percentComplete) => {
    if (percentComplete >= 75 && !completedVideos[videoId]) {
      // Mark as loading while API call is in progress
      setLoadingVideoId(videoId);
    }
  };

  // Handle when a video is marked as complete
  const handleVideoCompleted = (videoId) => {
    setCompletedVideos((prev) => ({
      ...prev,
      [videoId]: true,
    }));
    setLoadingVideoId(null);
  };

  // Get video progress for selected video
  const getSelectedVideoProgress = () => {
    if (!selectedVideo) return null;

    // First check video_progress from API
    if (videoProgress[selectedVideo]) {
      return videoProgress[selectedVideo];
    }

    // Then check series item video_progress
    const seriesItem = courseData?.series?.find(
      (item) => item?.series_video_id?.videoId === selectedVideo
    );
    return seriesItem?.video_progress || null;
  };

  // Check if selected video is done
  const isSelectedVideoDone = () => {
    if (!selectedVideo) return false;
    return completedVideos[selectedVideo] || false;
  };

  if (isLoading) return <IsLoading />;
  if (courseData) {
    return (
      <main className="mb-secondary lg:mb-primary mt-2">
        <div className="w-full flex flex-col lg:flex-row">
          <div className="lg:w-[70%] border-b border-primary lg:border-none">
            <VideoPlayer
              videoData={courseData}
              videoId={selectedVideo}
              courseId={courseData?._id}
              courseSlug={slug}
              videoProgress={getSelectedVideoProgress()}
              initialIsDone={isSelectedVideoDone()}
              onProgressUpdate={handleProgressUpdate}
              onVideoCompleted={handleVideoCompleted}
            />
          </div>

          <div className="flex flex-col lg:w-[30%] px-4 lg:px-6 my-6 lg:mt-10">
            {/* instructor profile section */}
            <InstructorCard data={courseData?.instructor} />

            {/* lesson counts */}
            <div className="bg-grey/30 rounded-lg px-4 py-3 mt-6">
              <p
                className={`text-white flex items-center gap-2 ${
                  courseData?.is_course_completed ? "justify-between" : ""
                }`}
              >
                <span className="font-medium">
                  {courseData?.series?.length} {t("courses.lessons")}
                </span>

                {courseData?.is_course_completed && (
                  <LessonCompletedBadge variant="text" size="medium" />
                )}
              </p>
            </div>

            {/* lessons */}
            <div className="mt-6 max-h-[50vh] flex flex-col gap-y-3 overflow-y-auto video-series-scrollbar pr-2">
              {courseData?.series?.map((item, index) => (
                <button
                  onClick={() => {
                    setSelectedVideo(item?.series_video_id?.videoId);
                  }}
                  className={`flex items-center text-start gap-x-3 w-full p-3 rounded-lg transition-colors duration-200 ${
                    selectedVideo === item?.series_video_id?.videoId
                      ? "bg-primary text-white"
                      : "hover:bg-lightGrey bg-grey"
                  }`}
                  key={index}
                >
                  <div className="relative shrink-0">
                    <img
                      src={item?.series_video_id?.assets?.thumbnail || placeholder}
                      alt={item.title}
                      className={`w-20 h-14 object-cover rounded ${
                        selectedVideo === item?.series_video_id?.videoId
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onError={(e) => { e.target.src = placeholder; }}
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center rounded `}
                    >
                      <VideoStatusIndicator
                        isDone={completedVideos[item?.series_video_id?.videoId] || item?.is_done}
                        isSelected={
                          selectedVideo === item?.series_video_id?.videoId
                        }
                        isLoading={
                          loadingVideoId === item?.series_video_id?.videoId
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">
                      {t("courses.lesson")}{" "}
                      {i18n.language === "ar"
                        ? (index + 1).toLocaleString("ar-EG")
                        : index + 1}
                    </span>
                    <h3 className="text-white text-sm font-medium line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }
};

export default WatchSeries;
