import { useState } from "react";
import { useTranslation } from "react-i18next";
import BASE_URL from "../config/BASE_URL";

/**
 * Hook for making authenticated GET requests with language support
 * @returns {Object} Object containing data, loading state, error state, and fetch function
 */
const useAuthFetch = () => {
  const { i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(null);

  const fetchData = async (url, token) => {
    if (!token) {
      setIsError("Authentication token is required");
      return null;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/${i18n.language}/${url}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Handle unauthorized or other errors
        if (response.status === 401) {
          throw new Error("Unauthorized access");
        }
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (error) {
      setIsError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, isError, fetchData };
};

export default useAuthFetch;
