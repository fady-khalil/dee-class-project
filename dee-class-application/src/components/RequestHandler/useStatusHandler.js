import { useState, useCallback } from "react";
import messages from "../../content/messages";

/**
 * Hook for managing status messages in the application
 * @returns {Object} Status handler methods and state
 */
const useStatusHandler = () => {
  const [statusState, setStatusState] = useState({
    isVisible: false,
    status: "",
    message: "",
  });

  const showStatus = useCallback((status, messageKey, autoClose = true) => {
    setStatusState({
      isVisible: true,
      status,
      message: messageKey,
      autoClose,
    });
  }, []);

  const hideStatus = useCallback(() => {
    setStatusState((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  // Pre-defined helper methods for common status types
  const showSuccess = useCallback(
    (messageKey, autoClose = true) => {
      showStatus("success", messageKey, autoClose);
    },
    [showStatus]
  );

  const showError = useCallback(
    (messageKey, autoClose = true) => {
      showStatus("error", messageKey, autoClose);
    },
    [showStatus]
  );

  const showWarning = useCallback(
    (messageKey, autoClose = true) => {
      showStatus("warning", messageKey, autoClose);
    },
    [showStatus]
  );

  const showInfo = useCallback(
    (messageKey, autoClose = true) => {
      showStatus("info", messageKey, autoClose);
    },
    [showStatus]
  );

  // Helper function to handle API responses
  const handleApiResponse = useCallback(
    (response, successKey, errorKey = "api.fetch.error") => {
      if (response && !response.error) {
        showSuccess(successKey);
        return true;
      } else {
        const errorMessage = response?.error?.message
          ? "api.fetch.error"
          : errorKey;
        showError(errorMessage);
        return false;
      }
    },
    [showSuccess, showError]
  );

  return {
    ...statusState,
    showStatus,
    hideStatus,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    handleApiResponse,
    messages,
  };
};

export default useStatusHandler;
