import React from "react";
import FooterLogo from "./Logo/FooterLogo";
import DownalodTheApp from "./DownalodTheApp/DownalodTheApp";
import ContactUs from "./ContactUs/ContactUs";
import FooterNavigation from "./Navigation/FooterNavigation";
import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t, i18n } = useTranslation();
  return (
    <footer className="">
      <div className="bg-grey py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 xsl:grid-cols-5 gap-10">
            <div className={`${i18n.language === "ar" ? "lg:hidden" : ""}`}>
              <FooterLogo />
            </div>
            <FooterNavigation />
            <ContactUs />
            <DownalodTheApp />
            <div
              className={`${
                i18n.language === "ar" ? "hidden lg:block" : "hidden"
              }`}
            >
              <FooterLogo />
            </div>
          </div>
        </Container>
      </div>
      <div className="bg-[#111] py-10">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-lightWhite">
              &copy; {new Date().getFullYear()} {t("footer.copyright")}
            </p>
            <a
              href="https://www.dowgroup.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lightWhite hover:text-lightWhite hover:underline"
            >
              {t("footer.credit")}
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
