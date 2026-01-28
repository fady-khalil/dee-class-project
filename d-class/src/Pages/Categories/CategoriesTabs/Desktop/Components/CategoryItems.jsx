import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
const CategoryItems = ({
  categories,
  activeCategorySlug,
  handleCategoryClick,
}) => {
  const { t, i18n } = useTranslation();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  return (
    <div className="px-3 space-y-2">
      {categories?.map((category, index) => (
        <button
          key={index}
          className={`group relative w-full  transition-all duration-300 ${
            activeCategorySlug === category.slug
              ? "text-white"
              : "text-white/70 hover:text-white"
          }`}
          onClick={() => handleCategoryClick(category)}
          onMouseEnter={() => setHoveredCategory(category.slug)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div
            className={`relative flex items-center p-3 overflow-hidden rounded-xl ${
              activeCategorySlug === category.slug
                ? "bg-primary"
                : hoveredCategory === category.slug
                ? "bg-lightGrey/40"
                : ""
            } transition-all duration-300`}
          >
            <div className="flex items-center">
              <span className="font-medium tracking-wide">{category.title}</span>
            </div>

            {/* Right indicator */}
            <div
              className={`absolute ${
                i18n.language === "ar" ? "left-3" : "right-3"
              }  transition-all duration-300 ${
                activeCategorySlug === category.slug
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
      ))}
    </div>
  );
};

export default CategoryItems;
