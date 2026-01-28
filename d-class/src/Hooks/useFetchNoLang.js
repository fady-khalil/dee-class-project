import { useState } from "react";
import BASE_URL from "Utilities/BASE_URL";
const useFetchNoLang = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(null);

  const fetchData = async (url, body = null) => {
    setIsLoading(true);
    console.log("response", `${BASE_URL}/${url}`);
    console.log(body);

    try {
      const response = await fetch(`${BASE_URL}/${url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("response", response);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("result", result);

      setData(result);
      return result;
    } catch (error) {
      setIsError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, isError, fetchData };
};

export default useFetchNoLang;
