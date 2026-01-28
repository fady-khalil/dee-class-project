import React from "react";
import { Sparkle, Compass, CaretDown } from "@phosphor-icons/react";
const TabsButton = ({
  showMobileMenu,
  setShowMobileMenu,
  activeCategorySlug,
  activeCategoryName,
}) => {
  return (
    <button
      onClick={() => setShowMobileMenu(!showMobileMenu)}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ease-in-out ${
        showMobileMenu
          ? "bg-darkGrey shadow-lg"
          : "bg-darkGrey/80 shadow-md hover:shadow-lg"
      }`}
      aria-expanded={showMobileMenu}
      aria-label="Category menu"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            activeCategorySlug
              ? "bg-primary text-white"
              : "bg-lightGrey/30 text-white"
          }`}
        >
          {activeCategorySlug === "for-you" ? (
            <Sparkle weight="fill" size={16} />
          ) : (
            <Compass weight="bold" size={16} />
          )}
        </div>
        <span className="font-medium text-white">{activeCategoryName}</span>
      </div>
      <div
        className={`transition-all duration-300 ${
          showMobileMenu ? "rotate-180 text-primary" : "text-white"
        }`}
      >
        <CaretDown weight="bold" size={20} />
      </div>
    </button>
  );
};

export default TabsButton;
