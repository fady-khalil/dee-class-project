import React, { createContext, useContext, useReducer, useEffect } from "react";

// Assessment steps
const STEPS = {
  CATEGORY: "category",
  CORE_TOPIC: "coreTopic",
  TIMING: "timing",
};

// Assessment status
export const ASSESSMENT_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

// Initial state
const initialState = {
  status: ASSESSMENT_STATUS.NOT_STARTED,
  currentStep: STEPS.CATEGORY,
  currentQuestion: null,
  categories: [],
  coreTopics: [],
  timings: [],
  currentCategoryIndex: 0,
  allCoreTopics: [],
  previousQuestions: [],
  result: null,
  apiParams: null,
};

// Action types
const ACTION_TYPES = {
  START_ASSESSMENT: "START_ASSESSMENT",
  SET_CATEGORIES: "SET_CATEGORIES",
  MOVE_TO_CORE_TOPIC: "MOVE_TO_CORE_TOPIC",
  SET_CORE_TOPICS: "SET_CORE_TOPICS",
  NEXT_CATEGORY: "NEXT_CATEGORY",
  PREV_CATEGORY: "PREV_CATEGORY",
  MOVE_TO_TIMING: "MOVE_TO_TIMING",
  SET_TIMINGS: "SET_TIMINGS",
  GO_BACK_TO_CATEGORIES: "GO_BACK_TO_CATEGORIES",
  GO_BACK_TO_CORE_TOPICS: "GO_BACK_TO_CORE_TOPICS",
  COMPLETE_ASSESSMENT: "COMPLETE_ASSESSMENT",
  RESET_ASSESSMENT: "RESET_ASSESSMENT",
  LOAD_SAVED_ASSESSMENT: "LOAD_SAVED_ASSESSMENT",
  SET_API_PARAMS: "SET_API_PARAMS",
};

// Reducer function
const assessmentReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.START_ASSESSMENT:
      return {
        ...state,
        status: ASSESSMENT_STATUS.IN_PROGRESS,
        currentStep: STEPS.CATEGORY,
        currentQuestion: action.payload.question,
        categories: action.payload.initialSelected || [],
      };

    case ACTION_TYPES.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
      };

    case ACTION_TYPES.MOVE_TO_CORE_TOPIC:
      return {
        ...state,
        currentStep: STEPS.CORE_TOPIC,
        currentQuestion: action.payload,
        currentCategoryIndex: 0,
        previousQuestions: [
          ...state.previousQuestions,
          {
            step: STEPS.CATEGORY,
            data: state.currentQuestion,
          },
        ],
      };

    case ACTION_TYPES.SET_CORE_TOPICS:
      return {
        ...state,
        allCoreTopics: action.payload.updatedCoreTopics,
        coreTopics: action.payload.allTopicIds,
      };

    case ACTION_TYPES.NEXT_CATEGORY:
      return {
        ...state,
        currentCategoryIndex: state.currentCategoryIndex + 1,
      };

    case ACTION_TYPES.PREV_CATEGORY:
      return {
        ...state,
        currentCategoryIndex: state.currentCategoryIndex - 1,
      };

    case ACTION_TYPES.MOVE_TO_TIMING:
      return {
        ...state,
        currentStep: STEPS.TIMING,
        currentQuestion: action.payload,
        previousQuestions: [
          ...state.previousQuestions,
          {
            step: STEPS.CORE_TOPIC,
            data: state.currentQuestion,
            categoryIndex: state.currentCategoryIndex,
          },
        ],
      };

    case ACTION_TYPES.SET_TIMINGS:
      return {
        ...state,
        timings: action.payload,
      };

    case ACTION_TYPES.GO_BACK_TO_CATEGORIES:
      const categoriesQuestion = state.previousQuestions.find(
        (q) => q.step === STEPS.CATEGORY
      );
      return {
        ...state,
        currentStep: STEPS.CATEGORY,
        currentQuestion: categoriesQuestion?.data || null,
        previousQuestions: state.previousQuestions.filter(
          (q) => q.step !== STEPS.CATEGORY
        ),
      };

    case ACTION_TYPES.GO_BACK_TO_CORE_TOPICS:
      const coreTopicsQuestion = state.previousQuestions.find(
        (q) => q.step === STEPS.CORE_TOPIC
      );
      return {
        ...state,
        currentStep: STEPS.CORE_TOPIC,
        currentQuestion: coreTopicsQuestion?.data || null,
        currentCategoryIndex: coreTopicsQuestion?.categoryIndex || 0,
        previousQuestions: state.previousQuestions.filter(
          (q) => q.step !== STEPS.CORE_TOPIC
        ),
      };

    case ACTION_TYPES.COMPLETE_ASSESSMENT:
      return {
        ...state,
        status: ASSESSMENT_STATUS.COMPLETED,
        result: action.payload,
      };

    case ACTION_TYPES.SET_API_PARAMS:
      return {
        ...state,
        apiParams: action.payload,
      };

    case ACTION_TYPES.RESET_ASSESSMENT:
      return initialState;

    case ACTION_TYPES.LOAD_SAVED_ASSESSMENT:
      return action.payload;

    default:
      return state;
  }
};

