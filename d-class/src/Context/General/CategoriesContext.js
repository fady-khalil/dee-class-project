import { createContext, useEffect } from "react";
import useFetch from "Hooks/useFetch";
const CategoriesContext = createContext();

const CategoriesContextProvider = ({ children }) => {
  const {
    data: categories,
    isLoading: getCategoriesLoading,
    isError: getCategoriesError,
    fetchData,
  } = useFetch();

  useEffect(() => {
    fetchData("course-categories");
  }, []);

  // Extract the data array from the response
  const categoriesData = categories?.data || [];

  return (
    <CategoriesContext.Provider
      value={{ categories: categoriesData, getCategoriesLoading, getCategoriesError }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export { CategoriesContext, CategoriesContextProvider };
