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

// Get thumbnail URL
const getCourseThumbnail = (course) => {
  if (course?.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
  if (course?.thumbnail) return course.thumbnail;
  if (course?.image) return `${BASE_URL.replace("/api", "")}/${course.image}`;
  return null;
};

const Hero = ({ courses, hero }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const swiperRef = useRef(null);
  const { isLoggedIn, isVerified, isAuthenticated, allowedCourses } = useContext(LoginAuthContext);

  // Determine button text and action based on user state
  const getButtonConfig = () => {
    if (!isLoggedIn) {
      return {
        text: t("buttons.begin_journey") || t("buttons.register_now"),
        action: () => navigate("/register"),
      };
    } else if (!isVerified) {
      return {
        text: t("general.verify_email") || "Verify Email",
        action: () => navigate("/verify-email"),
      };
    } else if (isAuthenticated || allowedCourses?.length > 0) {
      return {
        text: t("buttons.check_my_courses") || "Check My Courses",
        action: () => navigate("/my-courses"),
      };
    } else {
      return {
        text: t("general.finish_sign_up") || "Get a Plan",
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
    <div className="relative min-h-0 lg:h-screen overflow-hidden bg-black" style={{
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
            <div className="relative flex gap-4 h-screen overflow-hidden">
              {/* Top fade — hides images behind header */}
              <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none" />
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
                          getCourseThumbnail(course)
                        }
                        alt={course.name}
                        className="w-full h-full object-cover" loading="lazy"
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

              {/* Column 2 - Scrolling up (slower, slight offset) */}
              <div className="flex-1 overflow-hidden mt-8">
                <div className={`flex flex-col gap-4 ${isPaused ? '' : 'animate-scroll-up-slow'}`}>
                  {column2Images.map((course, index) => (
                    <div
                      key={`col2-${course.id}-${index}`}
                      className="relative rounded-xl overflow-hidden aspect-[3/4] flex-shrink-0"
                    >
                      <img
                        src={
                          getCourseThumbnail(course)
                        }
                        alt={course.name}
                        className="w-full h-full object-cover" loading="lazy"
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
      <div className="lg:hidden flex flex-col justify-center relative z-10 py-28">
        <Container>
          {/* Title section */}
          <div className="text-center mb-8">
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
                      src={getCourseThumbnail(course)}
                      alt={course.name}
                      className="w-full h-full object-cover" loading="lazy"
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
        className="absolute bottom-8 right-8 z-20 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200 text-white"
        aria-label={isPaused ? "Play" : "Pause"}
      >
        {isPaused ? <Play size={24} weight="fill" /> : <Pause size={24} weight="fill" />}
      </button>

    </div>
  );
};

export default Hero;
