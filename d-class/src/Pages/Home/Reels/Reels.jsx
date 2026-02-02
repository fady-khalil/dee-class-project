import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ReelLoader from "./components/ReelLoader";
import ReelContainer from "./components/ReelContainer";
import backgroud from "assests/bghomd.png";
import { Link } from "react-router-dom";

const Reels = ({ trending }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Get reels data from trending prop
  const reelsData = trending?.reels || [];

  // Replace Intersection Observer with a simpler scroll event
  useEffect(() => {
    if (!sectionRef.current) return;

    // Function to check if element is in viewport
    const isElementInViewport = (el) => {
      const rect = el.getBoundingClientRect();
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;

      // Check if element is at least 30% visible
      const visibleHeight =
        Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const elementHeight = rect.bottom - rect.top;
      const visiblePercentage = (visibleHeight / elementHeight) * 100;

      return visiblePercentage >= 30;
    };

    // Function to handle scroll event
    const handleScroll = () => {
      if (isElementInViewport(sectionRef.current) && !isInView) {
        setIsInView(true);

        // Calculate position to scroll to (center of viewport)
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const centerPosition =
          scrollTop + rect.top - window.innerHeight / 2 + rect.height / 2;

        // Smoothly scroll to center
        window.scrollTo({
          top: centerPosition,
          behavior: "smooth",
        });

        // Remove scroll listener after centering
        window.removeEventListener("scroll", handleScroll);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Check initial position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isInView]);

  // Check for screen size for navigation buttons
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    // Initial check
    checkScreenSize();

    // Add listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const scrollToIndex = (index) => {
    const reelContainer = document.querySelector(".reel-item");
    if (reelContainer) {
      const itemHeight = reelContainer.offsetHeight;
      document.querySelector(".scrollbar-hide").scrollTo({
        top: index * itemHeight,
        behavior: "smooth",
      });
    }
  };

  // Don't render if no reels data
  if (!reelsData || reelsData.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-8 sm:py-10 lg:py-14 relative overflow-hidden"
      id="reels-section"
    >
      {/* Simplified background with two colors */}
      <div className="absolute  inset-0">
        <img
          src={backgroud}
          alt="background"
          className="w-full h-full hidden lg:block"
        />
      </div>

      <div className="container mx-auto lg:px-4 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        <div className="flex-1 w-full">
          <motion.div
            className="text-center lg:text-left mb-8 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-6xl uppercase font-bold text-white mb-4 drop-shadow-lg">
              {trending?.title || t("home.featured_reels")}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto lg:mx-0 whitespace-pre-line">
              {trending?.text || t("home.reels_description")}
            </p>

            <div className="mt-10 flex flex-col lg:flex-row items-center gap-4">
              <Link
                to={"/plans"}
                className="text-white bg-primary px-4 py-2 rounded-md hover:bg-darkPrimary transition-all duration-300 "
              >
                {t("courses.join_to_watch")}
              </Link>
              <Link
                to={"/categories"}
                className="text-white border border-primary px-4 py-2 rounded-md hover:bg-darkPrimary transition-all duration-300 "
              >
                {t("general.view_all_categories")}
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 w-full ">
          <div className="lg:w-3/4 lg:mx-auto">
            <ReelContainer
              reelsData={reelsData}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              isLargeScreen={isLargeScreen}
              scrollToIndex={scrollToIndex}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reels;
