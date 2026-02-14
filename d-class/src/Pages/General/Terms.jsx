import React from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "Hooks/useApiQuery";
import { Spinner } from "Components/RequestHandler";

const Terms = () => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError } = useApiQuery("home/terms-of-service");

  const content = data?.data?.content;

  return (
    <div className="min-h-screen bg-bg py-pageTop lg:py-primary">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-white text-center">
          {t("terms.title", "Terms of Service")}
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="bg-grey rounded-lg shadow-lg p-8">
            <p className="text-red-400 text-center">
              {t("general.error_message", "An error occurred. Please try again later.")}
            </p>
          </div>
        ) : content ? (
          <div
            className="bg-grey rounded-lg shadow-lg p-8 prose-invert"
            style={{
              direction: i18n.language === "ar" ? "rtl" : "ltr",
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="bg-grey rounded-lg shadow-lg p-8">
            <p className="text-gray-400 text-center">
              {t("terms.noContent", "Terms of service content is not available yet.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terms;
