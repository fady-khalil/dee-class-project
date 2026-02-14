import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "@phosphor-icons/react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostData from "Hooks/usePostData";
import GetDrawerLinks from "Content/drawer";
import GetMobileMenuLinks from "Content/mobileMenu";
import Logo from "./Components/Logo";
import AuthButtons from "./Components/AuthButtons";
import LanguageSwitcher from "Components/Button/LanguageSwitcher";
import Spinner from "Components/RequestHandler/Spinner";

const MobileDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoggedIn, allowedCourses, selectedUser, logoutHandler, token } =
    useContext(LoginAuthContext);
  const navigate = useNavigate();
  const { postData, isLoading } = usePostData();

  const hasFullNav =
    isAuthenticated || (isLoggedIn && allowedCourses?.length > 0);
  const drawerLinks = GetDrawerLinks();
  const mobileMenuLinks = GetMobileMenuLinks(isAuthenticated);
  const links = hasFullNav ? mobileMenuLinks : drawerLinks;

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleLinkClick = (path) => {
    onClose();
    setTimeout(() => navigate(path), 300);
  };

  const logout = async () => {
    await postData("logout", {}, token);
    logoutHandler();
    onClose();
    navigate("/");
  };

  return (
    <div
      className={`fixed inset-0 z-[10000] transition-all duration-300 ${
        isOpen ? "visible" : "invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel — slides from end (right LTR, left RTL) */}
      <div
        className={`absolute top-0 end-0 w-full sm:w-80 h-[100dvh] bg-black flex flex-col transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between text-white py-4 px-4 border-b border-white/20 bg-black z-10">
          <Logo className="w-24" onClick={onClose} />
          <button onClick={onClose} className="text-white hover:text-primary transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col text-white py-3 px-4">
            {links.map((link, index) => (
              <button
                key={index}
                onClick={() => handleLinkClick(link.path)}
                className="border-b border-white/15 py-4 capitalize text-start text-lg hover:text-primary transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Auth section */}
          <div className="px-4 mt-6">
            {hasFullNav ? (
              <AuthenticatedSection
                selectedUser={selectedUser}
                onLogout={logout}
                isLoading={isLoading}
                onClose={onClose}
                t={t}
              />
            ) : (
              <div className="flex justify-center">
                <AuthButtons onNavigate={onClose} />
              </div>
            )}
          </div>
        </div>

        {/* Language switcher at bottom */}
        <div className="py-4 px-4 border-t border-white/15 flex justify-center">
          <LanguageSwitcher isDrawer />
        </div>
      </div>
    </div>
  );
};

const AuthenticatedSection = ({ selectedUser, onLogout, isLoading, onClose, t }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-white gap-y-4">
      {/* Profile */}
      <button
        onClick={() => {
          onClose();
          setTimeout(() => navigate("/my-profiles"), 300);
        }}
        className="flex items-center gap-x-3"
      >
        <div className="bg-lightGrey rounded-full font-bold text-lg h-10 w-10 flex items-center justify-center">
          {selectedUser?.name?.charAt(0) || "U"}
        </div>
        <span className="font-bold text-lg">{selectedUser?.name}</span>
      </button>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-3/4 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
      >
        {isLoading ? <Spinner isSmall /> : t("navigation.logout")}
      </button>
    </div>
  );
};

export default MobileDrawer;