// Create context
const AssessmentContext = createContext(null);

// Provider component
export const AssessmentProvider = ({ children }) => {
  // Load saved state from localStorage if available
  const getSavedState = () => {
    try {
      const savedState = localStorage.getItem("assessmentState");
      return savedState ? JSON.parse(savedState) : initialState;
    } catch (error) {
      console.error("Error loading assessment state from localStorage:", error);
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(assessmentReducer, getSavedState());

  // Save state to localStorage whenever status changes to COMPLETED
  useEffect(() => {
    if (state.status === ASSESSMENT_STATUS.COMPLETED) {
      try {
        // Create apiParams to store necessary data for future API calls
        // Only store core_topic_ids and learning_time_ids as these are the only required parameters
        const apiParams = {
          core_topic_ids: state.coreTopics,
          learning_time_ids: state.timings,
        };

        // Update state with API params
        dispatch({
          type: ACTION_TYPES.SET_API_PARAMS,
          payload: apiParams,
        });

        // Store complete state in localStorage
        localStorage.setItem(
          "assessmentState",
          JSON.stringify({
            ...state,
            apiParams,
          })
        );
      } catch (error) {
        console.error("Error saving assessment state to localStorage:", error);
      }
    }
  }, [state.status]);

  // Action creators
  const startAssessment = (question, initialSelected) => {
    dispatch({
      type: ACTION_TYPES.START_ASSESSMENT,
      payload: { question, initialSelected },
    });
  };

  const setCategories = (categories) => {
    dispatch({
      type: ACTION_TYPES.SET_CATEGORIES,
      payload: categories,
    });
  };

  const moveToCoreTopic = (coreTopicsData) => {
    dispatch({
      type: ACTION_TYPES.MOVE_TO_CORE_TOPIC,
      payload: coreTopicsData,
    });
  };

  const setCoreTopics = (updatedCoreTopics, allTopicIds) => {
    dispatch({
      type: ACTION_TYPES.SET_CORE_TOPICS,
      payload: { updatedCoreTopics, allTopicIds },
    });
  };

  const nextCategory = () => {
    dispatch({ type: ACTION_TYPES.NEXT_CATEGORY });
  };

  const prevCategory = () => {
    dispatch({ type: ACTION_TYPES.PREV_CATEGORY });
  };

  const moveToTiming = (timingData) => {
    dispatch({
      type: ACTION_TYPES.MOVE_TO_TIMING,
      payload: timingData,
    });
  };

  const setTimings = (timings) => {
    dispatch({
      type: ACTION_TYPES.SET_TIMINGS,
      payload: timings,
    });
  };

  const goBackToCategories = () => {
    dispatch({ type: ACTION_TYPES.GO_BACK_TO_CATEGORIES });
  };

  const goBackToCoreTopics = () => {
    dispatch({ type: ACTION_TYPES.GO_BACK_TO_CORE_TOPICS });
  };

  const completeAssessment = (result) => {
    dispatch({
      type: ACTION_TYPES.COMPLETE_ASSESSMENT,
      payload: result,
    });
  };

  const resetAssessment = () => {
    localStorage.removeItem("assessmentState");
    dispatch({ type: ACTION_TYPES.RESET_ASSESSMENT });
  };

  const setApiParams = (params) => {
    dispatch({
      type: ACTION_TYPES.SET_API_PARAMS,
      payload: params,
    });
  };

  // Helper function to get core topics for current category
  const getCurrentCategoryTopics = () => {
    return (
      state.allCoreTopics.find(
        (item) => item.categoryIndex === state.currentCategoryIndex
      )?.topicIds || []
    );
  };

  return (
    <AssessmentContext.Provider
      value={{
        state,
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
        setApiParams,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

// Custom hook to use the assessment context
export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};
