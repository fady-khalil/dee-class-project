import React from "react";
import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";
import { Circle } from "@phosphor-icons/react";

const Tabs = () => {
  const { t } = useTranslation();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="pt-secondary">
      <Container>
        <div className="flex flex-col gap-y-6">
          <p
            className="text-white text-lg flex items-center gap-x-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => scrollToSection("who-we-are-section")}
          >
            <Circle color="#ed1a4d" size={24} /> {t("about.who_we_are")}
          </p>
          <p
            className="text-white text-lg flex items-center gap-x-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => scrollToSection("leaders-section")}
          >
            <Circle color="#ed1a4d" size={24} /> {t("about.leaders")}
          </p>
          <p
            className="text-white text-lg flex items-center gap-x-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => scrollToSection("certifications-section")}
          >
            <Circle color="#ed1a4d" size={24} /> {t("about.certifications")}
          </p>
        </div>
      </Container>
    </section>
  );
};

export default Tabs;
