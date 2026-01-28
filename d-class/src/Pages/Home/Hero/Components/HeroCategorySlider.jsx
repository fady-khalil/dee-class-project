import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Mousewheel, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { CaretUp, CaretDown } from "@phosphor-icons/react";
import "./styles.css";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
const HeroCategorySlider = ({ courses }) => {
  const { t, i18n } = useTranslation();
  const swiperRef = useRef();
  const titleSwiperRef = useRef();

  const [activeIndex, setActiveIndex] = React.useState(2);
  const [swipersReady, setSwipersReady] = React.useState(0);

  React.useEffect(() => {
    if (swipersReady === 2) {
      // Both swipers are initialized
      titleSwiperRef.current?.slideTo(2);
      swiperRef.current?.slideTo(2);
    }
  }, [swipersReady]);

  const handleSlideChange = (swiper, isTitle = false) => {
    setActiveIndex(swiper.activeIndex);

    // Add a small delay to ensure both swipers are ready
    setTimeout(() => {
      if (isTitle && swiperRef.current) {
        swiperRef.current.slideTo(swiper.activeIndex);
      } else if (!isTitle && titleSwiperRef.current) {
        titleSwiperRef.current.slideTo(swiper.activeIndex);
      }
    }, 0);
  };

  return (
    <div className="hidden xl:flex -mt-[7vh] h-[100vh] gap-x-6 xl:col-span-9 xxl:-mr-4 ">
      {/* Images Swiper Component */}
      <div className="flex-[3] ">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setSwipersReady((prev) => prev + 1);
          }}
          direction="vertical"
          slidesPerView={2.4}
          centeredSlides
          mousewheel={true}
          modules={[Navigation, Mousewheel, Autoplay]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          className="desktop-course-slider h-[90vh]"
          onSlideChange={(swiper) => handleSlideChange(swiper, false)}
        >
          {courses?.map(({ image }, index) => (
            <SwiperSlide className="rounded-lg" key={index}>
              <div
                className={`rounded-lg transition-all duration-500 h-full
                ${
                  activeIndex === index
                    ? "opacity-100 scale-x-100  rounded-lg shadow-lg shadow-xl shadow-black"
                    : "opacity-[0.3] scale-x-[0.8] scale-y-[0.9]"
                }`}
              >
                <img
                  className="w-full h-[full] object-cover rounded-lg "
                  src={image}
                  alt=""
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Course Titles Slider */}
      <div className="h-[100vh]  -mt-[7vh] flex justify-center items-center  flex-[2.5]">
        <div className="flex flex-col responsive-height w-full justify-center relative">
          <button
            className={`text-primary z-10 mb-4 ${
              i18n.language === "ar" ? "mr-4" : "ml-4"
            }`}
            onClick={() => {
              if (titleSwiperRef.current) {
                titleSwiperRef.current.slidePrev();
                swiperRef.current?.slidePrev();
              }
            }}
          >
            <CaretUp size={24} />
          </button>

          <Swiper
            onSwiper={(swiper) => {
              titleSwiperRef.current = swiper;
              setSwipersReady((prev) => prev + 1);
            }}
            direction="vertical"
            slidesPerView={5}
            centeredSlides
            spaceBetween={10}
            mousewheel={true}
            modules={[Navigation, Mousewheel, Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            className="titles-swiper  h-[45vh] xxl:h-[35vh]"
            onSlideChange={(swiper) => handleSlideChange(swiper, true)}
          >
            {courses?.map((course, index) => (
              <SwiperSlide className="max-h-[70px]" key={index}>
                <Link
                  to={`/course/${course.slug}`}
                  // state={{ slug: course.slug }}
                  className={`text-white text-base xxl:text-lg transition-all duration-300 px-4 py-2 w-full font-bold ${
                    i18n.language === "ar" ? "text-right" : "text-start"
                  } 
                  ${
                    activeIndex === index
                      ? "opacity-100 bg-[#272c33a2]"
                      : "opacity-[0.8] scale-95"
                  }`}
                >
                  {course.name}
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            className={` text-primary z-10 mt-4 ${
              i18n.language === "ar" ? "mr-4" : "ml-4"
            }`}
            onClick={() => {
              if (titleSwiperRef.current) {
                titleSwiperRef.current.slideNext();
                swiperRef.current?.slideNext();
              }
            }}
          >
            <CaretDown size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCategorySlider;
