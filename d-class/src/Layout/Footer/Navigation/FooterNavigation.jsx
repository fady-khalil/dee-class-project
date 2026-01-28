import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import FooterNavigationItems from "Content/Footer";
const FooterNavigation = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated: userAuthenticated } = useContext(LoginAuthContext);
  return (
    <div className="lg:col-span-2  ">
      <h3 className="text-lightWhite font-bold text-2xl mb-6 relative">
        {t("footer.nav.quick_links")}
        <span
          className={`absolute -bottom-2 ${
            i18n.language === "ar" ? "right-0" : "left-0"
          }  w-16 h-1 bg-[#bbb] rounded-full`}
        ></span>
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-5 mt-5  justify-between">
        {FooterNavigationItems.map(
          ({ name, path, isAuthenticated, common }, index) => (
            <Link
              className={`text-lightWhite hover:text-white hover:underline ${
                common ||
                (isAuthenticated && userAuthenticated) ||
                (!isAuthenticated && !userAuthenticated)
                  ? ""
                  : "hidden"
              }`}
              to={path}
              key={index}
            >
              {t(name)}
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default FooterNavigation;
