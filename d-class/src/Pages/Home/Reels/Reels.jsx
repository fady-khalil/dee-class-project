import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import ReelContainer from "./components/ReelContainer";
import Container from "Components/Container/Container";
import backgroud from "assests/bghomd.png";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";

const Reels = ({ trending }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, isVerified, isAuthenticated, allowedCourses } =
    useContext(LoginAuthContext);

  const getButtonConfig = () => {
    if (!isLoggedIn) {
      return { text: t("navigation.sign_up"), action: () => navigate("/register") };
    } else if (!isVerified) {
      return { text: t("general.verify_email") || "Verify Email", action: () => navigate("/verify-email") };
    } else if (isAuthenticated || allowedCourses?.length > 0) {
      return { text: t("buttons.check_my_courses") || "Check My Courses", action: () => navigate("/my-courses") };
    } else {
      return { text: t("general.finish_sign_up") || "Get a Plan", action: () => navigate("/plans") };
    }
  };

  const buttonConfig = getButtonConfig();
  const reelsData = trending?.reels || [];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
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

  if (!reelsData || reelsData.length === 0) return null;

  return (
    <section className="relative overflow-hidden" id="reels-section">
      {/* Background image — desktop only */}
      <div className="absolute inset-0">
        <img
          src={backgroud}
          alt="background"
          className="w-full h-full hidden lg:block"
        />
      </div>

      {/* Desktop Layout — side by side */}
      <div className="hidden lg:block relative z-10">
        <div className="container mx-auto px-4 flex flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <div className="mb-16">
              <h2 className="text-start text-6xl uppercase font-bold text-white mb-4 drop-shadow-lg">
                {trending?.title || t("home.featured_reels")}
              </h2>
              <p className="text-start text-base text-gray-300 max-w-2xl whitespace-pre-line">
                {trending?.text || t("home.reels_description")}
              </p>
              <div className="mt-10 flex flex-row items-center gap-4">
                <button
                  onClick={buttonConfig.action}
                  className="bg-primary hover:bg-darkPrimary text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
                >
                  {buttonConfig.text}
                </button>
                <button
                  onClick={() => navigate("/categories")}
                  className="border border-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-darkPrimary transition-colors duration-300"
                >
                  {t("general.view_all_categories")}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="w-3/4 mx-auto">
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
      </div>

      {/* Mobile Layout — stacked, contained */}
      <div className="lg:hidden relative z-10">
        <Container>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl uppercase font-bold text-white mb-3 drop-shadow-lg">
              {trending?.title || t("home.featured_reels")}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 whitespace-pre-line">
              {trending?.text || t("home.reels_description")}
            </p>
          </div>

          {/* Reel player — centered, constrained width */}
          <div className="max-w-sm mx-auto">
            <ReelContainer
              reelsData={reelsData}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              isLargeScreen={isLargeScreen}
              scrollToIndex={scrollToIndex}
            />
          </div>

          {/* CTA buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={buttonConfig.action}
              className="w-full sm:w-auto bg-primary hover:bg-darkPrimary text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              {buttonConfig.text}
            </button>
            <button
              onClick={() => navigate("/categories")}
              className="w-full sm:w-auto border border-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-darkPrimary transition-colors duration-300"
            >
              {t("general.view_all_categories")}
            </button>
          </div>
        </Container>
      </div>
    </section>
  );
};

export default Reels;
