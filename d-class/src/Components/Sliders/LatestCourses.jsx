import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

import logo from "assests/logos/dclass.png";
import { Link } from "react-router-dom";
import BASE_URL from "Utilities/BASE_URL";
import "./LatestCoursesStyle.css";

// swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import { CaretRight, CaretLeft } from "@phosphor-icons/react";

const LatestCourses = ({ title, data }) => {
  const { i18n } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  return (
    <div className="flex flex-col items-center small_screen_container px-2 md:px-4">
      <div className="flex items-center mb-3 md:mb-5 lg:mb-10 gap-x-2 md:gap-x-4 lg:gap-x-6 w-full justify-between md:justify-center">
        <button
          ref={prevRef}
          className="hidden md:flex slider-arrow z-[100] solution-prev-button  items-center justify-center bg-black text-xl md:text-2xl lg:text-3xl text-white p-0.5 md:p-1 transition-all duration-300 hover:scale-[0.9]"
        >
          {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
        </button>
        <h2 className="text-white text-center text-2xl lg:text-4xl font-bold">
          {title}
        </h2>

        <button
          ref={nextRef}
          className="hidden md:flex slider-arrow z-[100] solution-next-button  items-center justify-center bg-black text-xl md:text-2xl lg:text-3xl text-white p-0.5 md:p-1 transition-all duration-300 hover:scale-[0.9]"
        >
          {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
        </button>
      </div>
      <Swiper
        slidesPerView={1}
        spaceBetween={0}
        modules={[Pagination, Navigation]}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={{
          clickable: true,
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        breakpoints={{
          576: {
            slidesPerView: 1.2,
          },
          768: {
            slidesPerView: 1.4,
          },
          992: {
            slidesPerView: 1.6,
          },
          1200: {
            slidesPerView: 2.4,
          },
          1440: {
            slidesPerView: 3,
          },
        }}
        loop={true}
        centeredSlides={true}
        className="rounded-[21px] flex items-center gallery-slider"
        onSlideChange={handleSlideChange}
      >
        {data?.map((course, index) => {
          const isCentered = index === activeIndex;

          return (
            <SwiperSlide
              className="pt-8 md:pt-10 lg:pt-14 pb-6 lg:pb-16 h-auto"
              key={index}
            >
              <div
                className={`relative transition-scale-x ease-in duration-500 h-[220px] sm:h-[260px] md:h-[290px] lg:h-[320px] z-[0] rounded-[21px] ${
                  isCentered
                    ? "scale-y-[1.1] scale-x-[1.1] md:scale-y-[1.15] md:scale-x-[1.15] lg:scale-y-[1.2] lg:scale-x-[1.2] z-[1000000000]"
                    : "z-[-10] opacity-[0.3] scale-y-[0.8] scale-x-[0.8]"
                }`}
              >
                <Link
                  to={`/course/${course.slug}`}
                  className={`absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.2)] z-[1000000000] rounded-[21px] transition ease-in duration-500 cursor-pointer`}
                >
                  <div className="flex flex-col h-full items-center justify-center">
                    <div className="h-full flex flex-col justify-center items-center">
                      <span
                        className="text-white hover:underline mb-2 text-lg sm:text-xl md:text-2xl font-bold text-center px-2"
                      >
                        {course.name}
                      </span>
                      <div className="max-w-6 max-h-6 md:max-w-8 md:max-h-8">
                        <img
                          src={logo}
                          alt="logo"
                          className="max-w-6 max-h-6 md:max-w-8 md:max-h-8 object-contain"
                        />
                      </div>
                    </div>
                    <div className="mt-auto pb-2">
                      <span
                        className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold relative inline-block group"
                      >
                        <span className="inline-block">
                          {course.instructor?.name || course.instructor_profile?.name}
                        </span>
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-white to-white transform scale-x-0 group-hover:scale-x-100 transition-all duration-300 ease-in-out origin-left"></span>
                      </span>
                    </div>
                  </div>
                </Link>
                <img
                  className={`w-full h-full object-cover rounded-[21px] ${
                    isCentered ? "relative z-[1000] " : "relative z-[0]"
                  }`}
                  src={
                    course?.trailer?.assets?.thumbnail ||
                    (course?.image ? `${BASE_URL}/${course.image}` : null)
                  }
                  alt={course.name}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default LatestCourses;
