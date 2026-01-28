import React, { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import logo from "assests/logos/small-logo.png";
import { Link } from "react-router-dom";
import LessonCompletedBadge from "Components/LessonCompletedBadge";

const PlaylistCourse = ({ courseData, isAuthenticated, isLoggedIn }) => {
  const { t } = useTranslation();
  const [openChapter, setOpenChapter] = useState(null);

  const toggleChapter = (index) => {
    setOpenChapter(openChapter === index ? null : index);
  };

  console.log(courseData?.chapters);

  return (
    <div className="xl:w-3/4 xxl:w-[60%]  mx-auto lg:px-6 py-primary">
      <h2 className="text-3xl text-white mb-10 text-center">
        {t("courses.playlist_course_title")}
      </h2>
      <div className="space-y-4">
        {courseData?.chapters?.map(({ title, lessons }, index) => (
          <div key={index} className="bg-grey rounded-lg overflow-hidden">
            <button
              onClick={() => toggleChapter(index)}
              className="w-full p-3 lg:px-6 lg:py-4 flex items-center justify-between hover:bg-lightGrey transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                <span className="text-gray-400 text-start">
                  {t("courses.chapter")} {index + 1}
                </span>
                <h2 className="text-white text-xl text-start font-semibold">
                  {title}
                </h2>
              </div>
              <CaretDown
                size={24}
                className={`text-white transition-transform duration-300 ${
                  openChapter === index ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 ${
                openChapter === index
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {lessons.map(({ title, video_id, is_done }, lessonIndex) => (
                <div
                  key={lessonIndex}
                  className={`p-2 lg:px-6 lg:py-3 border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                    is_done || video_id?.is_done ? "bg-gray-700/20" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="relative lg:w-32 lg:h-20 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={
                          isAuthenticated
                            ? video_id?.assets?.thumbnail
                            : video_id?.thumbnail
                        }
                        alt={title}
                      />
                      {(is_done || video_id?.is_done) && (
                        <LessonCompletedBadge
                          variant="icon"
                          size="small"
                          className="absolute top-2 right-2"
                        />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex flex-col mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">
                            {t("courses.lessons")} {lessonIndex + 1}
                          </span>
                          {(is_done || video_id?.is_done) && (
                            <LessonCompletedBadge variant="text" size="small" />
                          )}
                        </div>
                        <h3 className="text-white font-medium">{title}</h3>
                      </div>

                      {/* redirect button */}
                      {isAuthenticated ? (
                        <Link
                          className="w-max flex items-center gap-x-2 bg-white rounded-xl min-w-[fit-content] px-4 py-1.5"
                          to={`/course/watch-playlist/${courseData?.slug}`}
                        >
                          <img src={logo} alt="logo" className="w-5 h-5" />
                          <p>{t("courses.start_watching")}</p>
                        </Link>
                      ) : (
                        <Link
                          className="w-max bg-primary hover:bg-darkPrimary transition-all duration-300 px-4 py-1 text-white rounded-xl"
                          to={`/plans`}
                        >
                          {t("courses.join_to_watch")}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistCourse;
