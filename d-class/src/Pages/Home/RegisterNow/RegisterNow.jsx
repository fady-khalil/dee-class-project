import React from "react";
import { useTranslation } from "react-i18next";
import "./style.css";
import logo from "assests/logos/small-logo.png";
import Container from "Components/Container/Container";

const RegisterNow = ({ joinUs }) => {
  const { t } = useTranslation();

  return (
    <section className="my-secondary my-primary text-white overflow-hidden">
      <div className="hidden xl:block">
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-20 h-1 bg-primary rounded-full opacity-70"></div>
          <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 w-20 h-1 bg-primary rounded-full opacity-70"></div>

          <h2 className="text-4xl font-bold text-center leading-tight">
            {joinUs?.title || t("general.register_title")}
          </h2>

          <p className="text-center w-2/3 mt-10 mx-auto text-xl leading-relaxed text-lightWhite whitespace-pre-line">
            {joinUs?.text || t("general.register_now_text")}
          </p>

          <div className="flex items-center justify-center gap-x-6 mt-12">
            <button className="bg-primary hover:bg-darkPrimary transition-colors duration-300 px-8 text-white py-3 rounded-xl font-medium shadow-lg shadow-primary/20">
              {t("navigation.sign_up")}
            </button>
            <div className="w-10 h-10 flex items-center justify-center bg-darkGrey rounded-full p-1">
              <img className="w-6 h-6 object-contain" src={logo} alt="" />
            </div>
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        <Container>
          <div className="relative px-4 py-6">
            <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

            <h2 className="text-3xl font-bold text-center mb-2">
              {joinUs?.title || t("general.register_now")}
            </h2>

            <p className="text-center mt-4 mx-auto text-base text-lightWhite whitespace-pre-line">
              {joinUs?.text || t("general.register_now_text")}
            </p>

            <div className="flex items-center justify-center gap-x-4 mt-8">
              <button className="bg-primary hover:bg-darkPrimary transition-colors duration-300 px-6 text-white py-2.5 rounded-xl font-medium shadow-md">
                {t("navigation.sign_up")}
              </button>
              <div className="w-9 h-9 flex items-center justify-center bg-darkGrey rounded-full p-1">
                <img className="w-5 h-5 object-contain" src={logo} alt="" />
              </div>
            </div>

            <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          </div>
        </Container>
      </div>
    </section>
  );
};

export default RegisterNow;
