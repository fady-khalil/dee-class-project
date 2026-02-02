import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import Container from "Components/Container/Container";
import "./styles.css";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const MobileCourseSlider = ({ courses }) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  return (
    <section className="xl:hidden">
      <Container>
        <div className="flex items-center mb-6 justify-between">
          <h1 className="text-white text-3xl uppercase font-bold relative">
            <span className="relative z-10">
              {t("navigation.course_categories")}
            </span>
          </h1>
        </div>

        <div className="relative mobile-slider-container">
          <Swiper
            ref={swiperRef}
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            loop={courses?.length > 2}
            slidesPerView={"auto"}
            speed={600}
            watchSlidesProgress={true}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            modules={[EffectCoverflow, Pagination, Autoplay]}
            className="mobile-course-slider"
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {courses?.map(({ image, title, slug }, index) => (
              <SwiperSlide key={index} className="mobile-course-slide">
                <Link
                  to={`/categories`}
                  state={{ slug: slug }}
                  className="block mobile-course-card relative overflow-hidden rounded-xl"
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700"
                      src={image}
                      alt={title}
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 transform translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-[3px] w-10 bg-primary rounded-full"></div>
                        <span className="text-white/80 text-sm">
                          {index + 1}/{courses.length}
                        </span>
                      </div>
                      <h3 className="text-white text-xl md:text-2xl font-bold line-clamp-2">
                        {title}
                      </h3>
                      <div className="mt-3">
                        <span className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 text-white rounded-full text-sm">
                          {t("general.explore")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
};

export default MobileCourseSlider;
