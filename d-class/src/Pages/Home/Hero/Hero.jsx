import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Container from "Components/Container/Container";
import backgroud from "assests/bghomd.png";
import { useTranslation } from "react-i18next";
import { Play, Pause } from "@phosphor-icons/react";
import BASE_URL from "Utilities/BASE_URL";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

const Hero = ({ courses, hero }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const swiperRef = useRef(null);
  const { isLoggedIn, allowedCourses } = useContext(LoginAuthContext);

  // Determine button text and action based on user state
  const getButtonConfig = () => {
    if (!isLoggedIn) {
      // Not logged in → Register page
      return {
        text: t("buttons.begin_journey") || t("buttons.register_now"),
        action: () => navigate("/register"),
      };
    } else if (allowedCourses?.length > 0) {
      // Logged in with courses → My Courses page
      return {
        text: t("buttons.check_my_courses") || "Check My Courses",
        action: () => navigate("/my-courses"),
      };
    } else {
      // Logged in, no courses → Plans page
      return {
        text: t("buttons.begin_journey") || t("buttons.register_now"),
        action: () => navigate("/plans"),
      };
    }
  };

  const buttonConfig = getButtonConfig();

  // Split courses into 2 columns for desktop
  const column1 = courses?.filter((_, index) => index % 2 === 0) || [];
  const column2 = courses?.filter((_, index) => index % 2 !== 0) || [];

  // Duplicate for seamless infinite scroll
  const column1Images = [...column1, ...column1, ...column1];
  const column2Images = [...column2, ...column2, ...column2];


  console.log(hero)

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    // Also control swiper autoplay
    if (swiperRef.current?.swiper) {
      if (!isPaused) {
        swiperRef.current.swiper.autoplay.stop();
      } else {
        swiperRef.current.swiper.autoplay.start();
      }
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-black" style={{
      backgroundImage: `url(${backgroud})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      // backgroundOpacity: '0.3',  
    }}>

    
       

      {/* Desktop Layout */}
      <div className="hidden lg:block h-full">
        <Container className="h-full">
          <div className="grid grid-cols-2 gap-8 h-screen items-center relative z-10">
            {/* Left side - Title */}
            <div className="flex flex-col justify-center items-start px-4 lg:px-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                {hero?.title }
              </h1>
              <p className="text-lg text-gray-300 mt-4 max-w-md whitespace-pre-line">
                {hero?.text}
              </p>
              <button
                onClick={buttonConfig.action}
                className="mt-8 px-8 py-3 bg-primary hover:bg-darkPrimary text-white font-semibold rounded-lg transition duration-200"
              >
                {buttonConfig.text}
              </button>
            </div>

            {/* Right side - Infinite scrolling images */}
            <div className="flex gap-4 h-screen overflow-hidden py-8">
              {/* Column 1 - Scrolling up */}
              <div className="flex-1 overflow-hidden">
                <div className={`flex flex-col gap-4 ${isPaused ? '' : 'animate-scroll-up'}`}>
                  {column1Images.map((course, index) => (
                    <div
                      key={`col1-${course.id}-${index}`}
                      className="relative rounded-xl overflow-hidden aspect-[3/4] flex-shrink-0"
                    >
                      <img
                        src={
                          course?.trailer?.assets?.thumbnail ||
                          (course?.image ? `${BASE_URL}/${course.image}` : null)
                        }
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {course.name}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2 - Scrolling up (slower or offset) */}
              <div className="flex-1 overflow-hidden mt-20">
                <div className={`flex flex-col gap-4 ${isPaused ? '' : 'animate-scroll-up-slow'}`}>
                  {column2Images.map((course, index) => (
                    <div
                      key={`col2-${course.id}-${index}`}
                      className="relative rounded-xl overflow-hidden aspect-[3/4] flex-shrink-0"
                    >
                      <img
                        src={
                          course?.trailer?.assets?.thumbnail ||
                          (course?.image ? `${BASE_URL}/${course.image}` : null)
                        }
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {course.name}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden h-full flex flex-col justify-center relative z-10">
        <Container>
          {/* Title section */}
          <div className="text-center mb-8 pt-20">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              {hero?.title || t("home.title")}
            </h1>
            <p className="text-base text-gray-300 mt-4 max-w-md mx-auto whitespace-pre-line">
              {hero?.text || t("general.register_now_message")}
            </p>
          </div>

          {/* Mobile Course Slider */}
          <div className="relative mobile-hero-slider">
            <Swiper
              ref={swiperRef}
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={true}
              loop={courses?.length > 2}
              slidesPerView={"auto"}
              speed={1200}
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
                delay: 6000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              modules={[EffectCoverflow, Pagination, Autoplay]}
              className="hero-mobile-slider"
            >
              {courses?.map((course, index) => (
                <SwiperSlide key={`mobile-${course.id}-${index}`} className="hero-mobile-slide">
                  <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
                    <img
                      src={
                        course?.trailer?.assets?.thumbnail ||
                        (course?.image ? `${BASE_URL}/${course.image}` : null)
                      }
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-base line-clamp-2">
                        {course.name}
                      </h3>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8 pb-8">
            <button
              onClick={buttonConfig.action}
              className="px-8 py-3 bg-primary hover:bg-darkPrimary text-white font-semibold rounded-lg transition duration-200"
            >
              {buttonConfig.text}
            </button>
          </div>
        </Container>
      </div>

      {/* Pause/Play button at bottom right */}
      <button
        onClick={handlePauseToggle}
        className="absolute bottom-8 right-8 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 text-white"
        aria-label={isPaused ? "Play" : "Pause"}
      >
        {isPaused ? <Play size={24} weight="fill" /> : <Pause size={24} weight="fill" />}
      </button>

      {/* CSS for animations and slider */}
      <style>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-33.33%);
          }
        }

        @keyframes scroll-up-slow {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-33.33%);
          }
        }

        .animate-scroll-up {
          animation: scroll-up 40s linear infinite;
        }

        .animate-scroll-up-slow {
          animation: scroll-up-slow 50s linear infinite;
        }

        .hero-mobile-slider {
          padding-bottom: 40px;
        }

        .hero-mobile-slide {
          width: 240px;
          transition: transform 0.3s ease;
        }

        .hero-mobile-slide:not(.swiper-slide-active)::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 0.75rem;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .hero-mobile-slider .swiper-pagination-bullet {
          background: transparent;
          border: 1px solid white;
          opacity: 1;
        }

        .hero-mobile-slider .swiper-pagination-bullet-active {
          background: white;
          border: 1px solid white;
        }
      `}</style>
    </div>
  );
};

export default Hero;
