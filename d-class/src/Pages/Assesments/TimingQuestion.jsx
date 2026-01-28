import React, { useState, useEffect } from "react";
import { Check, CaretLeft } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useAssessment } from "../../Context/AssessmentContext";

function TimingQuestion({
  question,
  onAnswerChange,
  onNext,
  onPrevious,
  savedResponse,
}) {
  const [selectedTimings, setSelectedTimings] = useState(savedResponse || []);
  const { t } = useTranslation();

  // Initialize selected timing from savedResponse
  useEffect(() => {
    if (
      savedResponse &&
      Array.isArray(savedResponse) &&
      savedResponse.length > 0
    ) {
      setSelectedTimings(savedResponse);
    } else {
      setSelectedTimings([]);
    }
  }, [savedResponse]);

  const handleChange = (timingId) => {
    let newSelected = [...selectedTimings];

    if (newSelected.includes(timingId)) {
      // Remove if already selected
      newSelected = newSelected.filter((id) => id !== timingId);
    } else {
      // Add if not selected
      newSelected.push(timingId);
    }

    setSelectedTimings(newSelected);
    onAnswerChange(newSelected);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form className="text-white mx-auto mb-32" onSubmit={handleSubmit}>
      <p className="text-2xl text-center font-bold mb-6">
        How much time would you like to spend learning?
      </p>
      <p className="text-center text-gray-400 mb-6">Select all that apply</p>

      {question?.learning_times && Array.isArray(question.learning_times) ? (
        <ul className="flex flex-col gap-y-3 mt-8">
          {question.learning_times.map((timing) => (
            <li
              key={timing.id}
              className={`${
                selectedTimings.includes(timing.id)
                  ? "bg-lightGrey"
                  : "bg-darkGrey"
              } px-6 py-4 text-lg rounded-md flex items-center gap-x-2 cursor-pointer`}
              onClick={() => handleChange(timing.id)}
            >
              <input
                type="checkbox"
                id={`timing${timing.id}`}
                name="timings"
                value={timing.id}
                checked={selectedTimings.includes(timing.id)}
                onChange={() => {}}
                className="hidden peer"
              />

              <div className="w-5 h-5 p-[2px] flex items-center justify-center rounded-md border border-gray-400 peer-checked:border-white relative">
                <Check
                  size={20}
                  weight="bold"
                  className={`text-white ${
                    selectedTimings.includes(timing.id)
                      ? "opacity-100"
                      : "opacity-0"
                  } duration-300`}
                />
              </div>

              <label
                htmlFor={`timing${timing.id}`}
                className="text-white cursor-pointer"
              >
                {timing.name}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading timing options...</p>
      )}

      <div className="flex justify-between items-center mt-14">
        <button
          type="button"
          onClick={onPrevious}
          className="border border-gray-400 rounded-xl p-1.5 text-lg text-white"
        >
          <CaretLeft size={24} />
        </button>
        <button
          className="bg-primary text-white px-10 py-2 rounded-md capitalize flex-none"
          type="submit"
          disabled={selectedTimings.length === 0}
        >
          {t("general.finish")}
        </button>
      </div>
    </form>
  );
}

export default TimingQuestion;
