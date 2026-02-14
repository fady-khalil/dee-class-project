// src/components/LanguageSwitcher.js
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CaretDown, Globe, X, Check } from "@phosphor-icons/react";

const LanguageSwitcher = ({ isDrawer }) => {
  const { i18n, t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n
      .changeLanguage(lng)
      .then(() => {
        localStorage.setItem("language", lng);
        updateDirection(lng);
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error changing language:", err);
      });
  };

  const updateDirection = (lng) => {
    if (lng === "ar") {
      document.body.setAttribute("dir", "rtl");
    } else {
      document.body.removeAttribute("dir");
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Close modal when clicking outside (for desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={modalRef}>
      <button
        onClick={toggleModal}
        className="flex items-center text-white gap-x-2 focus:outline-none hover:opacity-80 transition-opacity duration-200"
      >
        <Globe size={24} weight="light" />
        {isDrawer && <p>{t("labels.switch_language")}</p>}
        <CaretDown
          size={16}
          weight="bold"
          className={`transition-transform duration-200 ${
            isModalOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Desktop dropdown */}
      {isModalOpen && (
        <div
          className="absolute right-0 rtl:right-auto rtl:left-0 mt-3 liquid-glass rounded-xl z-10 hidden xl:block min-w-[180px] overflow-hidden"
        >
          <div className="py-2">
            <h3 className="px-5 pt-2 pb-3 text-sm font-medium text-white border-b glass-divider">
              {t("labels.switch_language")}
            </h3>
            <button
              className={`glass-item flex items-center justify-between w-full px-5 py-3 text-sm text-white ${
                i18n.language === "en" ? "font-medium" : ""
              }`}
              onClick={() => {
                changeLanguage("en");
                toggleModal();
              }}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex w-5 h-5 rounded-full bg-white/10 text-[10px] items-center justify-center text-white/70">
                  EN
                </span>
                <span>English</span>
              </div>
              {i18n.language === "en" && (
                <Check size={18} weight="bold" className="text-primary" />
              )}
            </button>
            <button
              className={`glass-item flex items-center justify-between w-full px-5 py-3 text-sm text-white ${
                i18n.language === "ar" ? "font-medium" : ""
              }`}
              onClick={() => {
                changeLanguage("ar");
                toggleModal();
              }}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex w-5 h-5 rounded-full bg-white/10 text-[10px] items-center justify-center text-white/70">
                  AR
                </span>
                <span>عربي</span>
              </div>
              {i18n.language === "ar" && (
                <Check size={18} weight="bold" className="text-primary" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isModalOpen && (
        <div className={`fixed inset-x-0 bottom-0 z-50 xl:hidden`}>
          <div className="bg-white text-black shadow-lg rounded-t-lg">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="text-lg font-medium">
                {t("labels.switch_language")}
              </h3>
              <button
                onClick={toggleModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-2">
              <button
                className={`flex items-center justify-between w-full px-4 py-3 text-left text-base rounded-md ${
                  i18n.language === "en" ? "bg-gray-100 font-bold" : ""
                }`}
                onClick={() => {
                  changeLanguage("en");
                  toggleModal();
                }}
              >
                <span>English</span>
                {i18n.language === "en" && (
                  <div className="h-4 w-4 rounded-full bg-primary"></div>
                )}
              </button>
              <button
                className={`flex items-center justify-between w-full px-4 py-3 text-right text-base rounded-md ${
                  i18n.language === "ar" ? "bg-gray-100 font-bold" : ""
                }`}
                onClick={() => {
                  changeLanguage("ar");
                  toggleModal();
                }}
              >
                <span>عربي</span>
                {i18n.language === "ar" && (
                  <div className="h-4 w-4 rounded-full bg-primary"></div>
                )}
              </button>
            </div>
          </div>
          <div
            className="bg-black bg-opacity-50 h-full"
            onClick={toggleModal}
          ></div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
