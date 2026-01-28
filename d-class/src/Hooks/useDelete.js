import { useState } from "react";
import { useTranslation } from "react-i18next";
import BASE_URL from "Utilities/BASE_URL";

const useDelete = () => {
  const { i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);
  const [responseInfo, setResponseInfo] = useState(null);

  const deleteData = async (url, token = null) => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    try {
      setIsLoading(true);
      setValidationErrors(null);
      setIsError(null);
      setResponseInfo(null);

      const response = await fetch(`${BASE_URL}/${i18n.language}/${url}`, {
        method: "DELETE",
        headers,
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

  return { data, isLoading, isError, deleteData };
};

export default useDelete;
