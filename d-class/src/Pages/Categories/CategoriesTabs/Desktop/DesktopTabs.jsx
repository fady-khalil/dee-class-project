import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import Header from "./Components/Header";
import CategoryItems from "./Components/CategoryItems";
import ForYouTab from "./Components/ForYouTab";
const DesktopTabs = ({
  categories,
  activeCategorySlug,
  handleForYouClick,
  handleCategoryClick,
}) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useContext(LoginAuthContext);
  const big = [...categories, ...categories, ...categories];
  return (
    <div
      className={`hidden xl:block col-span-3 sticky top-4 transition-all duration-500 ease-in-out h-[calc(100vh-4rem)]`}
    >
      <div
        className={`overflow-hidden bg-gradient-to-br from-grey/90 to-darkGrey h-max shadow-xl ${
          i18n.language === "ar" ? "rounded-l-3xl" : "rounded-r-3xl"
        } transition-all duration-500 `}
      >
        <Header />

        {/* Categories list with hover effects */}
        <div
          className="pt-3 pb-10 max-h-[calc(85vh-10rem)] overflow-y-auto scrollbar-thin 
    [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent] 
    [&::-webkit-scrollbar]:w-1.5 
    [&::-webkit-scrollbar-track]:bg-transparent 
    [&::-webkit-scrollbar-thumb]:bg-white/10 
    [&::-webkit-scrollbar-thumb]:rounded-full 
    [&::-webkit-scrollbar-thumb:hover]:bg-white/20
    [&::-webkit-scrollbar]:absolute"
        >
          {/* For You tab with animation */}
          {isAuthenticated && (
            <ForYouTab
              activeCategorySlug={activeCategorySlug}
              handleForYouClick={handleForYouClick}
            />
          )}

          {/* Divider with label */}
          {isAuthenticated && categories?.length > 0 && (
            <div className="px-6 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-grow bg-white/10"></div>
                <span className="text-sm font-medium text-lightWhite">
                  {t("general.categories")}
                </span>
                <div className="h-px flex-grow bg-white/10"></div>
              </div>
            </div>
          )}

          {/* Categories items */}
          <CategoryItems
            categories={categories}
            activeCategorySlug={activeCategorySlug}
            handleCategoryClick={handleCategoryClick}
          />
        </div>
      </div>
    </div>
  );
};

export default DesktopTabs;
