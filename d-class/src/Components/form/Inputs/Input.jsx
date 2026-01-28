import React from "react";
const Input = (props) => {
  const {
    boxStyle,
    inputStyle,
    type,
    name,
    id,
    label,
    placeholder,
    value,
    onChange = () => {},
    onBlur = () => {},
    hasError = false,
    isDisabled,
    errorMessage = "error",
    isWhite,
  } = props;

  return (
    <span className={"flex gap-y-1 flex-col  w-full flex-1"}>
      <input
        className={` ${
          isWhite ? "bg-white border border-gray-700" : "bg-darkPrimary"
        }  px-2 py-3 focus:outline-none rounded-lg placeholder:leading-relaxed placeholder:text-sm ${
          hasError ? "border-red-500" : ""
        } `}
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={isDisabled}
      />

      <p
        className={`text-xs text-red-700 mt-1 mb-3 xl:mb-6  ${
          hasError ? "block" : "hidden"
        }`}
      >
        {errorMessage}
      </p>
    </span>
  );
};

export default Input;
