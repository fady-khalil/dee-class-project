import { useTranslation } from "react-i18next";

import React, { useRef } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import placeholder from "assests/courses/1.jpg";
import BASE_URL from "Utilities/BASE_URL";

// Get thumbnail URL
const getCourseThumbnail = (course) => {
  if (course?.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
  if (course?.thumbnail) return course.thumbnail;
  if (course?.image) return `${BASE_URL.replace("/api", "")}/${course.image}`;
  return placeholder;
};

const Slider = ({ data, title }) => {
  const { i18n } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  return (
    <div className={`w-[98%] ${data?.length === 0 ? "hidden" : ""}`}>
      <div className="flex items-end justify-between mb-5 sm:mb-4 gap-x-2">
        <h2 className="text-2xl text-white font-bold">{title}</h2>
        <div className="flex-1 bg-[#ccc] h-[1px] hidden lg:block"></div>
        <div className="flex items-center gap-x-2">
          <button
            ref={prevRef}
            className="slider-arrow z-[10] solution-prev-button flex items-center justify-center bg-black text-xl text-primary border border-[#cccc] rounded-full p-[2px]"
          >
            {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
          </button>
          <button
            ref={nextRef}
            className="slider-arrow z-[10] solution-next-button flex items-center justify-center bg-black text-xl text-primary border border-[#cccc] rounded-full p-[2px]"
          >
            {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
          </button>
        </div>
      </div>
      <div className="relative">
        {i18n.language === "ar" && (
          <div className="absolute top-0 left-0 z-[10] h-full w-[80px] bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
        )}
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
          {data?.length > 0 &&
            data?.map((course, index) => (
                <SwiperSlide
                  key={index}
                  className="!w-[350px] flex-shrink-0"
                  style={{
                    textAlign: "start",
                    alignItems: "start",
                    justifyContent: "flex-start",
                  }}
                >
                  <Link to={`/course/${course.slug}`} className="block">
                    <div className="h-[200px] w-full relative">
                      {course.tags?.map((tag, tagIndex) => (
                        <span
                          className="px-2 py-0.5 text-sm rounded-lg shadow-md capitalize absolute top-2 left-2"
                          key={tagIndex}
                          style={{
                            backgroundColor: tag.color,
                            color: tag.text_color,
                          }}
                        >
                          {tag?.name}
                        </span>
                      ))}
                      <img
                        src={getCourseThumbnail(course)}
                        alt={course.name}
                        className="!w-[350px] flex-shrink-0 object-contain h-full rounded-xl "
                      />
                    </div>
                    <p className="text-white mt-2 relative z-[100]">{course.name}</p>
                  </Link>
                </SwiperSlide>
              )
            )}
        </Swiper>

        {/* Right overlay gradient */}
        {i18n.language === "en" && (
          <div className="absolute top-0 right-0 z-[10] h-full w-[80px] bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};

export default Slider;
