import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { ReactComponent as ErrorIcon } from "assests/undraw_fixing_bugs_w7gi.svg";

/**
 * ErrorHandler - A reusable component for displaying API errors with localization
 *
 * @param {Object} props - Component props
 * @param {string} props.errorType - Type of error (network, timeout, server, auth, notFound, default)
 * @param {string} props.customMessage - Optional custom error message
 * @param {function} props.onRetry - Callback function for retry button
 * @param {boolean} props.isWhite - Set to true for white text (for dark backgrounds)
 * @param {boolean} props.fullScreen - Set to true to display in full screen
 * @param {string} props.className - Additional classes to apply to the component
 * @returns {JSX.Element} ErrorHandler component
 */
const ErrorHandler = ({
  errorType = "default",
  customMessage,
  onRetry,
  isWhite = false,
  fullScreen = false,
  className = "",
}) => {
  const { t } = useTranslation();

  // Map error types to i18n keys
  const errorMessages = {
    network: "api.fetch.networkError",
    timeout: "api.fetch.timeout",
    server: "api.fetch.error",
    auth: "auth.login.error",
    notFound: "api.fetch.error",
    default: "api.fetch.error",
  };

  // Get the appropriate error message
  const message =
    customMessage || t(errorMessages[errorType] || errorMessages.default);

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "h-[100vh] w-full" : "w-full py-8"
      } ${className}`}
    >
      <div className="w-full max-w-3xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 p-6 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex-1 text-center md:text-left">
            <h3
              className={`text-xl font-medium mb-2 ${
                isWhite ? "text-white" : "text-gray-800 dark:text-white"
              }`}
            >
              {t("api.fetch.error").includes("api.fetch.error")
                ? "Oops! Something went wrong."
                : t("api.fetch.error")}
            </h3>
            <p
              className={`${
                isWhite ? "text-white/80" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {message}
            </p>

            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors duration-200 inline-flex items-center gap-2"
                aria-label={t("general.continue")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7.805V10a1 1 0 01-2 0V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("general.continue")}
              </button>
            )}
          </div>

          <div className="flex-1 max-w-[200px] md:max-w-xs">
            <ErrorIcon className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

ErrorHandler.propTypes = {
  errorType: PropTypes.oneOf([
    "network",
    "timeout",
    "server",
    "auth",
    "notFound",
    "default",
  ]),
  customMessage: PropTypes.string,
  onRetry: PropTypes.func,
  isWhite: PropTypes.bool,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
};

export default ErrorHandler;
