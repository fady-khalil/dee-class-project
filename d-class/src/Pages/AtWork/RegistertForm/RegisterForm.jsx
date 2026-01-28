import React from "react";
import { useTranslation } from "react-i18next";
import useInput from "Components/form/Hooks/user-input";
import Container from "Components/Container/Container";

const RegistertForm = () => {
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
    <section className="xl:w-1/2 mx-auto py-14">
      <Container>
        <h2 className="text-white text-center text-xl ">
          {t("business.description")}
        </h2>
        <form className="mt-14 w-full">
          <div
            className={
              "border-primary border rounded-xl bg-transparent text-white  lg:w-3/4 mx-auto flex items-center justify-between"
            }
          >
            <input
              className="bg-transparent text-white py-3 xl:py-4 px-4 flex-1 focus:outline-none"
              type={"email"}
              name={"arWorkEmail"}
              placeholder={t("inputs.work_email")}
              value={emailInput}
              onChange={emailChangeHandler}
              onBlur={emailBlurHandler}
            />
            <button className="bg-primary text-white py-3 px-4 xl:py-4  xl:px-9 rounded-xl">
              {t("general.contact_us")}
            </button>
          </div>
        </form>
      </Container>
    </section>
  );
};

export default RegistertForm;
