import Container from "Components/Container/Container";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "Components/form/Inputs/Input";
import useInput from "Components/form/Hooks/user-input";
const ContactForm = () => {
  const { t } = useTranslation();
  const [isClicked, setIsClicked] = useState(false);
  const useCreateInput = (validationFn) => useInput(validationFn);
  const emailValidation = (value) => value.includes("@") && value.trim() !== "";
  const defaultValidation = (value) => value.trim() !== "";

  const {
    value: emailInput,
    isValid: emailIsValid,
    hasError: emailHasError,
    inputChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
    isFocus: emailIsFocus,
  } = useCreateInput(emailValidation);

  const {
    value: firstNameInput,
    isValid: firstNameIsValid,
    hasError: firstNameHasError,
    inputChangeHandler: firstNameChangeHandler,
    inputBlurHandler: firstNameBlurHandler,
  } = useCreateInput(defaultValidation);

  const {
    value: lastNameInput,
    isValid: lastNameIsValid,
    hasError: lastNameHasError,
    inputChangeHandler: lastNameChangeHandler,
    inputBlurHandler: lastNameBlurHandler,
  } = useCreateInput(defaultValidation);

  const {
    value: companyNameInput,
    isValid: companyNameIsValid,
    hasError: companyNameHasError,
    inputChangeHandler: companyNameChangeHandler,
    inputBlurHandler: companyNameBlurHandler,
  } = useCreateInput(defaultValidation);

  const {
    value: jobTitleInput,
    isValid: jobTitleIsValid,
    hasError: jobTitleHasError,
    inputChangeHandler: jobTitleChangeHandler,
    inputBlurHandler: jobTitleBlurHandler,
  } = useCreateInput(defaultValidation);

  const {
    value: groupSizeInput,
    isValid: groupSizeIsValid,
    hasError: groupSizeHasError,
    inputChangeHandler: groupSizeChangeHandler,
    inputBlurHandler: groupSizeBlurHandler,
  } = useCreateInput(defaultValidation);

  const {
    value: learningNeedsInput,
    isValid: learningNeedsIsValid,
    hasError: learningNeedsHasError,
    inputChangeHandler: learningNeedsChangeHandler,
    inputBlurHandler: learningNeedsBlurHandler,
  } = useCreateInput(defaultValidation);

  const formIsValid =
    emailIsValid &&
    firstNameIsValid &&
    lastNameIsValid &&
    companyNameIsValid &&
    jobTitleIsValid &&
    groupSizeIsValid &&
    learningNeedsIsValid;

  const clearErrors = () => {
    setIsClicked(false);
  };

  const formSubmitHandler = (event) => {
    event.preventDefault();
    setIsClicked(true);
    if (!formIsValid) return;
  };

  return (
    <section className="pt-secondary">
      <Container>
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-white font-bold text-2xl xl:text-3xl">
            {t("business.formtTitle")}
          </h2>
        </div>

        <form className="flex flex-col items-center justify-center xl:w-3/4 mx-auto mt-10">
          <span className="flex items-center gap-x-10 flex-col lg:flex-row w-full">
            <Input
              type="text"
              placeholder={t("inputs.first_name")}
              value={firstNameInput}
              onChange={(e) => {
                firstNameChangeHandler(e);
                clearErrors();
              }}
              onBlur={firstNameBlurHandler}
              hasError={(isClicked && !firstNameIsValid) || firstNameHasError}
              errorMessage={t("inputs.first_name_error")}
            />
            <Input
              type="text"
              placeholder={t("inputs.last_name")}
              value={lastNameInput}
              onChange={(e) => {
                lastNameChangeHandler(e);
                clearErrors();
              }}
              onBlur={lastNameBlurHandler}
              hasError={(isClicked && !lastNameIsValid) || lastNameHasError}
              errorMessage={t("inputs.last_name_error")}
            />
          </span>
          <span className="flex items-center gap-x-10 flex-col lg:flex-row w-full">
            <Input
              type="text"
              placeholder={t("inputs.company_name")}
              value={companyNameInput}
              onChange={(e) => {
                companyNameChangeHandler(e);
                clearErrors();
              }}
              onBlur={companyNameBlurHandler}
              hasError={
                (isClicked && !companyNameIsValid) || companyNameHasError
              }
              errorMessage={t("inputs.company_name_error")}
            />
            <Input
              type="text"
              placeholder={t("inputs.job_title")}
              value={jobTitleInput}
              onChange={(e) => {
                jobTitleChangeHandler(e);
                clearErrors();
              }}
              onBlur={jobTitleBlurHandler}
              hasError={(isClicked && !jobTitleIsValid) || jobTitleHasError}
              errorMessage={t("inputs.job_title_error")}
            />
          </span>
          <span className="flex items-center gap-x-10 flex-col lg:flex-row  w-full">
            <Input
              type="text"
              placeholder={t("inputs.group_size")}
              value={groupSizeInput}
              onChange={(e) => {
                groupSizeChangeHandler(e);
                clearErrors();
              }}
              onBlur={groupSizeBlurHandler}
              hasError={(isClicked && !groupSizeIsValid) || groupSizeHasError}
              errorMessage={t("inputs.group_size_error")}
            />
            <Input
              type="email"
              placeholder={t("inputs.work_email")}
              value={emailInput}
              onChange={(e) => {
                emailChangeHandler(e);
                clearErrors();
              }}
              onBlur={emailBlurHandler}
              hasError={(isClicked && !emailIsValid) || emailHasError}
              errorMessage={t("inputs.email_error")}
            />
          </span>
          <Input
            type="text"
            placeholder={t("inputs.learning_needs")}
            value={learningNeedsInput}
            onChange={(e) => {
              learningNeedsChangeHandler(e);
              clearErrors();
            }}
            onBlur={learningNeedsBlurHandler}
            hasError={
              (isClicked && !learningNeedsIsValid) || learningNeedsHasError
            }
            errorMessage={t("inputs.learning_needs_error")}
          />

          <button
            onClick={formSubmitHandler}
            className="bg-primary text-white py-2 px-12 rounded-xl xl:mt-10 mt-5"
          >
            {t("general.contact_us")}
          </button>
        </form>
      </Container>
    </section>
  );
};

export default ContactForm;
