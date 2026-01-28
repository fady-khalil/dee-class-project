import { useTranslation } from "react-i18next";
import Container from "Components/Container/Container";
import React, { useRef } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
const Leaders = ({ data }) => {
  const { t, i18n } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  return (
    <section className="py-secondary lg:py-primary">
      <Container>
        <div className="flex items-end justify-between mb-5 sm:mb-4 gap-x-2">
          <h2
            className={`text-white text-2xl w-fit lg:text-4xl font-bold relative after:absolute  after:w-12 after:-top-3 ${
              i18n.language === "ar" ? "after:right-0" : "after:left-0"
            } after:bg-primary after:h-2`}
          >
            {t("general.Leaders")}
          </h2>

          <div className="flex items-center gap-x-2">
            <button
              ref={prevRef}
              className="slider-arrow z-[100] solution-prev-button flex items-center justify-center bg-black text-xl text-primary border border-[#cccc] rounded-full p-[2px]"
            >
              {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
            </button>
            <button
              ref={nextRef}
              className="slider-arrow z-[100] solution-next-button flex items-center justify-center bg-black text-xl text-primary border border-[#cccc] rounded-full p-[2px]"
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
            {data?.map(({ title, image, bio }, index) => (
              <SwiperSlide
                key={index}
                className="!w-[350px] flex-shrink-0"
                style={{
                  textAlign: "start",
                  alignItems: "start",
                  justifyContent: "flex-start",
                }}
              >
                <div className="flex flex-col gap-y-2">
                  <div className="h-[300px] w-full relative">
                    <img
                      src={image}
                      alt={title}
                      className="!w-[350px] flex-shrink-0 object-cover h-full rounded-xl "
                    />
                  </div>
                  <p className="text-white font-bold text-xl mt-2 relative z-[100]">
                    {title}
                  </p>
                  <p className="text-lightWhite text-sm mt-2 relative z-[100]">
                    {bio}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Right overlay gradient */}
          {i18n.language === "en" && (
            <div className="absolute top-0 right-0 z-[10] h-full w-[80px] bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Leaders;
