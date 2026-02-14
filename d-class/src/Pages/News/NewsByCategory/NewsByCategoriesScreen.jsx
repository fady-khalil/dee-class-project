import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "Components/Container/Container";
import CategoryLanding from "./CategoryLanding/CategoryLanding";
import CategoryTabs from "./CategoryTabs/GategoryTabs";
import useApiQuery from "Hooks/useApiQuery";

const NewsByCategoriesScreen = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(null);

  const { data } = useApiQuery("category-news");
  const {
    data: categoryData,
    isLoading: categoryLoading,
  } = useApiQuery(activeCategory ? `newscategory/${activeCategory}` : null);

  return (
    <main className="py-pageTop lg:py-primary">
      <Container>
        <h1 className="text-white text-4xl font-bold mb-16">
          {t("news.newsMainTitle")}
        </h1>
      </Container>
      <section className=" pb-secondary lg:pb-primary bg-white">
        <div
          className={`${
            i18n.language === "ar"
              ? "custom_container-ar-reverse"
              : "custom_container-en-reverse"
          }`}
        >
          <div className="grid grid-cols-12 gap-16">
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              data={data?.news_categories}
            />
            <CategoryLanding
              activeCategory={activeCategory}
              isLoading={categoryLoading}
              data={categoryData?.news}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default NewsByCategoriesScreen;
