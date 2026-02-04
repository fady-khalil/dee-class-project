import { useTranslation } from "react-i18next";

import React, { useLayoutEffect, useRef, useState } from "react";
import { Autoplay, Navigation, Grid } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/grid";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import placeholder from "assests/courses/1.jpg";
import BASE_URL from "Utilities/BASE_URL";

// Get thumbnail URL
const getCourseThumbnail = (course) => {
  if (course?.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
  if (course?.thumbnail) return course.thumbnail;
  if (course?.image) return `${BASE_URL.replace("/api", "")}/${course.image}`;
  return placeholder;
};

const ContinueWatching = ({ data }) => {
  const { t, i18n } = useTranslation();
  const prevRef = useRef(null);
  const swiperRef = useRef(null);
  const nextRef = useRef(null);
  return (
    <div className={`w-[98%] ${data?.length === 0 ? "hidden" : ""}`}>
      <div className="flex items-center justify-between mb-5 sm:mb-4">
        <h2 className="text-2xl  text-white font-bold">
          {t("for_you.continue_watching")}
        </h2>
        <div className="flex items-center gap-x-1">
          <button
            ref={prevRef}
            className="slider-arrow z-[100] solution-prev-button flex items-center justify-center bg-black text-3xl text-white p-1"
          >
            {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
          </button>
          <button
            ref={nextRef}
            className="slider-arrow z-[100] solution-next-button flex items-center justify-center bg-black text-3xl text-white p-1"
          >
            {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
          </button>
        </div>
      </div>

      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={20}
        navigation={{
          clickable: true,
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        slidesPerView="auto"
        modules={[Navigation]}
      >
        {data?.map((item, index) => {
          // Support both flat and nested data formats
          const course = item.course || item;
          const videoId = item.videoId || item.video_id;
          const timeSlap = item.timeSlap || item.time_slap;
          const slug = item.courseSlug || course?.slug;
          const name = course?.name;
          const trailer = course?.trailer;
          const image = course?.image;

          return (
            <SwiperSlide
              key={index}
              className="!w-[350px] flex-shrink-0"
              style={{
                textAlign: "start",
                alignItems: "start",
                justifyContent: "flex-start",
              }}
            >
              <Link
                state={{
                  fromContinueWatching: true,
                  video_id: videoId,
                  time: timeSlap,
                }}
                to={`/course/${slug}`}
                className=""
              >
                <div className="relative">
                  <img
                    src={getCourseThumbnail(course)}
                    alt={name}
                    className="!w-[350px] flex-shrink-0 object-contain h-full rounded-xl shadow-md shadow-white/10"
                    onError={(e) => { e.target.src = placeholder; }}
                  />
                  {timeSlap && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {timeSlap}
                    </span>
                  )}
                </div>
                <p className="text-white mt-2">{name}</p>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ContinueWatching;
