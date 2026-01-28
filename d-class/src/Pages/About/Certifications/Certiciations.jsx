import React from "react";
import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";
const Certiciations = () => {
  const { t, i18n } = useTranslation();
  return (
    <section className="py-secondary lg:py-primary">
      <Container>
        <h2
          className={`text-white text-2xl w-fit lg:text-4xl font-bold relative after:absolute  after:w-12 after:-top-3 ${
            i18n.language === "ar" ? "after:right-0" : "after:left-0"
          } after:bg-primary after:h-2`}
        >
          {t("about.certifications")}
        </h2>
      </Container>
    </section>
  );
};

export default Certiciations;
