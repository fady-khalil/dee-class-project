// Footer navigation items with translation keys instead of hardcoded strings
// if isAuthenticated is true, then the item can be shown when the user is authenticated
// if common is true, the item will be shown regardless of authentication status
const FooterNavigationItems = [
  {
    name: "footer.nav.home",
    path: "/",
    isAuthenticated: true,
    common: true,
  },
  {
    name: "footer.nav.courses",
    path: "/categories",
    isAuthenticated: false,
    common: true,
  },
  {
    name: "footer.nav.about",
    path: "/about",
    isAuthenticated: true,
    common: false,
  },
  // {
  //   name: "footer.nav.at_work",
  //   path: "/for-business",
  //   isAuthenticated: false,
  //   common: false,
  // },
  {
    name: "footer.nav.plans",
    path: "/plans",
    isAuthenticated: false,
    common: false,
  },
  {
    name: "footer.nav.news",
    path: "/news",
    isAuthenticated: true,
    common: false,
  },

  {
    name: "navigation.sign_in",
    path: "/login",
    isAuthenticated: false,
    common: false,
  },
  {
    name: "navigation.sign_up",
    path: "/register",
    isAuthenticated: false,
    common: false,
  },
  {
    name: "footer.nav.contact",
    path: "/contact",
    isAuthenticated: false,
    common: true,
  },
  {
    name: "footer.nav.privacy",
    path: "/privacy",
    isAuthenticated: false,
    common: true,
  },
  {
    name: "footer.nav.terms",
    path: "/terms",
    isAuthenticated: false,
    common: true,
  },
];

export default FooterNavigationItems;
