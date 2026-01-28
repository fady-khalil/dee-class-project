import { useState } from "react";
import BASE_URL from "Utilities/BASE_URL";

const useAuthFetchNoLang = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(null);

  const fetchData = async (url, token = null) => {
    setIsLoading(true);
    setIsError(null);

    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/${url}`, {
        method: "GET",
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Network response was not ok");
      }

      setData(result);
      return result;
    } catch (error) {
      setIsError(error.message || "An error occurred");
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, isError, fetchData };
};

export default useAuthFetchNoLang;
