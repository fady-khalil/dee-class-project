import React from "react";
import { Sparkle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
const ForYouTab = ({
  activeCategorySlug,
  handleForYouClick,
  renderPillIndicator,
}) => {
  const { t } = useTranslation();
  return (
    <button
      className={`group relative w-full flex items-center gap-3 p-3 mb-1 rounded-xl transition-all duration-300 ${
        activeCategorySlug === "for-you"
          ? "text-primary"
          : "text-white hover:text-primary"
      }`}
      onClick={handleForYouClick}
    >
      {renderPillIndicator(activeCategorySlug === "for-you")}
      <div
        className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${
          activeCategorySlug === "for-you"
            ? "bg-primary/20 text-primary"
            : "bg-lightGrey/20 text-white group-hover:text-primary group-hover:bg-primary/10"
        } transition-all duration-300`}
      >
        <Sparkle
          weight={activeCategorySlug === "for-you" ? "fill" : "regular"}
          size={16}
        />
      </div>
      <span className="z-10 font-medium">{t("general.for_you")}</span>
    </button>
  );
};

export default ForYouTab;
