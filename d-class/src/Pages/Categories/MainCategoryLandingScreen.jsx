import React, { useEffect, useState } from "react";
import CategoriesTabs from "./CategoriesTabs/CategoriesTabs";
import CoursesDisplay from "./CoursesDisplay/CoursesDisplay";
import { useContext } from "react";
import { CategoriesContext } from "Context/General/CategoriesContext";
import IsLoading from "Components/RequestHandler/IsLoading";
import { useLocation } from "react-router-dom";
import IsError from "Components/RequestHandler/IsError";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
const MainCategoryLandingScreen = () => {
  const location = useLocation();
  const [activeCategorySlug, setActiveCategorySlug] = useState(undefined);
  const { categories, getCategoriesLoading, getCategoriesError } =
    useContext(CategoriesContext);
  const { isLoggedIn } = useContext(LoginAuthContext);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (location.state?.isAuthenticated) {
      setIsAuthenticated(true);
    }

    // If slug is passed via navigation, always use it
    if (location?.state?.slug) {
      setActiveCategorySlug(location.state.slug);
    } else if (isLoggedIn && location.state?.isAuthenticated) {
      // If user is authenticated, set "For You" tab as default
      setActiveCategorySlug("for-you");
    } else {
      // Default to first category
      setActiveCategorySlug(categories?.[0]?.slug);
    }
  }, [
    categories,
    location?.state?.slug,
    location.state?.isAuthenticated,
    isLoggedIn,
  ]);

  if (getCategoriesLoading) {
    return <IsLoading />;
  }

  if (getCategoriesError) {
    return <IsError />;
  }

  if (categories?.length === 0) {
    return <div>No categories found</div>;
  }

  if (categories) {
    return (
      <div className="pb-primary lg:pt-[6rem]">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          <CategoriesTabs
            isAuthenticated={isAuthenticated}
            categories={categories}
            activeCategorySlug={activeCategorySlug}
            setActiveCategorySlug={setActiveCategorySlug}
          />
          <CoursesDisplay activeCategorySlug={activeCategorySlug} />
        </div>
      </div>
    );
  }
};

export default MainCategoryLandingScreen;
