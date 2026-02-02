import { useContext, useState, useRef, useEffect } from "react";
import Container from "Components/Container/Container";
import { Link } from "react-router-dom";
import logo from "assests/logos/dclass.png";
import Search from "./Components/Search";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostData from "Hooks/usePostData";
import { useNavigate } from "react-router-dom";
import UserDropDown from "./Components/UserDropDown";
import LanguageSwitcher from "Components/Button/LanguageSwitcher";
import MobileMenu from "./Components/MobileMenu";
import { User } from "@phosphor-icons/react";
const AutenticatedHeader = () => {
  const { t, i18n } = useTranslation();
  const { selectedUser, logoutHandler, token } = useContext(LoginAuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { postData, isLoading, isError } = usePostData();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Desktop Header - Hidden on small screens, visible on XL */}
      <header className="hidden xl:flex bg-black w-full py-4 items-center">
        <Container>
          <div className="flex items-center justify-between gap-x-14">
            {i18n.language === "en" && (
              <>
                <Link to="/categories">
                  <img className="w-32" src={logo} alt="" />
                </Link>
                <Search />
                <div className="flex items-center gap-x-10">
                  <Link
                    state={{ isAuthenticated: true }}
                    to="/categories"
                    className="text-white font-bold text-lg capitalize flex items-center gap-x-2 hover:text-primary transition-colors"
                  >
                    {t("navigation.browse")}
                  </Link>
                  <Link
                    to="/my-progress"
                    className="text-white font-bold text-lg capitalize flex items-center gap-x-2 hover:text-primary transition-colors"
                  >
                    <User size={22} />
                    {t("navigation.my_progress")}
                  </Link>
                  <Link
                    to="/contact"
                    className="text-white font-bold text-lg capitalize flex items-center gap-x-2 hover:text-primary transition-colors"
                  >
                    {t("navigation.contact")}
                  </Link>
                </div>

                <div className="flex items-center gap-x-10">
                  <div className="relative" ref={dropdownRef}>
                    <div
                      onClick={toggleDropdown}
                      className="flex items-center gap-x-2 cursor-pointer relative group"
                    >
                      <p className="text-white font-bold text-lg group-hover:text-gray-300 transition-colors duration-200">
                        {selectedUser?.name}
                      </p>
                      <div className="text-white bg-lightGrey rounded-full font-bold text-lg h-10 w-10 flex items-center justify-center group-hover:bg-gray-600 transition-colors duration-200">
                        {selectedUser?.name.charAt(0)}
                      </div>
                      <span
                        className={`ml-1 text-white transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <UserDropDown
                      selectedUser={selectedUser}
                      isDropdownOpen={isDropdownOpen}
                      onHandleDropDown={toggleDropdown}
                    />
                  </div>
                  <LanguageSwitcher />
                </div>
              </>
            )}

            {i18n.language === "ar" && (
              <>
                <div className="flex items-center gap-x-10">
                  <LanguageSwitcher />

                  <div className="relative" ref={dropdownRef}>
                    <div
                      onClick={toggleDropdown}
                      className="flex items-center gap-x-2 cursor-pointer relative group"
                    >
                      <p className="text-white font-bold text-lg group-hover:text-gray-300 transition-colors duration-200">
                        {selectedUser?.name}
                      </p>
                      <div className="text-white bg-lightGrey rounded-full font-bold text-lg h-10 w-10 flex items-center justify-center group-hover:bg-gray-600 transition-colors duration-200">
                        {selectedUser?.name.charAt(0)}
                      </div>
                      <span
                        className={`ml-1 text-white transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <UserDropDown
                      selectedUser={selectedUser}
                      isDropdownOpen={isDropdownOpen}
                      onHandleDropDown={toggleDropdown}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <Search />
                </div>

                <div className="flex items-center gap-x-10">
                  <Link
                    state={{ isAuthenticated: true }}
                    to="/categories"
                    className="text-white font-bold text-lg flex items-center gap-x-2 hover:text-primary transition-colors"
                  >
                    {t("navigation.browse")}
                  </Link>
                  <Link
                    to="/my-progress"
                    className="text-white font-bold text-lg flex items-center gap-x-2 hover:text-primary transition-colors"
                  >
                    <User size={22} />
                    {t("navigation.my_progress")}
                  </Link>
                  <Link
                    to="/contact"
                    className="text-white font-bold text-lg flex items-center gap-x-2 hover:text-primary transition-colors"
                  >
                    {t("navigation.contact")}
                  </Link>
                </div>

                <Link to="/categories">
                  <img className="w-32" src={logo} alt="" />
                </Link>
              </>
            )}
          </div>
        </Container>
      </header>

      {/* Mobile Header - Visible on small screens, hidden on XL */}
      <header className="xl:hidden flex bg-black w-full header_container py-4 items-center">
        <Container>
          <div className="flex items-center justify-between">
            <Link to="/categories">
              <img className="w-24" src={logo} alt="" />
            </Link>

            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle mobile menu"
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
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Menu Component */}
      <MobileMenu isOpen={isMobileMenuOpen} toggleMenu={toggleMobileMenu} />
    </>
  );
};

export default AutenticatedHeader;
