import React from "react";
import { useTranslation } from "react-i18next";
import useInput from "Components/form/Hooks/user-input";

const Subscribe = () => {
  const { t } = useTranslation();
  const {
    value: emailInput,
    isValid: emailIsValid,
    HasError: emailHasError,
    inputChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
    inputFocusHandler: emailFocusHandler,
    reset: emailRest,
    isFocus: emailIsFocus,
  } = useInput((value) => value.includes("@") && value.trim() !== "");

  return (
    <section className="mt-secondary lg:mt-primary bg-lightWhite flex flex-col lg:flex-row lg:items-center p-6 lg:p-14 gap-y-10 gap-x-32">
      <div className="flex-1">
        <h2 className="text-3xl font-bold">{t("subcribe.title")}</h2>
        <p className="text-lg w-full lg:w-3/4 mt-2">{t("subcribe.subtitle")}</p>
      </div>
      <div className="flex-1 flex flex-col sm:flex-row gap-2">
        <input
          className="bg-white border border-black w-full sm:w-3/4 py-2.5 px-2 rounded-lg"
          type={"email"}
          name={"arWorkEmail"}
          placeholder={t("inputs.work_email")}
          value={emailInput}
          onChange={emailChangeHandler}
          onBlur={emailBlurHandler}
        />
        <button className="bg-primary text-white py-2 px-6 rounded-lg">
          {t("general.submit")}
        </button>
      </div>
    </section>
  );
};

export default Subscribe;
