import { useState } from "react";
import BASE_URL from "../config/BASE_URL";

/**
 * Hook for making payment-related POST requests
 * @returns {Object} Object containing data, loading state, error state, and payment function
 */
const usePayment = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);
  const [responseInfo, setResponseInfo] = useState(null);

  const postData = async (url, body) => {
    try {
      setIsLoading(true);
      setValidationErrors(null);
      setIsError(null);
      setResponseInfo(null);

      const response = await fetch(`${BASE_URL}/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      // Store response info regardless of success/failure
      const responseData = {
        success: result.success,
        status: response.status,
        message: result.message,
      };

      setResponseInfo(responseData);

      if (!response.ok) {
        // Handle validation errors (422 status or any other error)
        if (result.data) {
          setValidationErrors(result.data);
        }

        return {
          ...responseData,
          validationErrors: result.data || null,
          data: result.data || null,
        };
      }

      setData(result);
      return {
        ...responseData,
        data: result.data || result,
      };
    } catch (error) {
      setIsError(error.message || "An error occurred");
      return {
        success: false,
        status: 500,
        message: error.message || "An error occurred",
        error: error.message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, isError, validationErrors, responseInfo, postData };
};

export default usePayment;
