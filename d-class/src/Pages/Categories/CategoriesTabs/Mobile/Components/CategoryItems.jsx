import React from "react";
import { useTranslation } from "react-i18next";

const CategoryItems = ({
  categories,
  activeCategorySlug,
  handleCategoryClick,
  renderPillIndicator,
}) => {
  const { t } = useTranslation();
  const isComingSoon = (cat) => cat.status === "coming_soon";
  return (
    <div className="space-y-1">
      {categories?.map((category, index) => (
        <button
          key={index}
          className={`group relative w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isComingSoon(category)
              ? "text-white/40 cursor-default"
              : activeCategorySlug === category.slug
              ? "text-primary"
              : "text-white hover:text-primary"
          }`}
          onClick={() => !isComingSoon(category) && handleCategoryClick(category)}
        >
          {!isComingSoon(category) && renderPillIndicator(activeCategorySlug === category.slug)}
          <span className="z-10 font-medium">{category.title}</span>
          {isComingSoon(category) && (
            <span className="z-10 text-[10px] uppercase tracking-wider font-semibold border border-primary/50 text-primary/70 px-2 py-0.5 rounded-full">
              {t("general.coming_soon", "Soon")}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryItems;
