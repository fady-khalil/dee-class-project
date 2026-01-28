import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import { CaretRight, CaretLeft } from "@phosphor-icons/react";
import "./InstructorProfileSliderStyle.css";

const InstructorProfileSlider = ({ title, data }) => {
  const { i18n } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div className="flex flex-col items-center small_screen_container px-2 md:px-4 relative">
      <div className="flex items-center mb-3 md:mb-5 lg:mb-10 gap-x-2 md:gap-x-4 lg:gap-x-6 w-full justify-between md:justify-center">
        <button
          ref={prevRef}
          className="slider-arrow z-[100] solution-prev-button hidden md:flex items-center justify-center bg-black text-xl md:text-2xl lg:text-3xl text-white p-0.5 md:p-1 transition-all duration-300 hover:scale-[0.9]"
        >
          {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
        </button>
        <h2 className="text-white text-center text-2xl lg:text-4xl font-bold">
          {title}
        </h2>
        <button
          ref={nextRef}
          className="slider-arrow z-[100] solution-next-button hidden md:flex items-center justify-center bg-black text-xl md:text-2xl lg:text-3xl text-white p-0.5 md:p-1 transition-all duration-300 hover:scale-[0.9]"
        >
          {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
        </button>
      </div>

      <Swiper
        slidesPerView="auto"
        spaceBetween={20}
        modules={[Navigation, Pagination]}
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
        loop={true}
        loopAdditionalSlides={4}
        className="w-full instructor-slider"
      >
        {data?.map((instructor, index) => (
          <SwiperSlide key={index} className="!w-[20%] min-w-[270px]">
            <div className="relative border-b border-white/10 rounded-lg overflow-hidden w-full">
              <Link
                to={`instructor-profile/${instructor.slug}`}
                className="block relative"
              >
                <img
                  className="!h-[450px] object-cover w-full"
                  src={instructor.image}
                  alt={instructor.name}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent h-1/2 "></div>
                <div className="p-6 absolute bottom-0 left-0 right-0 text-center ">
                  <h3 className="text-white text-2xl md:text-3xl font-bold mb-1">
                    {instructor.name || "Instructor"}
                  </h3>
                  <div className="h-0.5 w-8 bg-primary mx-auto my-4"></div>
                  <p className="text-white text-lg font-medium mt-1">
                    {instructor.bio || "Subject"}
                  </p>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default InstructorProfileSlider;
