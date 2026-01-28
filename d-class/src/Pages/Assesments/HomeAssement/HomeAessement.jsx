import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Check, CaretLeft } from "@phosphor-icons/react";
import { useAssessment } from "Context/AssessmentContext";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { Link } from "react-router-dom";
const HomeAessement = ({ assesment }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state: assessmentState } = useAssessment();
  const { allowedCourses } = useContext(LoginAuthContext);

  // Store array of selected IDs
  const [selectedIds, setSelectedIds] = useState([]);

  // Toggle selection by ID
  const toggleSelection = (answerId) => {
    setSelectedIds((prev) => {
      if (prev.includes(answerId)) {
        // If ID exists, remove it (unselect)
        return prev.filter((id) => id !== answerId);
      } else {
        // If ID doesn't exist, add it (select)
        return [...prev, answerId];
      }
    });
  };

  // Get the ID from an answer (handles both object and primitive types)
  const getAnswerId = (answer) => {
    if (typeof answer === "object" && answer !== null) {
      return answer.id; // Use ID property if it's an object
    }
    return answer; // Use the value itself as ID if it's a primitive
  };

  // Handle "Next" Button click
  const handleNext = () => {
    if (assessmentState?.status === "completed") {
      // If assessment is already completed, go directly to the results page
      navigate("/plans");
    } else if (assessmentState?.status === "in_progress") {
      // If assessment is in progress, continue where they left off
      navigate("/assement");
    } else {
      // Start a new assessment with the selected answers
      navigate("/assement", {
        state: { answer_ids: selectedIds },
      });
    }
  };

  return (
    <div
      className={`col-span-3 relative z-[10]  ${
        allowedCourses?.length > 0 || assessmentState?.status === "in_progress"
          ? "lg:mb-32"
          : "lg:mb-10"
      }`}
    >
      <h1
        className={`uppercase text-4xl xl:text-3xl xsl:text-4xl xxl:text-5xl text-white font-bold`}
      >
        {assesment?.title}
      </h1>

      {allowedCourses?.length === 0 && (
        <>
          {assessmentState?.status === "completed" ? (
            <div className="text-lightWhite my-5 xl:my-10">
              <p className="text-lg">{t("assesment.completed")}</p>
            </div>
          ) : assessmentState?.status === "in_progress" ? (
            <div className="text-lightWhite my-5 xl:my-10">
              <p className="text-lg">{t("assesment.in_progress")}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg my-5 xl:my-4 xxl:my-6 text-lightWhite">
                {assesment?.firstQuestion}
              </p>
              <ul className="text-white flex flex-col gap-y-3">
                {assesment?.answers.map((answer, index) => {
                  const answerId = getAnswerId(answer);
                  const isSelected = selectedIds.includes(answerId);

                  return (
                    <li
                      onClick={() => toggleSelection(answerId)}
                      className={`${
                        isSelected ? "opacity-100" : "opacity-50"
                      } rounded-md flex items-center gap-x-2 cursor-pointer`}
                      key={index}
                    >
                      <input
                        type="checkbox"
                        id={`answer${index}`}
                        name="answer"
                        checked={isSelected}
                        onChange={() => toggleSelection(answerId)}
                        className="hidden peer"
                      />
                      <div className="w-4 h-4 p-[1px] flex items-center justify-center rounded-sm border border-primary p relative">
                        <Check
                          size={18}
                          weight="bold"
                          className={`text-white ${
                            isSelected ? "opacity-100" : "opacity-0"
                          } duration-300`}
                        />
                      </div>

                      <label
                        htmlFor={`answer${index}`}
                        className="text-white cursor-pointer text-sm flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(answerId);
                        }}
                      >
                        {typeof answer === "object" ? answer.title : answer}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <button
            className={`mt-6 py-2 px-10 rounded-2xl bg-white text-black ${
              selectedIds?.length > 0 ||
              assessmentState?.status !== "not_started"
                ? "opacity-100"
                : "opacity-50"
            }`}
            disabled={
              selectedIds?.length === 0 &&
              assessmentState?.status === "not_started"
            }
            onClick={handleNext}
          >
            {assessmentState?.status === "completed"
              ? t("general.finish_sign_up")
              : assessmentState?.status === "in_progress"
              ? t("general.continue") || "Continue"
              : t("general.continue") || "Continue"}
          </button>
        </>
      )}

      {allowedCourses?.length > 0 && (
        <Link
          to={"/my-courses"}
          className="text-white mt-10 bg-primary rounded-xl px-10 py-2 flex w-max "
        >
          {" "}
          Check My Courses
        </Link>
      )}
    </div>
  );
};

export default HomeAessement;
