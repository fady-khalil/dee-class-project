import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import useFetch from "Hooks/useFetch";
import IsLoading from "Components/RequestHandler/IsLoading";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import { useTranslation } from "react-i18next";
import "../index.css";
import { t } from "i18next";
import InstructorCard from "../Common/InstructorCard";
import VideoStatusIndicator from "../Common/VideoStatusIndicator";
import { CaretDown, CaretUp, Lock } from "@phosphor-icons/react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import LessonCompletedBadge from "Components/LessonCompletedBadge";
import placeholder from "assests/courses/1.jpg";

const WatchPlaylist = () => {
  const { i18n } = useTranslation();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const { fetchData } = useFetch(`courses/${slug}`);
  const { token, selectedUser } = useContext(LoginAuthContext);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openChapter, setOpenChapter] = useState(0);
  const [completedVideos, setCompletedVideos] = useState({});
  const [videoProgress, setVideoProgress] = useState({}); // Map of videoId -> { timestamp, timeSlap }
  const [loadingVideoId, setLoadingVideoId] = useState(null);

  const getCourse = async () => {
    try {
      const profileParam = selectedUser?.id ? `?profile_id=${selectedUser.id}` : "";
      const response = await fetchData(`courses/${slug}${profileParam}`, token);
      const data = response?.data;

      console.log("=== WatchPlaylist API Response ===");
      console.log("Profile ID used:", selectedUser?.id);
      console.log("completed_videos from API:", data?.completed_videos);
      console.log("video_progress from API:", data?.video_progress);

      setCourseData(data);

      // Set first video or trailer as default
      const firstVideoId = data?.chapters?.[0]?.lessons?.[0]?.video_id?.videoId;
      setSelectedVideo(data?.trailer?.videoId || firstVideoId);

      // Set completed videos from API response
      const completed = {};
      if (data?.completed_videos) {
        data.completed_videos.forEach((videoId) => {
          completed[videoId] = true;
        });
      }

      // Also check is_done flag on each chapter's lessons (set by backend)
      if (data?.chapters) {
        data.chapters.forEach((chapter) => {
          if (chapter?.lessons) {
            chapter.lessons.forEach((lesson) => {
              if (lesson?.is_done) {
                const videoId = lesson?.video_id?.videoId;
                if (videoId) {
                  completed[videoId] = true;
                }
              }
            });
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

  // Memoize video progress for selected video to prevent new object references
  const selectedVideoProgress = useMemo(() => {
    if (!selectedVideo) return null;

    // First check video_progress from API
    if (videoProgress[selectedVideo]) {
      return videoProgress[selectedVideo];
    }

    // Then check lesson video_progress
    for (const chapter of courseData?.chapters || []) {
      const lesson = chapter.lessons?.find(
        (l) => l?.video_id?.videoId === selectedVideo
      );
      if (lesson?.video_progress) {
        return lesson.video_progress;
      }
    }
    return null;
  }, [selectedVideo, videoProgress, courseData?.chapters]);

  // Memoize if selected video is done
  const isSelectedVideoDone = useMemo(() => {
    if (!selectedVideo) return false;
    return completedVideos[selectedVideo] || false;
  }, [selectedVideo, completedVideos]);

  if (isLoading) return <IsLoading />;
  if (courseData) {
    return (
      <main className="mb-secondary lg:mb-primary mt-2">
        <div className="w-full flex flex-col lg:flex-row">
          <div className="lg:w-[70%] border-b border-primary lg:border-none">
            <VideoPlayer
              videoData={courseData}
              videoId={selectedVideo}
              courseSlug={slug}
              courseId={courseData?._id}
              videoProgress={selectedVideoProgress}
              initialIsDone={isSelectedVideoDone}
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
                  {courseData?.chapters?.length} {t("courses.chapters")}
                </span>

                <span className="text-gray-400">•</span>
                <span className="font-medium">
                  {courseData?.chapters?.reduce(
                    (total, chapter) => total + chapter.lessons.length,
                    0
                  )}{" "}
                  {t("courses.lessons")}
                </span>

                {courseData?.is_course_completed && (
                  <LessonCompletedBadge variant="text" size="medium" />
                )}
              </p>
            </div>

            {/* chapters */}
            <div className="mt-6 max-h-[50vh] flex flex-col gap-y-3 overflow-y-auto video-series-scrollbar pr-2">
              {courseData?.chapters?.map((chapter, chapterIndex) => (
                <div
                  key={chapterIndex}
                  className={`text-white bg-grey rounded-lg  transition-all duration-200 `}
                >
                  <button
                    onClick={() =>
                      setOpenChapter(
                        openChapter === chapterIndex ? null : chapterIndex
                      )
                    }
                    className="w-full flex items-center rounded-lg  justify-between text-start p-4 hover:bg-lightGrey transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-medium">
                        {i18n.language === "ar"
                          ? (chapterIndex + 1).toLocaleString("ar-EG")
                          : chapterIndex + 1}
                      </div>
                      <h2 className="text-lg font-medium line-clamp-1">
                        {chapter.title}
                      </h2>
                    </div>
                    <span className="text-gray-300">
                      {openChapter === chapterIndex ? (
                        <CaretUp size={20} weight="bold" />
                      ) : (
                        <CaretDown size={20} weight="bold" />
                      )}
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      openChapter === chapterIndex ? "h-full" : "max-h-0"
                    }`}
                  >
                    <div className="flex flex-col divide-y divide-white/20 px-3 pb-3">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lessonIndex}
                          onClick={() =>
                            setSelectedVideo(lesson?.video_id?.videoId)
                          }
                          className={`flex items-center text-start gap-x-3 w-full p-3 rounded-md transition-colors duration-200 ${
                            selectedVideo === lesson?.video_id?.videoId
                              ? "bg-primary text-white"
                              : "hover:bg-lightGrey"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={lesson?.video_id?.assets?.thumbnail || placeholder}
                              alt={lesson.title}
                              className={`w-20 h-14 object-cover rounded ${
                                selectedVideo === lesson?.video_id?.videoId
                                  ? "ring-2 ring-primary"
                                  : ""
                              }`}
                              onError={(e) => { e.target.src = placeholder; }}
                            />
                            <div
                              className={`absolute inset-0 flex items-center justify-center rounded `}
                            >
                              <VideoStatusIndicator
                                isDone={completedVideos[lesson?.video_id?.videoId] || lesson?.is_done}
                                isSelected={
                                  selectedVideo === lesson?.video_id?.videoId
                                }
                                isLoading={
                                  loadingVideoId === lesson?.video_id?.videoId
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 mb-1">
                              {t("courses.lesson")}{" "}
                              {i18n.language === "ar"
                                ? (lessonIndex + 1).toLocaleString("ar-EG")
                                : lessonIndex + 1}
                            </span>
                            <h3
                              className={`text-sm font-medium line-clamp-2 ${
                                selectedVideo === lesson?.video_id?.videoId
                                  ? "text-white"
                                  : "text-white"
                              }`}
                            >
                              {lesson.title}
                            </h3>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }
};

export default WatchPlaylist;
