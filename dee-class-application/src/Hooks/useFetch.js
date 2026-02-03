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
    console.log(`${BASE_URL}/${i18n.language}/${url}`);
    setIsLoading(true);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const fullUrl = `${BASE_URL}/${i18n.language}/${url}`;
      console.log("Fetching:", fullUrl);

      const response = await fetch(fullUrl, {
        headers,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetch result:", result?.success);
      setData(result);
      return result;
    } catch (error) {
      console.log("Fetch error:", error.message);
      setIsError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, isError, fetchData };
};

export default useFetch;
