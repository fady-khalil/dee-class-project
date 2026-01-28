import React from "react";
import { useTranslation } from "react-i18next";

const LatestNews = ({ data }) => {
  const { t } = useTranslation();

  return (
    <section className="py-secondary lg:py-primary">
      <div className="flex items-end gap-x-10 mb-16">
        <h2 className="text-4xl font-bold ">{t("news.latestNewsTitle")}</h2>
        <div className="hidden lg:block lg:flex-1 bg-darkGrey h-[1px]"></div>
      </div>

      <div className="flex flex-col gap-y-16 lg:gap-y-32">
        {data?.map((newsItem, index) => (
          <div key={index} className="flex flex-col lg:flex-row">
            <div className="flex-1">
              <img
                src={newsItem?.image}
                alt={newsItem?.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4 flex-1">
              <span className="text-[#777] text-sm">
                {newsItem?.category?.name}
              </span>
              <h3 className="text-2xl font-bold">{newsItem?.title}</h3>
              <p className="mt-3 mb-6">{newsItem?.smallDescription}</p>
              <div className="text-gray-500 text-sm ">
                {new Date(newsItem?.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LatestNews;
