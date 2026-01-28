import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkle,
  CaretRight,
  CaretDown,
  Compass,
  SquareHalf,
  CaretLeft,
  ArrowLeft,
  ArrowRight,
} from "@phosphor-icons/react";
import Container from "Components/Container/Container";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const CategoriesTabs = ({
  categories,
  activeCategorySlug,
  setActiveCategorySlug,
  isAuthenticated,
}) => {
  const { t, i18n } = useTranslation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  // Handle scroll effect for desktop sidebar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = (category) => {
    // If clicking the already active category, deselect it (show all)
    if (activeCategorySlug === category.slug) {
      setActiveCategorySlug(undefined);
    } else {
      setActiveCategorySlug(category.slug);
    }
    if (showMobileMenu) setShowMobileMenu(false);
  };

  // Add handler for "For You" tab click
  const handleForYouClick = () => {
    // Use a special slug for the "For You" tab
    const forYouSlug = "for-you";
    if (activeCategorySlug === forYouSlug) {
      setActiveCategorySlug(undefined);
    } else {
      setActiveCategorySlug(forYouSlug);
    }
    if (showMobileMenu) setShowMobileMenu(false);
  };

  // Get active category name or default text
  const activeCategoryName =
    activeCategorySlug !== undefined && categories[activeCategorySlug]
      ? categories[activeCategorySlug].name
      : activeCategorySlug === "for-you"
      ? t("general.for_you")
      : t("navigation.all_categories");

  // Custom pill indicator animation
  const renderPillIndicator = (isActive) => (
    <span
      className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out ${
        isActive ? "bg-primary/20 scale-100" : "bg-transparent scale-0"
      }`}
    />
  );

  return (
    <>
      {/* Mobile dropdown - modern floating UI approach */}
      <div className="xl:hidden w-full mb-8 col-span-12 px-4">
        <div className={`relative z-[100] ${showMobileMenu ? "pb-4" : ""}`}>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ease-in-out ${
              showMobileMenu
                ? "bg-darkGrey shadow-lg"
                : "bg-darkGrey/80 shadow-md hover:shadow-lg"
            }`}
            aria-expanded={showMobileMenu}
            aria-label="Category menu"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  activeCategorySlug
                    ? "bg-primary text-white"
                    : "bg-lightGrey/30 text-white"
                }`}
              >
                {activeCategorySlug === "for-you" ? (
                  <Sparkle weight="fill" size={16} />
                ) : (
                  <Compass weight="bold" size={16} />
                )}
              </div>
              <span className="font-medium text-white">
                {activeCategoryName}
              </span>
            </div>
            <div
              className={`transition-all duration-300 ${
                showMobileMenu ? "rotate-180 text-primary" : "text-white"
              }`}
            >
              <CaretDown weight="bold" size={20} />
            </div>
          </button>

          {/* Mobile menu - Animated dropdown with elegant design */}
          {showMobileMenu && (
            <div className="absolute max-h-[70vh] left-0 right-0 mt-2 overflow-hidden rounded-2xl bg-darkGrey shadow-xl animate-fadeIn">
              <div
                className="p-2 max-h-[70vh] overflow-y-auto scrollbar-thin
              [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent] 
              [&::-webkit-scrollbar]:w-1.5 
              [&::-webkit-scrollbar-track]:bg-transparent 
              [&::-webkit-scrollbar-thumb]:bg-white/10 
              [&::-webkit-scrollbar-thumb]:rounded-full 
              [&::-webkit-scrollbar-thumb:hover]:bg-white/20
              [&::-webkit-scrollbar]:absolute"
              >
                {/* For You tab */}
                {isAuthenticated && (
                  <button
                    className={`group relative w-full flex items-center gap-3 p-3 mb-1 rounded-xl transition-all duration-300 ${
                      activeCategorySlug === "for-you"
                        ? "text-primary"
                        : "text-white hover:text-primary"
                    }`}
                    onClick={handleForYouClick}
                  >
                    {renderPillIndicator(activeCategorySlug === "for-you")}
                    <div
                      className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                        activeCategorySlug === "for-you"
                          ? "bg-primary/20 text-primary"
                          : "bg-lightGrey/20 text-white group-hover:text-primary group-hover:bg-primary/10"
                      } transition-all duration-300`}
                    >
                      <Sparkle
                        weight={
                          activeCategorySlug === "for-you" ? "fill" : "regular"
                        }
                        size={16}
                      />
                    </div>
                    <span className="z-10 font-medium">
                      {t("general.for_you")}
                    </span>
                  </button>
                )}

                {/* Divider */}
                {isAuthenticated && categories?.length > 0 && (
                  <div className="mx-3 my-3 h-px bg-lightGrey/20"></div>
                )}

                {/* Category Items */}
                <div className="space-y-1">
                  {categories?.map((category, index) => (
                    <button
                      key={index}
                      className={`group relative w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        activeCategorySlug === category.slug
                          ? "text-primary"
                          : "text-white hover:text-primary"
                      }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {renderPillIndicator(
                        activeCategorySlug === category.slug
                      )}
                      <div
                        className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                          activeCategorySlug === category.slug
                            ? "bg-primary/20 text-primary"
                            : "bg-lightGrey/20 text-white group-hover:text-primary group-hover:bg-primary/10"
                        } transition-all duration-300`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-sm ${
                            activeCategorySlug === category.slug
                              ? "bg-primary"
                              : "bg-white/70 group-hover:bg-primary/80"
                          } transition-all duration-300`}
                        ></div>
                      </div>
                      <span className="z-10 font-medium">{category.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Categories Slider - Swiper Implementation */}
      <div className="hidden xl:block col-span-12 mb-8">
        <Container>
          <div className="bg-darkGrey rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl text-white font-bold flex items-center gap-2">
                <Compass weight="bold" size={22} className="text-primary" />
                <span>{t("general.explore")}</span>
              </h2>

              <div className="flex items-center gap-x-2">
                <button
                  ref={prevRef}
                  className="flex items-center justify-center bg-black/40 text-white hover:text-primary border border-white/10 rounded-full w-8 h-8 transition-colors duration-300"
                >
                  {i18n.language === "ar" ? (
                    <CaretRight size={18} />
                  ) : (
                    <CaretLeft size={18} />
                  )}
                </button>
                <button
                  ref={nextRef}
                  className="flex items-center justify-center bg-black/40 text-white hover:text-primary border border-white/10 rounded-full w-8 h-8 transition-colors duration-300"
                >
                  {i18n.language === "ar" ? (
                    <CaretLeft size={18} />
                  ) : (
                    <CaretRight size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              {i18n.language === "ar" && (
                <div className="absolute top-0 left-0 z-[10] h-full w-[80px] bg-gradient-to-r from-darkGrey to-transparent pointer-events-none"></div>
              )}

              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                spaceBetween={16}
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
                className="categories-swiper"
              >
                {/* For You Slide */}
                {isAuthenticated && (
                  <SwiperSlide className="!w-[160px]">
                    <button
                      className="w-full transition-all duration-300"
                      onClick={handleForYouClick}
                    >
                      <div
                        className={`flex flex-col items-center justify-center p-4 rounded-xl ${
                          activeCategorySlug === "for-you"
                            ? "bg-primary"
                            : "bg-lightGrey/20 hover:bg-lightGrey/40"
                        } transition-all duration-300 h-[140px]`}
                      >
                        <div
                          className={`flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                            activeCategorySlug === "for-you"
                              ? "bg-white/20"
                              : "bg-lightGrey/30"
                          } transition-all duration-300`}
                        >
                          <Sparkle
                            weight={
                              activeCategorySlug === "for-you"
                                ? "fill"
                                : "regular"
                            }
                            size={30}
                            className={
                              activeCategorySlug === "for-you"
                                ? "text-white"
                                : "text-white/80"
                            }
                          />
                        </div>
                        <span
                          className={`text-sm font-medium text-center ${
                            activeCategorySlug === "for-you"
                              ? "text-white"
                              : "text-white/80"
                          }`}
                        >
                          {t("general.for_you")}
                        </span>
                      </div>
                    </button>
                  </SwiperSlide>
                )}

                {/* Category Slides */}
                {categories?.map((category, index) => (
                  <SwiperSlide key={index} className="!w-[160px]">
                    <button
                      className="w-full transition-all duration-300"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div
                        className={`flex flex-col items-center justify-center p-4 rounded-xl ${
                          activeCategorySlug === category.slug
                            ? "bg-primary"
                            : "bg-lightGrey/20 hover:bg-lightGrey/40"
                        } transition-all duration-300 h-[140px]`}
                      >
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                            activeCategorySlug === category.slug
                              ? "bg-white/20"
                              : "bg-lightGrey/30"
                          } transition-all duration-300`}
                        >
                          {category.icon ? (
                            <img
                              src={category.icon}
                              alt={category.title}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-sm ${
                                activeCategorySlug === category.slug
                                  ? "bg-white"
                                  : "bg-white/60"
                              } transition-all duration-300`}
                            ></div>
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium text-center ${
                            activeCategorySlug === category.slug
                              ? "text-white"
                              : "text-white/80"
                          }`}
                        >
                          {category.title}
                        </span>
                      </div>
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Right overlay gradient */}
              {i18n.language === "en" && (
                <div className="absolute top-0 right-0 z-[10] h-full w-[80px] bg-gradient-to-l from-darkGrey to-transparent pointer-events-none"></div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default CategoriesTabs;
