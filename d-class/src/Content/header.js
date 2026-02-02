import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { CategoriesContext } from "Context/General/CategoriesContext";

const GetLinks = () => {
  const { t } = useTranslation();
  const { categories, getCategoriesLoading, getCategoriesError } =
    useContext(CategoriesContext);

  const navigationContent = [
    {
      id: 1,
      name: t("navigation.contact"),
      path: "/contact",
    },
    {
      id: 3,
      name: t("navigation.plans"),
      path: "/plans",
    },
    {
      id: 4,
      name: t("navigation.browse"),
      mega: true,
      data: categories,
    },
  ];

  return navigationContent;
};

export default GetLinks;
