import React from "react";

const Spinner = ({ isWhite, isSmall }) => {
  return (
    <svg
      className={`animate-spin ${isSmall ? "h-6 w-6" : "h-8 w-8"} ${
        isWhite ? "text-white" : "text-primary"
      }`}
      viewBox="0 0 24 24"
    >
      <circle
        className="fill-none stroke-gray-200 opacity-25"
        cx="12"
        cy="12"
        r="10"
        strokeWidth="3"
      ></circle>
      <circle
        className={`fill-none ${isWhite ? "stroke-white" : "stroke-primary"}`}
        cx="12"
        cy="12"
        r="10"
        strokeWidth="3"
        strokeDasharray="50"
        strokeDashoffset="30"
      >
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default Spinner;
