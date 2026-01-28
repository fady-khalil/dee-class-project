import React from "react";

const SelectInput = (props) => {
  const {
    label,
    options,
    name,
    id,
    placeholder,
    value,
    onChange = () => {},
    onBlur = () => {},
    hasError = false,
    errorMessage = "error",
  } = props;
  return (
    <span className="flex flex-col gap-y-1 w-full">
      <label className="text-white capitalize">{label}</label>

      <select
        // multiple
        className="bg-[#333]  px-2 py-3 rounded-sm text-white"
        onChange={onChange}
        name={name}
        value={value}
        id={id}
      >
        {options?.map((option, index) => (
          <option className="text-sm" key={index} value={option.value}>
            {option}
          </option>
        ))}
      </select>

      <p
        className={`text-xs text-red  ${hasError ? "opacity-1 " : "opacity-0"}`}
      >
        {errorMessage}
      </p>
    </span>
  );
};

export default SelectInput;
