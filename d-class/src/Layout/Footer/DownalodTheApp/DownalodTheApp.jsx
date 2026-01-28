import React from "react";
import { useTranslation } from "react-i18next";
import appleStoreImage from "assests/Stores/app-store.png";
import googleStoreImage from "assests/Stores/google-play-store.png";
const DownalodTheApp = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className="">
      <h3 className="text-lightWhite font-bold text-2xl mb-6 relative">
        {t("general.download_the_app")}
        <span
          className={`absolute -bottom-2 ${
            i18n.language === "ar" ? "right-0" : "left-0"
          }  w-16 h-1 bg-[#bbb] rounded-full`}
        ></span>
      </h3>

      <div className="flex gap-y-3 mt-5 flex-col">
        <img
          className="w-1/2 md:w-1/3 lg:w-3/4"
          src={appleStoreImage}
          alt="apple store"
        />
        <img
          className="w-1/2 md:w-1/3 lg:w-3/4"
          src={googleStoreImage}
          alt="google store"
        />
      </div>
    </div>
  );
};

export default DownalodTheApp;
