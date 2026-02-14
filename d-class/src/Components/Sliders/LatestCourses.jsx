import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { CaretRight, CaretLeft } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import BASE_URL from "Utilities/BASE_URL";
import "./LatestCoursesStyle.css";

const getCourseThumbnail = (course) => {
  if (course?.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
  if (course?.thumbnail) return course.thumbnail;
  if (course?.image) return `${BASE_URL.replace("/api", "")}/${course.image}`;
  return null;
};

const LatestCourses = ({ title, data }) => {
  const { i18n } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data?.length) return null;

  return (
    <div className="flex flex-col items-center small_screen_container px-2 md:px-4">
      {/* Header */}
      <div className="flex items-center mb-3 md:mb-5 lg:mb-10 gap-x-2 md:gap-x-4 lg:gap-x-6 w-full justify-between md:justify-center">
        <button
          ref={prevRef}
          className="hidden md:flex slider-arrow items-center justify-center bg-black text-xl md:text-2xl lg:text-3xl text-white p-0.5 md:p-1 transition-all duration-300 hover:scale-[0.9]"
        >
          {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
        </button>
        <h2 className="text-white text-center text-2xl lg:text-4xl font-bold">
          {title}
        </h2>
        <button
          ref={nextRef}
          className="hidden md:flex slider-arrow items-center justify-center bg-black text-xl md:text-2xl lg:text-3xl text-white p-0.5 md:p-1 transition-all duration-300 hover:scale-[0.9]"
        >
          {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
        </button>
      </div>

      {/* Slider */}
      <Swiper
        slidesPerView={1}
        spaceBetween={0}
        modules={[Pagination, Navigation, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        breakpoints={{
          576: { slidesPerView: 1.2 },
          768: { slidesPerView: 1.4 },
          992: { slidesPerView: 1.6 },
          1200: { slidesPerView: 2.4 },
          1440: { slidesPerView: 3 },
        }}
        loop={true}
        centeredSlides={true}
        className="gallery-slider w-full"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {data.map((course, index) => {
          const isCentered = index === activeIndex;
          return (
            <SwiperSlide key={course._id || index} className="py-8 md:py-10 lg:py-14">
              <Link to={`/course/${course.slug}`} className="block">
                <div
                  className={`relative overflow-hidden rounded-[21px] h-[220px] sm:h-[260px] md:h-[290px] lg:h-[320px] bg-black transition-all duration-500 ${
                    isCentered
                      ? "scale-105 md:scale-110 lg:scale-[1.15]"
                      : "scale-[0.85] opacity-40"
                  }`}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={getCourseThumbnail(course)}
                    alt={course.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <span className="text-white text-lg sm:text-xl md:text-2xl font-bold block">
                      {course.name}
                    </span>
                    <span className="text-white/70 text-sm sm:text-base md:text-lg font-medium mt-1 block">
                      {course.instructor?.name || course.instructor_profile?.name}
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default LatestCourses;
