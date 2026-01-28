import React from "react";
import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";

const Hero = ({ data }) => {
  const { t, i18n } = useTranslation();
  return (
    <section className="relative  overflow-hidden lg:mt-primary">
      <Container className="">
        <div className="relative xl:w-[80%] xl:mx-auto">
          <div className="w-full relative">
            <div className="relative">
              <div className="absolute w-full h-full bg-[#000] opacity-50"></div>
              <img
                src={data?.image}
                alt="Business person with tech interface"
                className={`w-full xl:w-[70%] ${
                  i18n.language === "ar" ? "xl:mr-auto" : "xl:ml-auto"
                } rounded-lg object-cover  h-[500px]`}
              />
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 xl:inset-0 xl:left-0 xl:top-0 xl:translate-x-0 xl:translate-y-0 flex items-center ">
              <div className="w-full xl:w-3/4 ">
                <h1
                  className={`text-5xl text-center ${
                    i18n.language === "ar" ? "xl:text-right" : "xl:text-left"
                  } xl:text-7xl font-bold text-white  `}
                >
                  {data?.title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
