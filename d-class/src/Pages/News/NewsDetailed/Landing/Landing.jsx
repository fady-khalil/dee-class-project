import React from "react";
import CategoryHeader from "./CategoryHeader/CategoryHeader";
import NewsInfo from "./newsInfo/NewsInfo";
import NewsData from "./NewsData/NewsData";

const Landing = ({ newsData }) => {
  if (!newsData) {
    return <div className="col-span-10">Loading news details...</div>;
  }

  return (
    <section className="col-span-10">
      <CategoryHeader category={newsData?.news_categories} />
      <NewsInfo news={newsData} />
      <NewsData content={newsData?.content} />
    </section>
  );
};

export default Landing;
