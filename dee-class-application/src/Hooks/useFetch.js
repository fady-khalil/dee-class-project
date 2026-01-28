import { useState } from "react";
import { useTranslation } from "react-i18next";
import BASE_URL from "../config/BASE_URL";

/**
 * Hook for making GET requests with language support
 * @returns {Object} Object containing data, loading state, error state, and fetch function
 */
const useFetch = () => {
  const { i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(null);

  const fetchData = async (url, token = null) => {
    setIsLoading(true);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}/${i18n.language}/${url}`, {
        headers,
      });

      if (!response.ok) {
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

export default useFetch;
