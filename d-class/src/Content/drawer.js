import { useTranslation } from "react-i18next";

const GetDrawerLinks = () => {
  const { t } = useTranslation();

  const navigationContent = [
    {
      name: t("navigation.browse"),
      path: "/categories",
    },
    {
      name: t("footer.nav.about"),
      path: "/about",
    },
    {
      name: t("navigation.plans"),
      path: "/plans",
    },
    // {
    //   name: t("navigation.at_work"),
    //   path: "/for-business",
    // },
    {
      name: t("footer.nav.news"),
      path: "/news",
    },
    {
      name: t("navigation.contact"),
      path: "",
    },
  ];

  return navigationContent;
};

export default GetDrawerLinks;

const faq = [
  {
    FAQ_category: "Category name",
    FAQ_content: [
      {
        question: "Question",
        answer: "Answer",
      },
      {
        question: "Question",
        answer: "Answer",
      },
    ],
  },
];
