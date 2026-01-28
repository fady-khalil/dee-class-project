import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "assests/logos/dclass.png";
import Navigation from "./Components/Navigation";
import Registartion from "./Components/Registartion";
import Search from "./Components/Search";
import LanguageSwitcher from "Components/Button/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { List } from "@phosphor-icons/react";
import Drawer from "./Components/Drawer";
const Header = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const toggleDrawerHandler = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      // Determine visibility based on scroll direction
      const visible = prevScrollPos > currentScrollPos || currentScrollPos < 10;

      // Add scrolled state when not at the top
      const hasScrolled = currentScrollPos > 10;

      setIsVisible(visible);
      setScrolled(hasScrolled);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <>
      <div
        className={`bg-black w-full header_container py-4 flex items-center fixed top-0 left-0 right-0 transition-transform duration-300 z-[1000] ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <header
          className={`pb-2 transition ease-in duration-300 w-full z-[100] ${
            scrolled ? "border-b" : ""
          }`}
        >
          {/* mobile */}
          <div className="flex xl:hidden items-center justify-between flex-1">
            <Link to="/">
              <img className="w-32" src={logo} alt="" />
            </Link>

            <button onClick={toggleDrawerHandler} className="text-white">
              <List size={32} />
            </button>
          </div>

          {/* desktop */}
          <div
            className={`hidden xl:flex items-center justify-between ${
              i18n.language === "ar" ? "gap-x-10" : ""
            }`}
          >
            <div
              className={`flex items-center gap-x-6 ${
                i18n.language === "ar" ? "flex-1" : ""
              }`}
            >
              {i18n.language === "ar" && <LanguageSwitcher />}
              {i18n.language === "en" && (
                <Link to="/">
                  <img className="w-32" src={logo} alt="" />
                </Link>
              )}
              {i18n.language === "en" ? <Navigation /> : <Registartion />}
              {i18n.language === "ar" && <Search />}
            </div>
            {i18n.language === "en" && <Search />}

            <div
              className={`flex items-center ${
                i18n.language === "ar" ? "gap-x-20" : "gap-x-4"
              }`}
            >
              {i18n.language === "en" ? <Registartion /> : <Navigation />}
              {i18n.language === "en" && <LanguageSwitcher />}
              {i18n.language === "ar" && (
                <Link to="/">
                  <img className="w-32" src={logo} alt="" />
                </Link>
              )}
            </div>
          </div>
        </header>

        <Drawer isOpen={isDrawerOpen} onToggle={toggleDrawerHandler} />
      </div>
      {/* Spacer div to compensate for the fixed header - hidden on home page */}
      {!isHomePage && <div className="h-24"></div>}
    </>
  );
};

export default Header;
