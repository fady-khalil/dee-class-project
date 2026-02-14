import { useTranslation } from "react-i18next";
import { useContext, useRef, useState, useEffect } from "react";

import { CategoriesContext } from "Context/General/CategoriesContext";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import BASE_URL from "Utilities/BASE_URL";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=600&fit=crop",
];

const getCategoryImage = (category, index) => {
  if (category.image) return `${BASE_URL.replace("/api", "")}/${category.image}`;
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
};

const CategorySlider = () => {
  const { categories } = useContext(CategoriesContext);
  const { t, i18n } = useTranslation();

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Staggered entrance — observe section
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl lg:text-4xl text-white font-bold">
          {t("general.categories")}
        </h2>
        <div className="flex items-center gap-x-2">
          <button
            ref={prevRef}
            className="slider-arrow flex items-center justify-center bg-black text-xl text-primary border border-white/20 rounded-full p-1.5 hover:bg-white/10 transition-colors"
          >
            {i18n.language === "ar" ? <CaretRight /> : <CaretLeft />}
          </button>
          <button
            ref={nextRef}
            className="slider-arrow flex items-center justify-center bg-black text-xl text-primary border border-white/20 rounded-full p-1.5 hover:bg-white/10 transition-colors"
          >
            {i18n.language === "ar" ? <CaretLeft /> : <CaretRight />}
          </button>
        </div>
      </div>

      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        spaceBetween={16}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        breakpoints={{
          0: { slidesPerView: 2.2 },
          640: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4.2 },
          1280: { slidesPerView: 5.2 },
        }}
        modules={[Navigation]}
      >
        {categories?.map((cat, index) => (
          <SwiperSlide key={cat._id || index}>
            <Link
              to="/categories"
              state={{ slug: cat.slug }}
              className="group block"
            >
              <div
                className={`category-card category-card-enter relative overflow-hidden rounded-2xl aspect-[2/3] border border-white/10 shadow-lg ${isVisible ? "is-visible" : ""}`}
                style={isVisible ? { animationDelay: `${index * 80}ms` } : undefined}
              >
                <img
                  src={getCategoryImage(cat, index)}
                  alt={cat.title || cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                {cat.status === "coming_soon" ? (
                  <>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[2]" />
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
                      <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-lg">
                        {cat.title || cat.name}
                      </h3>
                      <span className="coming-soon-badge text-white text-[10px] sm:text-xs font-bold uppercase px-4 py-1.5 rounded-full tracking-widest">
                        {t("general.coming_soon")}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-[1]">
                    <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-lg">
                      {cat.title || cat.name}
                    </h3>
                    <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                      {cat.courseCount || 0} {t("search.courses")}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default CategorySlider;
