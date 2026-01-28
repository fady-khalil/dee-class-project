import Container from "Components/Container/Container";
import React from "react";
import { useTranslation } from "react-i18next";
const WhoWeAre = ({ featured, data }) => {
  const { t, i18n } = useTranslation();
  return (
    <section className="pt-secondary lg:pt-primary">
      <Container>
        <div className="flex flex-col gap-y-6">
          <h2
            className={`text-white text-2xl w-fit lg:text-4xl font-bold relative after:absolute  after:w-12 after:-top-3 ${
              i18n.language === "ar" ? "after:right-0" : "after:left-0"
            } after:bg-primary after:h-2`}
          >
            {data?.title}
          </h2>
          <p
            className="text-lightWhite text-lg"
            dangerouslySetInnerHTML={{ __html: data?.text }}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 mt-secondary xl:mt-primary">
          {featured?.map((feature, index) => (
            <div
              key={index}
              className="flex-1 p-6 rounded-lg transition-all duration-300 hover:bg-gray-900/30 hover:shadow-lg hover:shadow-primary/10 border border-transparent hover:border-primary/20"
            >
              <h3 className="text-4xl xxl:text-5xl font-bold text-white relative min-h-[80px] flex items-center">
                {feature.title}
              </h3>
              <p className="text-lightWhite mt-4 xl:mt-6 text-lg">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default WhoWeAre;
