import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import BASE_URL from "Utilities/BASE_URL";

/**
 * Drop-in cached replacement for useFetch.
 *
 * Usage:
 *   const { data, isLoading, isError } = useApiQuery("home");
 *   const { data } = useApiQuery(`courses/category/${slug}`);
 *   const { data } = useApiQuery("packages", { token });
 *   const { data } = useApiQuery(slug ? `instructors/${slug}` : null);
 */
const useApiQuery = (endpoint, { token, enabled } = {}) => {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: [endpoint, i18n.language],
    queryFn: async () => {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(
        `${BASE_URL}/${i18n.language}/${endpoint}`,
        { headers }
      );
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    enabled: enabled ?? !!endpoint,
  });
};

export default useApiQuery;
