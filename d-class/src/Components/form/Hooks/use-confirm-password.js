import { useState } from "react";

const useConfirmPassword = (password) => {
  const [inputValue, setInputValue] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  const passwordIsConfirmed = inputValue === password;
  const HasError = !passwordIsConfirmed && isTouched;

  const inputChangeHandler = (event) => {
    setInputValue(event.target.value);
  };

  const inputBlurHandler = () => {
    setIsFocus(false);
    setIsTouched(true);
  };

  const inputFocusHandler = () => {
    setIsFocus(true);
  };

  const reset = () => {
    setInputValue("");
    setIsTouched(false);
  };

  return {
    value: inputValue,
    isValid: passwordIsConfirmed,
    isFocus,
    HasError,
    inputChangeHandler,
    inputBlurHandler,
    inputFocusHandler,
    reset,
  };
};

export default useConfirmPassword;
