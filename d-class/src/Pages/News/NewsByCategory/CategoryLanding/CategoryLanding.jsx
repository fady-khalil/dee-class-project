import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Spinner from "Components/RequestHandler/Spinner";
const CategoryLanding = ({ data, activeCategory, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="col-span-9 pt-8">
      <div className="flex items-center gap-x-8">
        <h2 className="text-3xl font-bold mb-6 capitalize">
          {activeCategory?.split("-").join(" ")}
        </h2>
        <div className="bg-darkGrey h-[1px] flex-1"></div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner />
        </div>
      ) : data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12">
          {data?.map((news, index) => (
            <Link
              to={`/news-detailed/${news.id}`}
              key={index}
              className="flex flex-col gap-y-4"
            >
              <img
                src={news.image}
                alt={news.title}
                className="h-[350px] rounded-sm w-full object-cover"
              />
              <div className="">
                <p className="mt-2 mb-1 text-sm font-medium">
                  {news.news_categories?.title}
                </p>
                <h3 className="text-2xl font-bold">{news.title}</h3>
                <p className="text-gray-600 mt-4 text-sm w-[90%]">
                  {news.smallDescription ||
                    news.content?.substring(0, 150) + "..."}
                </p>
                <div className="mt-2 text-gray-500 text-sm">{news.date}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-10">
          <p className="text-xl text-gray-500">
            {t("No news available in this category")}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryLanding;
