import { useTranslation } from "react-i18next";

/**
 * Mobile menu links configuration
 * To be used in both authenticated and unauthenticated headers
 */
const GetMobileMenuLinks = () => {
  const { t } = useTranslation();

  const mobileMenuLinks = [
    {
      name: t("navigation.browse"),
      path: "/categories",
    },
    {
      name: t("navigation.my_progress"),
      path: "/my-progress",
    },
    {
      name: t("footer.nav.news"),
      path: "/news",
    },
    {
      name: t("navigation.contact"),
      path: "/contact",
    },
  ];

  return mobileMenuLinks;
};

export default GetMobileMenuLinks;
