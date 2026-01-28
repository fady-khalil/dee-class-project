import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useTranslation } from "react-i18next";
import { CaretRight, CaretLeft } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const NewsCategories = ({ data }) => {
  const { t, i18n } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="relative pt-secondary lg:pt-primary ">
      <div className="flex items-center justify-between gap-x-6 mb-10">
        <h4 className="text-2xl lg:text-4xl font-bold">
          {t("general.categories")}
        </h4>
        <div className="hidden sm:block sm:flex-1 bg-darkGrey h-[1px]"></div>
        <div className="flex items-center gap-x-1">
          <button
            ref={prevRef}
            className="slider-arrow flex items-center justify-center  text-lg  p-1 border border-grey text-primary rounded-full"
          >
            {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
          </button>
          <button
            ref={nextRef}
            className="slider-arrow flex items-center justify-center  text-lg  p-1 border border-grey text-primary rounded-full"
          >
            {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
          </button>
        </div>
      </div>
      <Swiper
        modules={[Navigation]}
        navigation={{
          clickable: true,
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        spaceBetween={40}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
        }}
        className="w-full "
      >
        {data?.map((category, index) => {
          return (
            <SwiperSlide className="" key={index}>
              <div className=" rounded-lg ">
                <Link to={`/news-by-category`} className="">
                  <img
                    src={category?.image}
                    alt={category?.title}
                    className=" rounded-full max-w-1/2 max-h-1/2 object-cover"
                  />
                </Link>
                <h3 className="text-black mt-6 text-lg">{category?.title}</h3>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default NewsCategories;
