/**
 * Middleware to handle language detection from URL
 * Supports English (en) and Arabic (ar) languages
 */

// Supported languages
const SUPPORTED_LANGUAGES = ["en", "ar"];
const DEFAULT_LANGUAGE = "en";

/**
 * Middleware to detect language from URL path and set language context
 * URL format: /api/:language/endpoint
 */
const languageMiddleware = (req, res, next) => {
  // Extract language from URL path
  const pathParts = req.originalUrl.split("/");
  const languageIndex = pathParts.indexOf("api") + 1;
  const requestedLanguage = pathParts[languageIndex];

  // Check if the path includes a language code
  if (SUPPORTED_LANGUAGES.includes(requestedLanguage)) {
    // Set language in request object for controllers to use
    req.language = requestedLanguage;

    // Modify the URL to remove the language segment for proper routing
    // This allows the existing route handlers to work without changes
    const newUrl = pathParts
      .filter((part, index) => index !== languageIndex)
      .join("/");
    req.url = req.url.replace(req.originalUrl, newUrl);
  } else {
    // If no valid language found, use default
    req.language = DEFAULT_LANGUAGE;
  }

  next();
};

/**
 * Middleware specifically for admin routes that need both languages
 */
const adminLanguageMiddleware = (req, res, next) => {
  // For admin routes, we want to provide both languages
  req.isAdminRoute = true;
  next();
};

/**
 * Middleware to translate API response messages
 * This intercepts the response and translates all messages before sending
 */
import { translateApiResponse } from "../utils/languageUtils.js";

const responseTranslationMiddleware = (req, res, next) => {
  // Store original res.json function
  const originalJson = res.json;

  // Override res.json to translate messages before sending
  res.json = function (data) {
    // Only translate if we have language context and it's not an admin route
    if (req.language && !req.isAdminRoute) {
      // Translate the response messages
      const translatedData = translateApiResponse(data, req.language);
      // Call the original json function with translated data
      return originalJson.call(this, translatedData);
    }

    // If admin route or no language, just use original data
    return originalJson.call(this, data);
  };

  next();
};

export {
  languageMiddleware,
  adminLanguageMiddleware,
  responseTranslationMiddleware,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
};
