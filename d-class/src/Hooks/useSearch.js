import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import BASE_URL from "Utilities/BASE_URL";

const useSearch = (query) => {
  const { i18n } = useTranslation();
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const suggestionsLoadedRef = useRef(false);

  // Lazy — only called when search bar expands
  const loadSuggestions = useCallback(async () => {
    if (suggestionsLoadedRef.current) return;
    suggestionsLoadedRef.current = true;
    try {
      const res = await fetch(
        `${BASE_URL}/${i18n.language}/search/suggestions`
      );
      const json = await res.json();
      if (json.success) setSuggestions(json.data);
    } catch {
      // silent fail
    }
  }, [i18n.language]);

  // Debounced search when query changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    const trimmed = query?.trim() || "";
    if (trimmed.length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `${BASE_URL}/${i18n.language}/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        if (json.success) setResults(json.data);
      } catch (err) {
        if (err.name !== "AbortError") setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, i18n.language]);

  return { results, suggestions, isLoading, loadSuggestions };
};

export default useSearch;
