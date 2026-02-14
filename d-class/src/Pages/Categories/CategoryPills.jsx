import { useTranslation } from "react-i18next";
import { Sparkle } from "@phosphor-icons/react";

const CategoryPills = ({
  categories,
  activeCategorySlug,
  setActiveCategorySlug,
  isAuthenticated,
}) => {
  const { t } = useTranslation();
  const isComingSoon = (cat) => cat.status === "coming_soon";

  const handleClick = (slug) => {
    setActiveCategorySlug(activeCategorySlug === slug ? undefined : slug);
  };

  return (
    <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
      {/* For You pill */}
      {isAuthenticated && (
        <button
          onClick={() => handleClick("for-you")}
          className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
            activeCategorySlug === "for-you"
              ? "bg-primary text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          }`}
        >
          <Sparkle
            weight={activeCategorySlug === "for-you" ? "fill" : "regular"}
            size={16}
          />
          {t("general.for_you")}
        </button>
      )}

      {/* Category pills */}
      {categories?.map((category) => (
        <button
          key={category._id || category.slug}
          disabled={isComingSoon(category)}
          onClick={() => !isComingSoon(category) && handleClick(category.slug)}
          className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
            isComingSoon(category)
              ? "cursor-default bg-white/5 text-white/30"
              : activeCategorySlug === category.slug
              ? "bg-primary text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          }`}
        >
          {category.title}
          {isComingSoon(category) && (
            <span className="rounded-full border border-primary/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary/70">
              {t("general.coming_soon", "Soon")}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;
