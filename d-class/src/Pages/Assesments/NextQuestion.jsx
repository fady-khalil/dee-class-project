import React, { useState, useEffect } from "react";
import { Check } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

function NextQuestion({ question, onAnswerChange, onNext, savedResponse }) {
  const [selectedOption, setSelectedOption] = useState(savedResponse || "");
  const { t } = useTranslation();

  // Update selected option when savedResponse changes
  useEffect(() => {
    if (savedResponse) {
      setSelectedOption(savedResponse);
    }
  }, [savedResponse]);

  const handleChange = (option) => {
    setSelectedOption(option);
    onAnswerChange(option);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form className="text-white mx-auto mb-32" onSubmit={handleSubmit}>
      <p className="text-2xl text-center font-bold mb-6">
        {question?.question_text || "Select an option"}
      </p>

      {question?.options && Array.isArray(question.options) ? (
        <ul className="flex flex-col gap-y-3 mt-8">
          {question.options.map((option) => (
            <li
              key={option.id}
              className={`${
                selectedOption === option.id ? "bg-lightGrey" : "bg-darkGrey"
              } px-6 py-4 text-lg rounded-md flex items-center gap-x-2 cursor-pointer`}
              onClick={() => handleChange(option.id)}
            >
              <input
                type="radio"
                id={`option${option.id}`}
                name="option"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => {}}
                className="hidden peer"
              />

              <div className="w-5 h-5 p-[2px] flex items-center justify-center rounded-md border border-gray-400 peer-checked:border-white relative">
                <Check
                  size={20}
                  weight="bold"
                  className={`text-white ${
                    selectedOption === option.id ? "opacity-100" : "opacity-0"
                  } duration-300`}
                />
              </div>

              <label
                htmlFor={`option${option.id}`}
                className="text-white cursor-pointer"
              >
                {option.text}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading options...</p>
      )}

      <div className="flex justify-end mt-14">
        <button
          className="bg-primary text-white px-10 py-4 rounded-md capitalize flex-1 md:flex-none"
          type="submit"
          disabled={!selectedOption}
        >
          {t("general.next")}
        </button>
      </div>
    </form>
  );
}

export default NextQuestion;
