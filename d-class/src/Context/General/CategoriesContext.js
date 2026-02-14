import { createContext, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import BASE_URL from "Utilities/BASE_URL";

const CategoriesContext = createContext();

const CategoriesContextProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [categories, setCategories] = useState(null);
  const [getCategoriesLoading, setLoading] = useState(false);
  const [getCategoriesError, setError] = useState(null);
  const fetchedRef = useRef(false);

  // Set categories from an external source (e.g. /home response)
  const setCategoriesData = useCallback((data) => {
    if (data) {
      setCategories(data);
      fetchedRef.current = true;
    }
  }, []);

  // Fetch only if not already loaded (for non-home pages like /categories)
  const fetchCategories = useCallback(async () => {
    if (fetchedRef.current || categories) return;
    fetchedRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/${i18n.language}/course-categories`
      );
      const json = await res.json();
      setCategories(json.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [categories, i18n.language]);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        getCategoriesLoading,
        getCategoriesError,
        setCategoriesData,
        fetchCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export { CategoriesContext, CategoriesContextProvider };
