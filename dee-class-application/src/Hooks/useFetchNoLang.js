import { useState } from "react";
import BASE_URL from "../config/BASE_URL";

/**
 * Hook for making GET requests without language in the URL
 * @returns {Object} Object containing data, loading state, error state, and fetch function
 */
const useFetchNoLang = () => {
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
      const response = await fetch(`${BASE_URL}/${url}`, {
        method: "GET",
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

export default useFetchNoLang;
