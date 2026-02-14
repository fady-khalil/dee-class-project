import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "Components/Container/Container";
import Banner from "./Banner/Banner";
import Landing from "./Landing/Landing";
import useApiQuery from "Hooks/useApiQuery";
import IsLoading from "Components/RequestHandler/IsLoading";

const NewsDetailed = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { data, isLoading, isError } = useApiQuery(id ? `news/${id}` : null);

  if (isLoading) {
    return <IsLoading />;
  }

  return (
    <main className="pt-pageTop lg:pt-primary">
      <Container>
        <h1 className="text-white text-4xl font-bold mb-16">
          {t("news.newsMainTitle")}
        </h1>
      </Container>
      <div className="bg-white">
        <Container>
          <div className="grid grid-cols-12 gap-x-6 gap-y-12 pt-14 pb-secondary lg:pb-primary ">
            <Banner newsData={data} />
            <Landing newsData={data} />
          </div>
        </Container>
      </div>
    </main>
  );
};

export default NewsDetailed;
