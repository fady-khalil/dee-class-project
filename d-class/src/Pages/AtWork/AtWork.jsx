import React from "react";
import { useTranslation } from "react-i18next";
import LatestCourses from "Components/Sliders/LatestCourses";
import RegistertForm from "./RegistertForm/RegisterForm";
import Features from "./Features/Features";
import ContactForm from "./ContactForm/ContactForm";
import FrequentlyAskedQuestions from "Components/FQ/FrequentlyAskedQuestions";

const AtWork = () => {
  const { t, i18n } = useTranslation();

  // Get the FAQ questions array from the translation resource
  const faqQuestions = i18n.getResource(
    i18n.language,
    "translation",
    "fq.questions"
  );

  return (
    <div>
      <LatestCourses title={t("business.title")} />
      <RegistertForm />
      <Features />
      <ContactForm />
      <FrequentlyAskedQuestions title={t("fq.title")} data={faqQuestions} />
    </div>
  );
};

export default AtWork;
