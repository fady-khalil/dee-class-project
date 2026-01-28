import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const CategoryHeader = ({ category }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-x-4">
      <Link
        to={category?.slug ? `/news/category/${category.slug}` : "/news"}
        className="text-3xl font-bold hover:text-primary transition-colors"
      >
        {category?.title || t("news.newsMainTitle")}
      </Link>
      <div className="bg-darkGrey h-[1px] flex-1"></div>
    </div>
  );
};

export default CategoryHeader;
