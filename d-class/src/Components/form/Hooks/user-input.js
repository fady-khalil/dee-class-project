import { useState } from "react";

const useInput = (validateValue = () => true) => {
  const [inputValue, setInputValue] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const valueIsValid = validateValue(inputValue);
  const HasError =
    (!valueIsValid && (isTouched || isSubmitted)) ||
    (!isTouched && !inputValue && isSubmitted);

  const inputChangeHandler = (event) => {
    setInputValue(event.target.value);
  };

  const inputBlurHandler = () => {
    setIsTouched(true);
  };

  const reset = () => {
    setInputValue("");
    setIsTouched(false);
    setIsSubmitted(false);
  };

  return {
    value: inputValue,
    isValid: valueIsValid,
    HasError,
    inputChangeHandler,
    inputBlurHandler,
    isTouched,
    setIsTouched,
    reset,
  };
};

export default useInput;
