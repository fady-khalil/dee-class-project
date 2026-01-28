import React from "react";

const CategoryItems = ({
  categories,
  activeCategorySlug,
  handleCategoryClick,
  renderPillIndicator,
}) => {
  return (
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
          {renderPillIndicator(activeCategorySlug === category.slug)}
          <span className="z-10 font-medium">{category.title}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryItems;
