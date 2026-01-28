import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import logo from "assests/logos/dclass.png";
import Container from "Components/Container/Container";
import { Link } from "react-router-dom";
const CourseSlider = ({ title, courses }) => {
  const { t, i18n } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div className="pt-secondary lg:pt-primary">
      <Container>
        <div className="flex justify-between items-center  gap-x-10">
          <p className="text-white text-2xl lg:text-4xl font-bold">{title}</p>
          <div className="hidden lg:block lg:flex-1 bg-white h-[1px]"></div>
          <div className="flex items-center gap-x-2">
            <button
              ref={prevRef}
              className="slider-arrow z-[100] solution-prev-button flex items-center justify-center bg-black text-lg  p-1 border border-white text-primary rounded-full "
            >
              {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
            </button>
            <button
              ref={nextRef}
              className="slider-arrow z-[100] solution-next-button flex items-center justify-center bg-black text-lg  border border-white text-primary rounded-full p-1"
            >
              {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
            </button>
          </div>
        </div>
      </Container>
      <div className={` custom_container-${i18n.language}`}>
        <Swiper
          spaceBetween={12}
          slidesPerView={1}
          slidesPerGroup={1}
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
            768: {
              slidesPerView: 2,
              slidesPerGroup: 2,
            },
            992: {
              slidesPerView: 2,
              slidesPerGroup: 2,
            },
            1200: {
              slidesPerView: 3.3,
              slidesPerGroup: 3,
            },
          }}
          modules={[Autoplay, Navigation]}
          className="latest-courses-slider mt-10"
          speed={1000}
        >
          {courses.map((course, index) => (
            <SwiperSlide key={course.course}>
              <Link
                to={"/video"}
                className="h-[300px] relative group overflow-hidden rounded-2xl"
              >
                <img
                  className="h-[300px] rounded-2xl group-hover:scale-105 transition-all duration-500"
                  src={course.image}
                  alt={course.course}
                />
                <div className="absolute w-full h-full left-0 top-0 bg-[rgba(0,0,0,0.4)] text-white flex flex-col justify-center items-center p-3">
                  <div className="h-full flex flex-col justify-center items-center">
                    <h3 className="relative z-[100] text-xl mb-2 font-bold">
                      {course.course}
                    </h3>
                    <div className="max-w-6 max-h-6">
                      {/* <img
                        src={logo}
                        alt="logo"
                        className="max-w-6 max-h-6 object-contain"
                      /> */}
                    </div>
                  </div>
                  <div
                    className={`${
                      i18n.language === "ar" ? "ml-auto" : "mr-auto"
                    } mt-auto text-start`}
                  >
                    <p className="relative z-[100]">{course.instructor}</p>
                    <p className="relative z-[100] text-sm">
                      {course.duration}
                    </p>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CourseSlider;
