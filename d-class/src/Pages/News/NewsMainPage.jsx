import React from "react";
import { useTranslation } from "react-i18next";
import Container from "Components/Container/Container";
import FeaturedNews from "./FeaturedNews/FeaturedNews";
import NewsCategories from "./NewsCategories/NewsCategories";
import Subscribe from "./Subscribe/Subscribe";
import LatestNews from "./LatestNews/LatestNews";
import useFetch from "Hooks/useFetch";
import { useEffect } from "react";
import IsLoading from "Components/RequestHandler/IsLoading";
const NewsMainPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, fetchData } = useFetch("");
  useEffect(() => {
    fetchData("category-news");
  }, []);

  if (isLoading) {
    return <IsLoading />;
  }

  // if (isError) {
  //   return <IsError />;
  // }

  if (data) {
    return (
      <main className="pt-secondary lg:pt-primary">
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
