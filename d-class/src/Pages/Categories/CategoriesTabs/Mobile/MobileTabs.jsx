import React from "react";
import { useTranslation } from "react-i18next";
import TabsButton from "./Components/TabsButton";
import CategoryItems from "./Components/CategoryItems";
import ForYouTab from "./Components/ForYouTab";
import { useContext } from "react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
const MobileTabs = ({
  categories,
  activeCategorySlug,
  showMobileMenu,
  setShowMobileMenu,
  activeCategoryName,
  handleForYouClick,
  handleCategoryClick,
  renderPillIndicator,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(LoginAuthContext);
  return (
    <div className="xl:hidden w-full mb-8 col-span-12 px-4 mt-6">
      <div className={`relative z-[100] ${showMobileMenu ? "pb-4" : ""}`}>
        <TabsButton
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          activeCategorySlug={activeCategorySlug}
          activeCategoryName={activeCategoryName}
        />

        {showMobileMenu && (
          <div className="absolute max-h-[70vh] left-0 right-0 mt-2 overflow-hidden rounded-2xl bg-darkGrey shadow-xl animate-fadeIn">
            <div
              className="p-2 max-h-[70vh] overflow-y-auto scrollbar-thin
        [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent] 
        [&::-webkit-scrollbar]:w-1.5 
        [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:bg-white/10 
        [&::-webkit-scrollbar-thumb]:rounded-full 
        [&::-webkit-scrollbar-thumb:hover]:bg-white/20
        [&::-webkit-scrollbar]:absolute"
            >
              {/* For You tab */}
              {isAuthenticated && (
                <ForYouTab
                  activeCategorySlug={activeCategorySlug}
                  handleForYouClick={handleForYouClick}
                  renderPillIndicator={renderPillIndicator}
                />
              )}

              {/* Divider */}
              {isAuthenticated && categories?.length > 0 && (
                <div className="mx-3 my-3 h-px bg-lightGrey/20"></div>
              )}

              {/* Category Items */}
              <CategoryItems
                categories={categories}
                activeCategorySlug={activeCategorySlug}
                handleCategoryClick={handleCategoryClick}
                renderPillIndicator={renderPillIndicator}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTabs;
