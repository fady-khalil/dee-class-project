import React, { useState, useEffect } from "react";
import { Check, CaretLeft } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useAssessment } from "../../Context/AssessmentContext";

function CoreTopicQuestion({
  question,
  onAnswerChange,
  onNext,
  onPrevious,
  savedResponse,
  currentCategoryIndex,
}) {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const { t } = useTranslation();
  const { state: assessmentState } = useAssessment();

  const currentCategory = question?.core_topics?.[currentCategoryIndex] || null;

  // Initialize selected topics from savedResponse
  useEffect(() => {
    if (savedResponse && savedResponse.length > 0) {
      setSelectedTopics(savedResponse);
    } else {
      setSelectedTopics([]);
    }
  }, [savedResponse, currentCategoryIndex]);

  const handleChange = (topicId) => {
    let newSelected = [...selectedTopics];

    if (newSelected.includes(topicId)) {
      // Remove if already selected
      newSelected = newSelected.filter((id) => id !== topicId);
    } else {
      // Add if not selected
      newSelected.push(topicId);
    }

    setSelectedTopics(newSelected);
    onAnswerChange(newSelected);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  const handleBackNavigation = () => {
    // If we're on the first category, we should go back to the previous step
    if (currentCategoryIndex === 0) {
      console.log("Attempting to go back to categories from core topics");
    }
    onPrevious();
  };

  if (!currentCategory) {
    return <p className="text-white">Loading topics...</p>;
  }

  return (
    <form className="text-white mx-auto mb-32" onSubmit={handleSubmit}>
      <p className="text-2xl text-center font-bold mb-6">
        Select topics for {currentCategory.category_name}
      </p>

      {currentCategory.details && Array.isArray(currentCategory.details) ? (
        <ul className="flex flex-col gap-y-3 mt-8">
          {currentCategory.details.map((topic) => (
            <li
              key={topic.id}
              className={`${
                selectedTopics.includes(topic.id)
                  ? "bg-lightGrey"
                  : "bg-darkGrey"
              } px-6 py-4 text-lg rounded-md flex items-center gap-x-2 cursor-pointer`}
              onClick={() => handleChange(topic.id)}
            >
              <input
                type="checkbox"
                id={`topic${topic.id}`}
                name="topics"
                value={topic.id}
                checked={selectedTopics.includes(topic.id)}
                onChange={() => {}}
                className="hidden peer"
              />

              <div className="w-5 h-5 p-[2px] flex items-center justify-center rounded-md border border-gray-400 peer-checked:border-white relative">
                <Check
                  size={20}
                  weight="bold"
                  className={`text-white ${
                    selectedTopics.includes(topic.id)
                      ? "opacity-100"
                      : "opacity-0"
                  } duration-300`}
                />
              </div>

              <label
                htmlFor={`topic${topic.id}`}
                className="text-white cursor-pointer"
              >
                {topic.name}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>No topics available for this category</p>
      )}

      <div className="flex justify-between items-center mt-14">
        <div className="flex items-center gap-x-4">
          <button
            type="button"
            onClick={handleBackNavigation}
            className="border border-gray-400 rounded-xl p-1.5 text-lg text-white"
          >
            <CaretLeft size={24} />
          </button>
        </div>
        <button
          className="bg-primary text-white px-10 py-2 rounded-md capitalize flex-none"
          type="submit"
          disabled={selectedTopics.length === 0}
        >
          {currentCategoryIndex === question?.core_topics?.length - 1
            ? t("general.next")
            : t("general.continue")}
        </button>
      </div>
    </form>
  );
}

export default CoreTopicQuestion;
