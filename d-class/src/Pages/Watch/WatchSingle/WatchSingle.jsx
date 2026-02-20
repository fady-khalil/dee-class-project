import React, { useEffect, useState, useContext, useCallback } from "react";
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

const WatchSingle = () => {
  const { i18n } = useTranslation();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const { fetchData } = useFetch(`courses/${slug}`);
  const { token, selectedUser } = useContext(LoginAuthContext);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [completedVideos, setCompletedVideos] = useState({});
  const [videoProgress, setVideoProgress] = useState(null);
  const [loadingVideoId, setLoadingVideoId] = useState(null);

  const getCourse = async () => {
    try {
      const profileParam = selectedUser?.id ? `?profile_id=${selectedUser.id}` : "";
      const response = await fetchData(`courses/${slug}${profileParam}`, token);
      const data = response?.data;
      setCourseData(data);

      // Set the main video as default, fallback to trailer
      const mainVideoId = data?.api_video_object?.videoId || data?.trailer?.videoId;
      setSelectedVideo(mainVideoId);

      // Set initial completed videos if they exist in the API response
      if (data?.completed_videos) {
        const completed = {};
        data.completed_videos.forEach((videoId) => {
          completed[videoId] = true;
        });
        setCompletedVideos(completed);
      }

      // Set video progress from API response
      if (data?.video_progress && mainVideoId && data.video_progress[mainVideoId]) {
        setVideoProgress(data.video_progress[mainVideoId]);
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

  // Handle video progress updates - wrapped in useCallback to prevent infinite loops
  const handleProgressUpdate = useCallback((videoId, percentComplete) => {
    if (percentComplete >= 75) {
      setLoadingVideoId((current) => {
        if (current !== videoId) return videoId;
        return current;
      });
    }
  }, []);

  // Handle when a video is marked as complete - wrapped in useCallback
  const handleVideoCompleted = useCallback((videoId) => {
    setCompletedVideos((prev) => {
      if (prev[videoId]) return prev;
      return { ...prev, [videoId]: true };
    });
    setLoadingVideoId(null);
  }, []);

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
              videoProgress={videoProgress}
              initialIsDone={completedVideos[selectedVideo] || false}
              onProgressUpdate={handleProgressUpdate}
              onVideoCompleted={handleVideoCompleted}
            />
          </div>

          <div className="flex flex-col lg:w-[30%] px-4 lg:px-6 my-6 lg:mt-10">
            {/* instructor profile section */}
            <InstructorCard data={courseData?.instructor} />

            {/* lesson counts */}
            <div className="bg-grey/30 rounded-lg px-4 py-3 mt-6">
              <p className="text-white flex items-center gap-2">
                <span className="font-medium">{t("courses.single")}</span>
              </p>
            </div>

            {/* lessons */}
            <div className="mt-6 max-h-[50vh] flex flex-col gap-y-3 overflow-y-auto video-series-scrollbar pr-2">
              <button
                onClick={() => {
                  setSelectedVideo(courseData?.api_video_object?.videoId);
                }}
                className={`flex items-center text-start gap-x-3 w-full p-3 rounded-lg transition-colors duration-200 ${
                  selectedVideo === courseData?.api_video_object?.videoId
                    ? "bg-primary text-white"
                    : "hover:bg-lightGrey bg-grey"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={courseData?.api_video_object?.assets?.thumbnail}
                    alt={courseData?.name}
                    className={`w-20 h-14 object-cover rounded ${
                      selectedVideo === courseData?.api_video_object?.videoId
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded">
                    <VideoStatusIndicator
                      isDone={completedVideos[courseData?.api_video_object?.videoId]}
                      isSelected={
                        selectedVideo === courseData?.api_video_object?.videoId
                      }
                      isLoading={
                        loadingVideoId === courseData?.api_video_object?.videoId
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 mb-1">
                    {t("courses.lesson")} 1
                  </span>
                  <h3 className="text-sm font-medium line-clamp-2">
                    {courseData?.name}
                  </h3>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
};

export default WatchSingle;
