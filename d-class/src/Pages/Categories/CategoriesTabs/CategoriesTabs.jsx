import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MobileTabs from "./Mobile/MobileTabs";
import DesktopTabs from "./Desktop/DesktopTabs";
const CategoriesTabs = ({
  categories,
  activeCategorySlug,
  setActiveCategorySlug,
}) => {
  const { t } = useTranslation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleCategoryClick = (category) => {
    // If clicking the already active category, deselect it (show all)
    if (activeCategorySlug === category.slug) {
      setActiveCategorySlug(undefined);
    } else {
      setActiveCategorySlug(category.slug);
    }
    if (showMobileMenu) setShowMobileMenu(false);
  };

  // Add handler for "For You" tab click
  const handleForYouClick = () => {
    // Use a special slug for the "For You" tab
    const forYouSlug = "for-you";
    if (activeCategorySlug === forYouSlug) {
      setActiveCategorySlug(undefined);
    } else {
      setActiveCategorySlug(forYouSlug);
    }
    if (showMobileMenu) setShowMobileMenu(false);
  };

  // Get active category name or default text
  const activeCategory = categories?.find(cat => cat.slug === activeCategorySlug);
  const activeCategoryName =
    activeCategorySlug !== undefined && activeCategory
      ? activeCategory.title
      : activeCategorySlug === "for-you"
      ? t("general.for_you")
      : t("navigation.all_categories");

  // Custom pill indicator animation
  const renderPillIndicator = (isActive) => (
    <span
      className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out ${
        isActive ? "bg-primary/20 scale-100" : "bg-transparent scale-0"
      }`}
    />
  );

  const big = [
    ...categories,
    ...categories,
    ...categories,
    ...categories,
    ...categories,
    ...categories,
  ];

  return (
    <>
      {/* Mobile dropdown - modern floating UI approach */}
      <MobileTabs
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        setActiveCategorySlug={setActiveCategorySlug}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        activeCategoryName={activeCategoryName}
        handleForYouClick={handleForYouClick}
        handleCategoryClick={handleCategoryClick}
        renderPillIndicator={renderPillIndicator}
      />

      {/* Desktop sidebar - Creative modern design */}
      <DesktopTabs
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        handleForYouClick={handleForYouClick}
        handleCategoryClick={handleCategoryClick}
      />
    </>
  );
};

export default CategoriesTabs;
