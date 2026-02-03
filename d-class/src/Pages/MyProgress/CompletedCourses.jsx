import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useTranslation } from "react-i18next";
import { CaretLeft, CaretRight, CheckCircle } from "@phosphor-icons/react";
import placeholder from "assests/courses/1.jpg";
import BASE_URL from "Utilities/BASE_URL";

const CompletedCourses = ({ data }) => {
  const { t, i18n } = useTranslation();

  if (!data || data.length === 0) {
    return null;
  }

  // Get course link based on course type
  const getCourseLink = (course) => {
    const type = course?.course_type;
    const slug = course?.slug;

    if (!slug) return "/categories";

    switch (type) {
      case "series":
        return `/course/watch-series/${slug}`;
      case "playlist":
        return `/course/watch-playlist/${slug}`;
      case "single":
        return `/course/watch-single/${slug}`;
      default:
        return `/course/${slug}`;
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl lg:text-2xl font-bold">
          {t("progress.completed_courses") || "Completed Courses"}
        </h2>
        <div className="flex items-center gap-x-2">
          <button className="completed-prev-btn text-white bg-grey hover:bg-lightGrey p-2 rounded-full transition-colors">
            {i18n.language === "ar" ? (
              <CaretRight size={20} weight="bold" />
            ) : (
              <CaretLeft size={20} weight="bold" />
            )}
          </button>
          <button className="completed-next-btn text-white bg-grey hover:bg-lightGrey p-2 rounded-full transition-colors">
            {i18n.language === "ar" ? (
              <CaretLeft size={20} weight="bold" />
            ) : (
              <CaretRight size={20} weight="bold" />
            )}
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={1.2}
        navigation={{
          prevEl: ".completed-prev-btn",
          nextEl: ".completed-next-btn",
        }}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
          1280: { slidesPerView: 4.2 },
        }}
        className="completed-courses-swiper"
      >
        {data.map((course, index) => {
          const { name, image, trailer, instructor, completedAt, slug } = course;

          return (
            <SwiperSlide key={course._id || index}>
              <Link
                to={getCourseLink(course)}
                className="block group"
              >
                <div className="relative">
                  <img
                    src={
                      trailer?.assets?.thumbnail ||
                      (image ? `${BASE_URL}/${image}` : placeholder)
                    }
                    alt={name}
                    className="w-full h-[200px] object-cover rounded-xl shadow-md shadow-white/10 group-hover:shadow-primary/20 transition-shadow"
                    onError={(e) => { e.target.src = placeholder; }}
                  />
                  {/* Completed badge */}
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                    <CheckCircle size={14} weight="fill" />
                    {t("progress.completed") || "Completed"}
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {name}
                  </h3>
                  {instructor && (
                    <p className="text-gray-400 text-xs mt-1">
                      {instructor.name}
                    </p>
                  )}
                  {completedAt && (
                    <p className="text-gray-500 text-xs mt-1">
                      {t("progress.completed_on") || "Completed on"}{" "}
                      {new Date(completedAt).toLocaleDateString(
                        i18n.language === "ar" ? "ar-EG" : "en-US",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </p>
                  )}
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default CompletedCourses;
