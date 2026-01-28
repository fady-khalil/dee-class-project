import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAssessment } from "Context/AssessmentContext";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { useContext, useState, useRef, useEffect } from "react";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";

const Registartion = ({ onToggle }) => {
  const { t } = useTranslation();
  const { state: assessmentState } = useAssessment();
  const {
    isAuthenticated,
    isLoggedIn,
    user,
    logoutHandler,
    allowedCourses,
    token,
  } = useContext(LoginAuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { postData, isLoading, isError } = usePostData();

  const logout = async () => {
    const response = await postData("logout", {}, token);
    logoutHandler();
    navigate("/");
    toggleDropdown();
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLinkClick = (to) => (event) => {
    // For XL screens and larger, let the Link navigate normally
    // For smaller screens, prevent default and toggle the drawer
    if (window.innerWidth < 1280) {
      // 1280px is the 'xl' breakpoint in Tailwind
      event.preventDefault();
      // Check if onToggle exists and is a function before calling it
      if (typeof onToggle === "function") {
        onToggle();
        // Navigate after toggling with a small delay to allow the drawer to close
        setTimeout(() => {
          navigate(to);
        }, 300);
      } else {
        // If no toggle function, just navigate directly
        navigate(to);
      }
    }
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

  // If logged in but not authenticated, show the profile circle with dropdown
  if (isLoggedIn && !isAuthenticated) {
    return (
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={toggleDropdown}
          className="flex items-center gap-x-2 cursor-pointer relative group"
        >
          <div className="text-white bg-lightGrey rounded-full font-bold text-lg h-10 w-10 flex items-center justify-center group-hover:bg-gray-600 transition-colors duration-200">
            {user?.email ? user.email.charAt(0) : "U"}
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

        {/* Dropdown menu - Desktop */}
        <div
          className={`absolute z-[10000] right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-xl py-1 transition-all duration-200 hidden xl:block ${
            isDropdownOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 invisible translate-y-1"
          }`}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm leading-5 text-gray-500">
              {t("general.signed_in_as")}
            </p>
            <p className="text-sm font-medium leading-5 text-gray-900 truncate">
              {user?.email || user?.name || "User"}
            </p>
          </div>

          <Link
            to={allowedCourses?.length > 0 ? "/my-courses" : "/plans"}
            state={{ isSignedIn: true }}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            onClick={() => setIsDropdownOpen(false)}
          >
            <svg
              className="mr-3 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            {allowedCourses?.length > 0
              ? t("general.check_my_courses")
              : t("general.finish_sign_up")}
          </Link>

          <button
            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
            onClick={logout}
          >
            {isLoading ? (
              <Spinner isSmall={true} />
            ) : (
              <>
                <svg
                  className="mr-3 h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                {t("navigation.logout")}
              </>
            )}
          </button>
        </div>

        {/* Dropdown menu - Mobile */}
        <div
          className={`fixed inset-x-0 bottom-0 z-[10000] bg-white rounded-t-lg shadow-xl py-4 transition-all duration-300 xl:hidden ${
            isDropdownOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm leading-5 text-gray-500">
                {t("general.signed_in_as")}
              </p>
              <button
                onClick={toggleDropdown}
                className="text-gray-400 hover:text-gray-600"
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
            <p className="text-base font-medium leading-5 text-gray-900 truncate">
              {user?.email || user?.name || "User"}
            </p>
          </div>

          <Link
            to={allowedCourses?.length > 0 ? "/my-courses" : "/plans"}
            state={{ isSignedIn: true }}
            className="flex items-center px-6 py-4 text-base text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={(e) => {
              setIsDropdownOpen(false);
              handleLinkClick(
                allowedCourses?.length > 0 ? "/my-courses" : "/plans"
              )(e);
            }}
          >
            <svg
              className="mr-4 h-6 w-6 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            <span className="font-medium">
              {allowedCourses?.length > 0
                ? t("general.check_my_courses")
                : t("general.finish_sign_up")}
            </span>
          </Link>

          <button
            className="flex w-full items-center px-6 py-4 text-base text-red-600 hover:bg-red-50 transition-colors duration-200"
            onClick={logout}
          >
            {isLoading ? (
              <Spinner isSmall={true} />
            ) : (
              <>
                <svg
                  className="mr-4 h-6 w-6 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span className="font-medium">{t("navigation.logout")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default view with login/signup buttons
  return (
    <div className="flex flex-wrap items-center gap-x-6">
      <Link
        to="/login"
        className="text-white capitalize"
        onClick={handleLinkClick("/login")}
      >
        {t("navigation.sign_in")}
      </Link>
      <Link
        to={assessmentState?.status === "completed" ? "/plans" : "/register"}
        className="bg-primary text-white px-3 py-2 rounded-md capitalize font-bold"
        onClick={handleLinkClick(
          assessmentState?.status === "completed" ? "/plans" : "/register"
        )}
      >
        {assessmentState?.status === "completed" ||
        assessmentState?.status === "in_progress"
          ? t("general.finish_sign_up")
          : t("navigation.sign_up")}
      </Link>
    </div>
  );
};

export default Registartion;
