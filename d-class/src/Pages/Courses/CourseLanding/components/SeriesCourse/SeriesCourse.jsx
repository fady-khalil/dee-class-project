import React, { useState } from "react";
import logo from "assests/logos/small-logo.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LessonCompletedBadge from "Components/LessonCompletedBadge";

const SeriesCourse = ({
  courseData,
  isAuthenticated,
  isLoggedIn,
  isPurchased,
}) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="flex flex-col gap-14 lg:w-3/4 mx-auto py-primary">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl lg:text-3xl text-white mb-4 text-center">
          {t("courses.series_course_title", {
            episodeCount: courseData?.series.length,
          })}
        </h2>
        {courseData?.is_done && (
          <LessonCompletedBadge variant="text" size="medium" className="mb-6" />
        )}
      </div>
      {courseData?.series.map(
        ({ title, description, series_video_id, is_done }, index) => (
          <div
            className={`flex flex-col md:flex-row gap-10 items-center p-4 rounded-xl ${
              is_done || series_video_id?.is_done ? "bg-gray-700/20" : ""
            }`}
            key={index}
          >
            <div className="flex-1 shadow-md shadow-white/10 rounded-xl overflow-hidden relative">
              <img
                className="rounded-xl max-h-[300px] w-full object-cover"
                src={series_video_id?.assets?.thumbnail}
                alt={title}
              />
              {(is_done || series_video_id?.is_done) && (
                <LessonCompletedBadge
                  variant="icon"
                  size="medium"
                  className="absolute top-3 right-3"
                />
              )}
            </div>

            <div className="text-white flex-col flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl lg:text-3xl font-bold">
                  {i18n.language === "ar"
                    ? (index + 1).toLocaleString("ar-EG")
                    : index + 1}
                  . {title}
                </h3>
                {(is_done || series_video_id?.is_done) && (
                  <LessonCompletedBadge variant="text" size="small" />
                )}
              </div>
              <p className="text-lightWhite">{description}</p>

              {isAuthenticated || isPurchased ? (
                <Link
                  className="w-max flex items-center gap-x-2 bg-black border border-primary mt-6 text-white rounded-lg px-4 py-2"
                  to={`/course/watch-series/${courseData?.slug}`}
                >
                  <img src={logo} alt="logo" className="w-6 h-6" />
                  <p>{t("courses.start_watching")}</p>
                </Link>
              ) : (
                <Link
                  className="mt-6 flex w-max bg-darkPrimary hover:bg-primary transition-all duration-300 px-4 py-2 text-white rounded-lg"
                  to={`/plans`}
                >
                  {t("courses.join_to_watch")}
                </Link>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default SeriesCourse;
