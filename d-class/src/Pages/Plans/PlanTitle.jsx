import React from "react";
import { useTranslation } from "react-i18next";
const PlanTitle = () => {
  const { t, i18n } = useTranslation();
  console.log(i18n);
  return (
    <div className="px-4 sm:px-6">
      <h1 className="text-white text-4xl  md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-8 text-center">
        {t("general.plans_title")}
      </h1>
      <div className="text-center text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-16">
        <p className="text-lg sm:text-xl mb-1">
          {t("general.plans_description")}
        </p>
        <p className="mb-4 sm:mb-8">{t("general.plans_guarantee")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-center lg:text-start items-center  mx-auto ">
          <div
            className={`flex flex-col items-center lg:items-start lg:flex-row  ${
              i18n.language === "ar"
                ? "justify-center"
                : "justify-center lg:justify-start"
            } gap-2`}
          >
            <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
              <svg
                className="h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm sm:text-base ">
              {t("general.plans_feature_1")}
            </span>
          </div>
          <div
            className={`flex  flex-col items-center lg:items-start lg:flex-row  ${
              i18n.language === "ar"
                ? "justify-center"
                : "justify-center lg:justify-start"
            } gap-2`}
          >
            <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
              <svg
                className="h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm sm:text-base">
              {t("general.plans_feature_2")}
            </span>
          </div>
          <div
            className={`flex  flex-col items-center lg:items-start lg:flex-row  ${
              i18n.language === "ar"
                ? "justify-center"
                : "justify-center lg:justify-start"
            } gap-2`}
          >
            <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
              <svg
                className="h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm sm:text-base">
              {t("general.plans_feature_3")}
            </span>
          </div>
          <div
            className={`flex  flex-col items-center lg:items-start lg:flex-row  ${
              i18n.language === "ar"
                ? "justify-center"
                : "justify-center lg:justify-start"
            } gap-2`}
          >
            <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
              <svg
                className="h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm sm:text-base">
              {t("general.plans_feature_4")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanTitle;
