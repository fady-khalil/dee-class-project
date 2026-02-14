import React, { useState } from "react";
import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";
import image from "assests/Amal.jpeg";
import logo from "assests/logos/small-logo.png";
import BecomeExpertModal from "Components/Modal/BecomeExpertModal";

const JoinUs = () => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div>
        <Container>
          <div className="flex items-center justify-center flex-col gap-y-4 lg:gap-y-0 lg:flex-row">
            <img
              src={image}
              alt="joinUs"
              className="lg:w-[350px] lg:h-[450px] rounded-2xl object-cover object-top"
            />
            <div
              className={`bg-[#272c33aa] ${
                i18n.language === "ar" ? "lg:-mr-14" : "lg:-ml-14"
              } p-6 lg:py-12 rounded-3xl lg:max-w-[700px]`}
            >
              <p className="text-white text-2xl lg:text-4xl font-medium">
                {t("general.join_us")}
              </p>
              <div className="flex items-center gap-x-4 mt-6 ">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary px-4 text-white py-2 rounded-2xl hover:bg-darkPrimary transition-colors"
                >
                  {t("general.join_us_button")}
                </button>
                <img className="w-8 h-8 object-contain" src={logo} alt="" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <BecomeExpertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default JoinUs;
