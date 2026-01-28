import React from "react";
import { useTranslation } from "react-i18next";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
const GategoryTabs = ({ data, onCategoryChange, activeCategory }) => {
  const { t, i18n } = useTranslation();
  const categories = t("news.categories", { returnObjects: true }) || [];

  return (
    <section
      className={`col-span-3 h-full pr-4  bg-gray-200 ${
        i18n.language === "ar" ? "rounded-tl-xl" : "rounded-tr-xl"
      }`}
    >
      <div className="flex flex-col  gap-2 py-8">
        {data?.map((category) => {
          return (
            <div
              className={`w-full px-4 ${
                activeCategory === category.slug ? "bg-gray-300 " : ""
              } ${
                i18n.language === "ar"
                  ? "rounded-tl-lg rounded-bl-lg"
                  : "rounded-tr-lg rounded-br-lg"
              }`}
              key={category.id}
            >
              <button
                className="text-blackx` font-bold flex items-center justify-between  w-full  py-2 text-start   gap-2"
                onClick={() => onCategoryChange(category.slug)}
              >
                <p>{category.title}</p>
                {activeCategory === category.slug && (
                  <CaretCircleRight
                    size={20}
                    color="#ed1a4d"
                    className={i18n.language === "ar" ? "rotate-180" : ""}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default GategoryTabs;
