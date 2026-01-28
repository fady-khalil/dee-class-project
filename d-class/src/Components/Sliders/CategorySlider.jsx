import { useTranslation } from "react-i18next";
import React, { useContext, useRef, useEffect, useState } from "react";
import Container from "Components/Container/Container";
import { CategoriesContext } from "Context/General/CategoriesContext";

import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
const CategorySlider = () => {
  const { categories } = useContext(CategoriesContext);
  const { t, i18n } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const mobilePrevRef = useRef(null);
  const mobileNextRef = useRef(null);
  const swiperRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Ref to store the slides container
  const slidesContainerRef = useRef(null);

  // Effect to handle screen resize and update swiper navigation
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      // Update swiper navigation when screen size changes
      if (swiperRef.current) {
        const swiper = swiperRef.current;
        swiper.params.navigation.prevEl = desktop
          ? prevRef.current
          : mobilePrevRef.current;
        swiper.params.navigation.nextEl = desktop
          ? nextRef.current
          : mobileNextRef.current;

        // Update navigation
        swiper.navigation.destroy();
        swiper.navigation.init();
        swiper.navigation.update();
      }
    };

    window.addEventListener("resize", handleResize);

    // Initial setup
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Effect to equalize heights after render
  useEffect(() => {
    if (slidesContainerRef.current) {
      const slides =
        slidesContainerRef.current.querySelectorAll(".swiper-slide");
      if (slides.length === 0) return;

      // Reset heights first
      slides.forEach((slide) => {
        slide.style.height = "auto";
      });

      // Find the tallest slide
      let maxHeight = 0;
      slides.forEach((slide) => {
        const height = slide.offsetHeight;
        maxHeight = Math.max(maxHeight, height);
      });

      // Set all slides to the tallest height
      slides.forEach((slide) => {
        slide.style.height = `${maxHeight}px`;
      });
    }
  }, [categories]);

  const bug = categories && [...categories, ...categories];
  return (
    <section>
      <div className="flex items-center justify-between lg:justify-center  mb-6">
        <h2 className="lg:text-center text-2xl lg:text-4xl text-white font-bold">
          {t("general.categories")}
        </h2>

        <div className="flex items-center gap-x-2 lg:hidden">
          <button
            ref={mobilePrevRef}
            className="slider-arrow z-[10] solution-prev-button flex items-center justify-center bg-black text-xl text-primary border border-[#cccc] rounded-full p-[2px] "
          >
            {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
          </button>
          <button
            ref={mobileNextRef}
            className="slider-arrow z-[10] solution-next-button flex items-center justify-center bg-black text-xl text-primary border border-[#cccc] rounded-full p-[2px]"
          >
            {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center gap-x-10" ref={slidesContainerRef}>
          <button
            ref={prevRef}
            className="slider-arrow z-[10] solution-prev-button flex items-center justify-center bg-black text-xl text-primary border border-[#cccc] rounded-full p-[2px] hidden lg:block"
          >
            {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
          </button>
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={20}
            navigation={{
              clickable: true,
              prevEl: isDesktop ? prevRef.current : mobilePrevRef.current,
              nextEl: isDesktop ? nextRef.current : mobileNextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = isDesktop
                ? prevRef.current
                : mobilePrevRef.current;
              swiper.params.navigation.nextEl = isDesktop
                ? nextRef.current
                : mobileNextRef.current;
            }}
            slidesPerView="auto"
            modules={[Navigation]}
          >
            {bug?.map(({ name, icon, slug }, index) => (
              <SwiperSlide
                key={index}
                className="!w-[180px] px-[2px] py-4 border border-white rounded-md flex-shrink-0 "
                style={{
                  alignItems: "start",
                  //   justifyContent: "center",
                }}
              >
                <Link state={{ slug }} to={`/categories`}>
                  <div className="w-full relative flex-grow">
                    <div className="w-[65px] h-[65px] mx-auto  ">
                      <img
                        src={icon}
                        alt={name}
                        className="max-w-full max-h-full object-contain rounded-xl"
                      />
                    </div>
                  </div>
                  <p className="text-white text-center mt-3 text-s font-medium relative z-[100]">
                    {name}
                  </p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            ref={nextRef}
            className="slider-arrow z-[10] solution-next-button flex items-center justify-center bg-black text-xl text-primary border border-[#cccc] rounded-full p-[2px] hidden lg:block"
          >
            {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
