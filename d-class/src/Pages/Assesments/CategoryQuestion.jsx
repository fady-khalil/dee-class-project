import React, { useState, useEffect } from "react";
import { Check, CaretLeft } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useAssessment } from "../../Context/AssessmentContext";

function CategoryQuestion({
  question,
  onAnswerChange,
  onNext,
  onPrevious,
  savedResponse,
  canGoBack = false, // Optional flag to enable/disable back button
}) {
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const { t } = useTranslation();
  const { state: assessmentState } = useAssessment();

  // Initialize selected categories from data and savedResponse
  useEffect(() => {
    if (question && Array.isArray(question)) {
      // If we have savedResponse, use that
      if (savedResponse && savedResponse.length > 0) {
        setSelectedAnswers(savedResponse);
      } else {
        // Otherwise, initialize from question data
        const initialSelected = question
          .filter((category) => category.selected_category)
          .map((category) => category.id);
        setSelectedAnswers(initialSelected);
        onAnswerChange(initialSelected);
      }
    }
  }, [question, savedResponse, onAnswerChange]);

  const handleChange = (categoryId) => {
    let newSelected = [...selectedAnswers];

    if (newSelected.includes(categoryId)) {
      // Remove if already selected
      newSelected = newSelected.filter((id) => id !== categoryId);
    } else {
      // Add if not selected
      newSelected.push(categoryId);
    }

    setSelectedAnswers(newSelected);
    onAnswerChange(newSelected); // Save answer globally
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form className="text-white mx-auto mb-32" onSubmit={handleSubmit}>
      <p className="text-2xl text-center font-bold mb-6">
        Select your interests
      </p>

      {question && Array.isArray(question) ? (
        <ul className="flex flex-col gap-y-3 mt-8">
          {question.map((category) => (
            <li
              key={category.id}
              className={`${
                selectedAnswers.includes(category.id)
                  ? "bg-lightGrey"
                  : "bg-darkGrey"
              } px-6 py-4 text-lg rounded-md flex items-center gap-x-2 cursor-pointer`}
              onClick={() => handleChange(category.id)}
            >
              <input
                type="checkbox"
                id={`category${category.id}`}
                name="categories"
                value={category.id}
                checked={selectedAnswers.includes(category.id)}
                onChange={() => {}}
                className="hidden peer"
              />

              <div className="w-5 h-5 p-[2px] flex items-center justify-center rounded-md border border-gray-400 peer-checked:border-white relative">
                <Check
                  size={20}
                  weight="bold"
                  className={`text-white ${
                    selectedAnswers.includes(category.id)
                      ? "opacity-100"
                      : "opacity-0"
                  } duration-300`}
                />
              </div>

              <label
                htmlFor={`category${category.id}`}
                className="text-white cursor-pointer"
              >
                {category.name}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading categories...</p>
      )}

      <div className="flex justify-between items-center mt-14">
        {canGoBack ? (
          <button
            type="button"
            onClick={onPrevious}
            className="border border-gray-400 rounded-xl p-2.5 text-lg text-white"
          >
            <CaretLeft size={24} />
          </button>
        ) : (
          <div></div> // Empty div to maintain flex spacing
        )}
        <button
          className="bg-primary text-white px-10 py-2 rounded-md capitalize flex-none"
          type="submit"
          disabled={selectedAnswers.length === 0}
        >
          {t("general.next")}
        </button>
      </div>
    </form>
  );
}

export default CategoryQuestion;
