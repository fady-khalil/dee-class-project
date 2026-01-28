import { useState } from "react";

/**
 * Custom hook for handling form input validation
 * @param {Function} validateValue - Function that validates the input value
 * @returns {Object} Input state and handlers
 */
const useInput = (validateValue) => {
  const [value, setValue] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  // Validate the input value
  const isValid = validateValue(value);
  const hasError = !isValid && isTouched;

  // Handle input change
  const inputChangeHandler = (event) => {
    // For React Native, event might be a string directly or event.nativeEvent.text
    const inputValue =
      typeof event === "string" ? event : event.nativeEvent?.text || event;

    setValue(inputValue);
  };

  // Handle input blur (losing focus)
  const inputBlurHandler = () => {
    setIsTouched(true);
    setIsFocus(false);
  };

  // Handle input focus
  const inputFocusHandler = () => {
    setIsFocus(true);
  };

  // Reset the input
  const reset = () => {
    setValue("");
    setIsTouched(false);
    setIsFocus(false);
  };

  return {
    value,
    isValid,
    hasError,
    isFocus,
    inputChangeHandler,
    inputBlurHandler,
    inputFocusHandler,
    reset,
  };
};

export default useInput;
