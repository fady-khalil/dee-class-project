import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CategoriesContext } from "Context/General/CategoriesContext";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import IsLoading from "Components/RequestHandler/IsLoading";
import IsError from "Components/RequestHandler/IsError";
import Container from "Components/Container/Container";
import CategoryPills from "./CategoryPills";
import ExploreSearch from "./ExploreSearch";
import NewThisWeek from "./NewThisWeek/NewThisWeek";
import CoursesDisplay from "./CoursesDisplay/CoursesDisplay";

const MainCategoryLandingScreen = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeCategorySlug, setActiveCategorySlug] = useState(undefined);
  const { categories, getCategoriesLoading, getCategoriesError, fetchCategories } =
    useContext(CategoriesContext);

  useEffect(() => {
    fetchCategories();
  }, []);
  const { isAuthenticated } = useContext(LoginAuthContext);

  useEffect(() => {
    if (location?.state?.slug) {
      setActiveCategorySlug(location.state.slug);
    } else if (isAuthenticated) {
      setActiveCategorySlug("for-you");
    } else {
      setActiveCategorySlug(categories?.[0]?.slug);
    }
  }, [
    categories,
    location?.state?.slug,
    isAuthenticated,
  ]);

  if (getCategoriesLoading) return <IsLoading />;
  if (getCategoriesError) return <IsError />;
  if (categories?.length === 0) return <div>No categories found</div>;

  if (categories) {
    return (
      <div className="pb-16 lg:pb-primary pt-pageTop lg:pt-primary">
        <Container>
          {/* Page title + search */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="shrink-0 text-3xl font-bold text-white sm:text-4xl">
              {t("navigation.explore", "Explore")}
            </h1>
            <ExploreSearch />
          </div>

          {/* Horizontal category pills */}
          <CategoryPills
            categories={categories}
            activeCategorySlug={activeCategorySlug}
            setActiveCategorySlug={setActiveCategorySlug}
            isAuthenticated={isAuthenticated}
          />

          {/* New this week — cinematic horizontal row */}
          <NewThisWeek />

          {/* Courses grid */}
          <div className="mt-8 lg:mt-10">
            <CoursesDisplay activeCategorySlug={activeCategorySlug} />
          </div>
        </Container>
      </div>
    );
  }
};

export default MainCategoryLandingScreen;
