import { useTranslation } from "react-i18next";

/**
 * Mobile menu links configuration
 * @param {boolean} isAuthenticated — true for plan subscribers
 */
const GetMobileMenuLinks = (isAuthenticated) => {
  const { t } = useTranslation();

  const mobileMenuLinks = [
    { name: t("navigation.browse"), path: "/categories" },
    isAuthenticated
      ? { name: t("navigation.my_progress"), path: "/my-progress" }
      : { name: t("navigation.my_courses"), path: "/my-courses" },
    ...(isAuthenticated
      ? [{ name: t("navigation.my_collection"), path: "/my-collection" }]
      : []),
    { name: t("navigation.contact"), path: "/contact" },
  ];

  return mobileMenuLinks;
};

export default GetMobileMenuLinks;
