import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoryQuestion from "./CategoryQuestion";
import CoreTopicQuestion from "./CoreTopicQuestion";
import TimingQuestion from "./TimingQuestion";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";
import { useAssessment } from "../../Context/AssessmentContext";
import Container from "Components/Container/Container";
const Assesment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { postData } = usePostData();
  const {
    state: assessmentState,
    startAssessment,
    setCategories,
    moveToCoreTopic,
    setCoreTopics,
    nextCategory,
    prevCategory,
    moveToTiming,
    setTimings,
    goBackToCategories,
    goBackToCoreTopics,
    completeAssessment,
    resetAssessment,
    getCurrentCategoryTopics,
  } = useAssessment();

  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(null);
  const [showResetButton, setShowResetButton] = useState(true); // For testing - remove in production

  // Function to reset assessment for testing
  const handleResetAssessment = () => {
    resetAssessment();
  };

  // Initialize assessment with first question
  React.useEffect(() => {
    if (location.state && assessmentState.status === "not_started") {
      postFirstQuestion();
    } else if (assessmentState.currentQuestion) {
      // If we already have data in the context, don't reload
      setIsLoading(false);
    }
  }, [location.state, assessmentState.status]);

  console.log(assessmentState.status);

  const postFirstQuestion = async () => {
    setIsLoading(true);
    try {
      const result = await postData("send-answers", {
        answer_ids: location.state?.answer_ids,
      });

      console.log("Received initial categories:", result);

      console.log("Received initial categories:", result?.data?.categories);

      // Initialize with pre-selected categories
      if (result?.data?.categories && Array.isArray(result.data.categories)) {
        const initialSelected = result.data.categories
          .filter((category) => category.selected_category)
          .map((category) => category.id);

        // Store in context
        startAssessment(result.data.categories, initialSelected);
      }

      setIsLoading(false);
    } catch (error) {
      setIsError(error);
      setIsLoading(false);
    }
  };

  const handleCategoryAnswer = (selectedCategories) => {
    setCategories(selectedCategories);
  };

  const handleCoreTopicAnswer = (selectedTopics) => {
    // Store the current category's topics
    const updatedCoreTopics = [...assessmentState.allCoreTopics];

    // Find if we already have topics for this category
    const existingIndex = updatedCoreTopics.findIndex(
      (item) => item.categoryIndex === assessmentState.currentCategoryIndex
    );

    if (existingIndex >= 0) {
      // Update existing topics
      updatedCoreTopics[existingIndex].topicIds = selectedTopics;
    } else {
      // Add new topics
      updatedCoreTopics.push({
        categoryIndex: assessmentState.currentCategoryIndex,
        topicIds: selectedTopics,
      });
    }

    // Also update the flat list of all selected topic IDs
    const allTopicIds = updatedCoreTopics.flatMap((item) => item.topicIds);

    // Update in context
    setCoreTopics(updatedCoreTopics, allTopicIds);
  };

  const handleTimingAnswer = (selectedTimings) => {
    setTimings(selectedTimings);
  };

  const handleCategoryNext = async () => {
    if (
      !assessmentState.categories ||
      assessmentState.categories.length === 0
    ) {
      alert("Please select at least one category before continuing.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await postData("send-category-choice", {
        category_ids: assessmentState.categories,
      });

      console.log("API response from send-category-choice:", result);
      console.log("Does result contain core_topics?", !!result?.core_topics);
      console.log("Core topics data structure:", result?.core_topics);

      // Check both result.core_topics and result.data.core_topics as the API might return either structure
      const coreTopics = result?.core_topics || result?.data?.core_topics;

      if (coreTopics && Array.isArray(coreTopics) && coreTopics.length > 0) {
        // Make sure we have the proper structure for moveToCoreTopic
        const coreTopicsData = result?.core_topics
          ? result
          : { core_topics: coreTopics };
        // Update context with core topics data
        moveToCoreTopic(coreTopicsData);
      } else {
        console.log(
          "No core_topics found in response, proceeding to final step"
        );
        // Handle case where there are no core topics - proceed to final step
        try {
          const finalResult = await postData("recommended-courses", {
            category_ids: assessmentState.categories,
            core_topic_ids: [],
            learning_time_ids: [],
          });

          completeAssessment(finalResult);
          navigate("/assessment-complete", {
            state: { result: finalResult },
          });
        } catch (error) {
          console.error("Error completing assessment:", error);
        }
      }
    } catch (error) {
      console.error("Error sending category choices:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoreTopicNext = async () => {
    // Get current category's topics
    const currentCategoryTopics = getCurrentCategoryTopics();

    if (!currentCategoryTopics || currentCategoryTopics.length === 0) {
      alert("Please select at least one topic before continuing.");
      return;
    }

    // Check if we have more categories to go through
    if (
      assessmentState.currentCategoryIndex <
      assessmentState.currentQuestion.core_topics.length - 1
    ) {
      // Move to next category
      nextCategory();
    } else {
      // We've gone through all categories, move to timing question
      setSubmitting(true);
      try {
        const result = await postData("send-core-topics", {
          core_topic_ids: assessmentState.coreTopics,
        });

        console.log("API response from send-core-topics:", result);
        console.log(
          "Does result contain learning_times?",
          !!result?.learning_times
        );
        console.log("Learning times data structure:", result?.learning_times);

        // Check both result.learning_times and result.data.learning_times as the API might return either structure
        const learningTimes =
          result?.learning_times || result?.data?.learning_times;

        if (
          learningTimes &&
          Array.isArray(learningTimes) &&
          learningTimes.length > 0
        ) {
          // Make sure we have the proper structure for moveToTiming
          const timingData = result?.learning_times
            ? result
            : { learning_times: learningTimes };
          // Move to timing question
          moveToTiming(timingData);
        } else {
          console.log(
            "No learning_times found in response, proceeding to final step"
          );
          // No timing options, proceed to final step
          try {
            const finalResult = await postData("recommended-courses", {
              category_ids: assessmentState.categories,
              core_topic_ids: assessmentState.coreTopics,
              learning_time_ids: [],
            });

            completeAssessment(finalResult);
            navigate("/assessment-complete", {
              state: { result: finalResult },
            });
          } catch (error) {
            console.error("Error completing assessment:", error);
          }
        }
      } catch (error) {
        console.error("Error sending core topics:", error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleTimingNext = async () => {
    if (!assessmentState.timings || assessmentState.timings.length === 0) {
      alert(
        "Please select at least one learning time option before continuing."
      );
      return;
    }

    setSubmitting(true);
    try {
      // Create API parameters - only core_topic_ids and learning_time_ids are needed
      const apiParams = {
        core_topic_ids: assessmentState.coreTopics,
        learning_time_ids: assessmentState.timings,
      };

      // Make the final API call with only the required parameters
      const result = await postData("recommended-courses", apiParams);

      if (result) {
        // Mark assessment as completed in context
        completeAssessment(result);

        // Navigate to results page
        navigate("/assessment-complete", {
          state: { result },
        });
      }
    } catch (error) {
      console.error("Error getting recommended courses:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle back navigation between steps
  const handlePrevious = useCallback(() => {
    if (assessmentState.currentStep === "timing") {
      // Go back from timing to core topics
      goBackToCoreTopics();
    } else if (assessmentState.currentStep === "coreTopic") {
      if (assessmentState.currentCategoryIndex > 0) {
        // Go back to previous category within core topics
        prevCategory();
      } else {
        // Go back from first core topic to categories
        goBackToCategories();
      }
    }
  }, [
    assessmentState.currentStep,
    assessmentState.currentCategoryIndex,
    goBackToCoreTopics,
    goBackToCategories,
    prevCategory,
  ]);

  const handleNextQuestion = () => {
    switch (assessmentState.currentStep) {
      case "category":
        handleCategoryNext();
        break;
      case "coreTopic":
        handleCoreTopicNext();
        break;
      case "timing":
        handleTimingNext();
        break;
      default:
        console.error("Unknown question type:", assessmentState.currentStep);
    }
  };

  if (isLoading || submitting) {
    return (
      <div className="flex mt-24 items-centser justify-center h-[50vh]">
        <Spinner />
      </div>
    );
  }

  // CategoryQuestion doesn't need a back button as it's the first step
  const shouldShowCategoryBackButton = false;

  // Render different question components based on current step
  const renderQuestion = () => {
    switch (assessmentState.currentStep) {
      case "category":
        return (
          <CategoryQuestion
            question={assessmentState.currentQuestion}
            onAnswerChange={handleCategoryAnswer}
            onNext={handleNextQuestion}
            onPrevious={handlePrevious}
            savedResponse={assessmentState.categories}
            canGoBack={shouldShowCategoryBackButton}
          />
        );
      case "coreTopic":
        return (
          <CoreTopicQuestion
            question={assessmentState.currentQuestion}
            onAnswerChange={handleCoreTopicAnswer}
            onNext={handleNextQuestion}
            onPrevious={handlePrevious}
            savedResponse={getCurrentCategoryTopics()}
            currentCategoryIndex={assessmentState.currentCategoryIndex}
          />
        );
      case "timing":
        return (
          <TimingQuestion
            question={assessmentState.currentQuestion}
            onAnswerChange={handleTimingAnswer}
            onNext={handleNextQuestion}
            onPrevious={handlePrevious}
            savedResponse={assessmentState.timings}
          />
        );
      default:
        return <div className="text-white">Unknown question type</div>;
    }
  };

  return (
    <div className="lg:w-1/2 xxl:w-[40%] mx-auto mt-secondary lg:mt-primary">
      <Container>
        {renderQuestion()}

        {/* Testing button - remove in production */}
        {showResetButton && (
          <div className="mt-4 text-center">
            <button
              onClick={handleResetAssessment}
              className="bg-red-600 text-white px-8 py-1.5 rounded-md text-sm"
            >
              Reset Assessment (Testing Only)
            </button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Assesment;
