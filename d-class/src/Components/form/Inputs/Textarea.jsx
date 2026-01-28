import React from "react";

const Textarea = (props) => {
  const {
    boxStyle,
    inputStyle,
    label,
    name,
    id,
    placeholder,
    rows,
    value,
    onChange = () => {},
    onBlur = () => {},
    hasError = false,
    errorMessage = "error",
  } = props;
  return (
    <span className={"flex gap-y-1 flex-col w-full"}>
      <label htmlFor={id} className="text-white capitalize">
        {label}
      </label>
      <textarea
        className={"bg-[#333]  px-2 py-3 rounded-sm text-white"}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={"6"}
        wrap="soft"
      />

      <p
        className={`text-xs text-red ${hasError ? "opacity-1 " : "opacity-0"}`}
      >
        {errorMessage}
      </p>
    </span>
  );
};

export default Textarea;
