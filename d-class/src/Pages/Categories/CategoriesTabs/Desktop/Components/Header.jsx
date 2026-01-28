import React from "react";
import { Compass } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
const Header = () => {
  const { t } = useTranslation();
  return (
    <div className="px-6 pt-6 pb-4 border-b border-white/10">
      <h2 className="text-white font-medium flex items-center gap-2">
        <Compass weight="bold" size={20} className="text-primary" />
        <span>{t("general.explore")}</span>
      </h2>
    </div>
  );
};

export default Header;
