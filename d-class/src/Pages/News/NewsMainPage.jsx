import React from "react";
import { useTranslation } from "react-i18next";
import Container from "Components/Container/Container";
import FeaturedNews from "./FeaturedNews/FeaturedNews";
import NewsCategories from "./NewsCategories/NewsCategories";
import Subscribe from "./Subscribe/Subscribe";
import LatestNews from "./LatestNews/LatestNews";
import useApiQuery from "Hooks/useApiQuery";
import IsLoading from "Components/RequestHandler/IsLoading";

const NewsMainPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useApiQuery("category-news");

  if (isLoading) {
    return <IsLoading />;
  }

  // if (isError) {
  //   return <IsError />;
  // }

  if (data) {
    return (
      <main className="pt-pageTop lg:pt-primary">
        <Container>
          <h1 className="text-white text-4xl font-bold mb-16">
            {t("news.newsMainTitle")}
          </h1>
        </Container>
        <section className="pt-12 lg:pt-20 bg-white">
          <Container>
            <FeaturedNews data={data?.feature_news} />
            <NewsCategories data={data?.news_categories} />
            <Subscribe />
            <LatestNews data={data?.latest_news} />
          </Container>
        </section>
      </main>
    );
  }
};

export default NewsMainPage;
