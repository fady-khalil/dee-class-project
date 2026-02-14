import { useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import Logo from "./Components/Logo";
import BrowseMenu from "./Components/BrowseMenu";
import SearchBar from "./Components/SearchBar";
import AuthButtons from "./Components/AuthButtons";
import UserMenu from "./Components/UserMenu";
import LanguageSwitcher from "Components/Button/LanguageSwitcher";

const DesktopNav = () => {
  const { isAuthenticated, isLoggedIn, allowedCourses } =
    useContext(LoginAuthContext);
  const hasFullNav =
    isAuthenticated || (isLoggedIn && allowedCourses?.length > 0);

  return (
    <div className="hidden xl:flex items-center gap-x-6 w-full">
      {/* Logo */}
      <Logo />

      {/* Navigation — Browse mega-menu + links (unauthenticated) OR inline links (authenticated) */}
      {hasFullNav ? (
        <AuthenticatedLinks isAuthenticated={isAuthenticated} />
      ) : (
        <BrowseMenu />
      )}

      {/* Right side: search icon + auth/user + language */}
      <div className="flex items-center gap-x-4 ms-auto">
        <SearchBar />
        {hasFullNav ? <UserMenu /> : <AuthButtons />}
        <LanguageSwitcher />
      </div>
    </div>
  );
};

const AuthenticatedLinks = ({ isAuthenticated }) => {
  const { t } = useTranslation();
  const linkClass =
    "text-white font-medium text-lg capitalize hover:text-primary transition-colors whitespace-nowrap";

  return (
    <nav className="flex items-center gap-x-6">
      <Link to="/categories" state={{ isAuthenticated: true }} className={linkClass}>
        {t("navigation.browse")}
      </Link>
      <Link
        to={isAuthenticated ? "/my-progress" : "/my-courses"}
        className={linkClass}
      >
        {isAuthenticated
          ? t("navigation.my_progress")
          : t("navigation.my_courses")}
      </Link>
      <Link to="/contact" className={linkClass}>
        {t("navigation.contact")}
      </Link>
    </nav>
  );
};

export default DesktopNav;
