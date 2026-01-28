import { useState } from "react";
import { useTranslation } from "react-i18next";
import BASE_URL from "../config/BASE_URL";

/**
 * Hook for making POST requests to the API with the current language
 * @returns {Object} Hook methods and state
 */
export const usePostData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {string} token - Authorization token
   * @returns {Promise<Object>} Response data
   */
  const postData = async (endpoint, data, token = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentLanguage = i18n.language || "en";
      const url = `${BASE_URL}/${currentLanguage}/${endpoint}`;

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      setIsLoading(false);
      return responseData;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "An error occurred");
      return {
        success: false,
        message: err.message || "api.network.error",
      };
    }
  };

  return { postData, isLoading, error };
};

/**
 * Hook for making POST requests to the API without language prefix
 * @returns {Object} Hook methods and state
 */
export const usePostDataNoLang = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Make a POST request to the API without language prefix
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {string} token - Authorization token
   * @returns {Promise<Object>} Response data
   */
  const postData = async (endpoint, data, token = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `${BASE_URL}/${endpoint}`;

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      setIsLoading(false);
      return responseData;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "An error occurred");
      return {
        success: false,
        message: err.message || "api.network.error",
      };
    }
  };

  return { postData, isLoading, error };
};
