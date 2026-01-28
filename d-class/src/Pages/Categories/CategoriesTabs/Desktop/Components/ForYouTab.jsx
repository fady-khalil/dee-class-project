import React, { useState } from "react";
import { Sparkle, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
const ForYouTab = ({ activeCategorySlug, handleForYouClick }) => {
  const { t, i18n } = useTranslation();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  return (
    <div className="px-3 my-1.5">
      <button
        className={`group relative w-full  transition-all duration-300 ${
          activeCategorySlug === "for-you"
            ? "text-white"
            : "text-white/80 hover:text-white"
        }`}
        onClick={handleForYouClick}
        onMouseEnter={() => setHoveredCategory("for-you")}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div
          className={`relative flex items-center p-3 overflow-hidden rounded-xl ${
            activeCategorySlug === "for-you"
              ? "bg-primary"
              : hoveredCategory === "for-you"
              ? "bg-lightGrey/20"
              : ""
          } transition-all duration-300`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                activeCategorySlug === "for-you"
                  ? "bg-white/40"
                  : "bg-lightGrey/40 group-hover:bg-primary/20"
              } transition-all duration-300`}
            >
              <Sparkle
                weight={activeCategorySlug === "for-you" ? "fill" : "regular"}
                size={16}
                className={`transition-colors duration-300 ${
                  activeCategorySlug === "for-you"
                    ? "text-white"
                    : "text-white/80 group-hover:text-primary"
                }`}
              />
            </div>
            <span className="font-medium tracking-wide">
              {t("general.for_you")}
            </span>
          </div>

          {/* Right indicator */}
          <div
            className={`absolute ${
              i18n.language === "ar" ? "left-3" : "right-3"
            } transition-all duration-300 ${
              activeCategorySlug === "for-you"
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2"
            }`}
          >
            {i18n.language === "ar" ? (
              <CaretLeft weight="bold" size={16} />
            ) : (
              <CaretRight weight="bold" size={16} />
            )}
          </div>
        </div>
      </button>
    </div>
  );
};

export default ForYouTab;
