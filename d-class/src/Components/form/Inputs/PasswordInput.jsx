import { useState } from "react";
import { Eye, EyeClosed } from "@phosphor-icons/react";

const PasswordInput = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    name,
    id,
    placeholder,
    value,
    onChange = () => {},
    onBlur = () => {},
    onFocus = () => {},
    hasError = false,
    isWhite,
    errorMessage = "error",
  } = props;

  const handlePassword = () => {
    setShowPassword((cur) => !cur);
  };

  return (
    <div className={`flex gap-y-1 flex-col  w-full flex-1 `}>
      <div
        className={`${
          isWhite ? "bg-white border border-gray-700" : "bg-darkPrimary"
        }  px-2 py-3 rounded-lg  flex items-center justify-between placeholder:leading-relaxed placeholder:text-sm ${
          hasError ? "border-red-500" : ""
        } `}
      >
        <input
          className="w-full focus:outline-none"
          id={id}
          type={`${showPassword ? "text" : "password"}`}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        <span className="cursor-pointer" onClick={() => handlePassword()}>
          {!showPassword && (
            <Eye width={"1rem"} height={"1rem"} color={"#333"} />
          )}
          {showPassword && (
            <EyeClosed width={"1rem"} height={"1rem"} color={"#333"} />
          )}
        </span>
      </div>
      <p className={`text-sm text-red-500 ${hasError ? "block " : "hidden"}`}>
        {errorMessage}
      </p>
    </div>
  );
};

export default PasswordInput;
