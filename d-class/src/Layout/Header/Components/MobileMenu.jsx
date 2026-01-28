import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import LanguageSwitcher from "Components/Button/LanguageSwitcher";
import GetMobileMenuLinks from "Content/mobileMenu";
import logo from "assests/logos/dclass.png";
import { useNavigate } from "react-router-dom";
const MobileMenu = ({ isOpen, toggleMenu }) => {
  const { t } = useTranslation();
  const { selectedUser, logoutHandler, isAuthenticated } =
    useContext(LoginAuthContext);
  const mobileMenuLinks = GetMobileMenuLinks();
  const navigate = useNavigate();
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-0 right-0 w-[100%] h-[100dvh] z-[10000000] transition-all duration-300 shadow-lg shadow-white/30 bg-black overflow-y-auto ${
        isOpen ? "translate-x-0 " : "translate-x-full"
      }`}
    >
      {/* header */}
      <div className="sticky top-0 flex items-center justify-between text-white py-4 px-4 border-b border-white bg-black z-10">
        <Link to={isAuthenticated ? "/categories" : "/"}>
          <img className="w-24" src={logo} alt="D-Class Logo" />
        </Link>
        <button
          onClick={toggleMenu}
          className="text-white focus:outline-none"
          aria-label="Close mobile menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* menu links */}
      <div className="flex flex-col gap-4 text-white py-3 px-4">
        {mobileMenuLinks.map((link, index) => (
          <Link
            key={index}
            onClick={toggleMenu}
            to={link.path}
            className="border-b border-white/30 py-3 capitalize"
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* profile and logout */}
      <div className="flex items-center flex-col mt-32 text-white py-3 px-2 ">
        <div className="flex items-center gap-x-3 mb-4">
          <Link
            onClick={toggleMenu}
            to="/my-profiles"
            className="text-white bg-lightGrey rounded-full font-bold text-lg h-10 w-10 flex items-center justify-center"
          >
            {selectedUser?.name.charAt(0)}
          </Link>
          <p className="text-white font-bold text-lg">{selectedUser?.name}</p>
        </div>
        <button
          className="mt-2 w-3/4 mx-auto py-2 px-4 bg-red-600 text-white rounded"
          onClick={() => {
            logoutHandler();
            navigate("/");
            toggleMenu();
          }}
        >
          {t("navigation.logout")}
        </button>
        <div className="mt-6">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
