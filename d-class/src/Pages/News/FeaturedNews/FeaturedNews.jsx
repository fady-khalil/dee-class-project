import React from "react";
import { useTranslation } from "react-i18next";
const FeaturedNews = ({ data }) => {
  const { t, i18n } = useTranslation();
  const latestNews = t("news.newsData.0", { returnObjects: true });

  const imageUrl =
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";

  // Format date
  const formattedDate = new Date(latestNews.date).toLocaleDateString(
    i18n.language === "ar" ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="flex flex-col-reverse md:flex-row-reverse gap-8   items-center ">
      <div className="flex-[3] flex flex-col gap-4 ">
        <p className="text-sm text-gray-600 font-medium">
          {data?.category?.name}
        </p>
        <h1 className="text-2xl font-bold leading-tight">{data?.title}</h1>
        <p className="text-[#777] w-3/4">{data?.smallDescription}</p>
        <div className="text-sm text-gray-600 mt-auto">{data?.created_at}</div>
      </div>
      <div className="flex-[2] ">
        <img
          src={data?.thumbnail}
          alt={data?.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    </div>
  );
};

export default FeaturedNews;
