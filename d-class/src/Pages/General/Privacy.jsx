import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import useFetch from "Hooks/useFetch";
import { Spinner } from "Components/RequestHandler";

const Privacy = () => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, fetchData } = useFetch();

  useEffect(() => {
    fetchData("home/privacy-policy");
  }, [i18n.language]);

  const content = data?.data?.content;

  return (
    <div className="min-h-screen bg-bg py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-white text-center">
          {t("privacy.title", "Privacy Policy")}
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
              {t("privacy.noContent", "Privacy policy content is not available yet.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Privacy;
