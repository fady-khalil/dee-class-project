import Container from "Components/Container/Container";
import React from "react";
import { useTranslation } from "react-i18next";
const Features = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-lightGrey py-14">
      <Container>
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-primary text-center text-2xl ">
            {t("business.featureTitle")}
          </h2>
          <p className="text-white text-center text-2xl xl:text-3xl font-bold my-2">
            {t("business.featureSubtitle")}
          </p>
        </div>
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 mt-10 xl:w-3/4 mx-auto">
          {Array.from(
            {
              length: t("business.featureList", { returnObjects: true }).length,
            },
            (_, index) => (
              <div
                key={index}
                className="bg-[#222] p-6 xl:p-16 rounded-xl shadow-md text-center"
              >
                <h3 className="text-white text-2xl font-bold mb-5">
                  {t(`business.featureList.${index}.title`)}
                </h3>
                <p className="text-lightWhite">
                  {t(`business.featureList.${index}.description`)}
                </p>
              </div>
            )
          )}
        </div>
      </Container>
    </section>
  );
};

export default Features;
