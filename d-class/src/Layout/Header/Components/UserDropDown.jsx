import React from "react";
import { Link } from "react-router-dom";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { useTranslation } from "react-i18next";
import usePostData from "Hooks/usePostData";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import Spinner from "Components/RequestHandler/Spinner";
const UserDropDown = ({ selectedUser, isDropdownOpen, onHandleDropDown }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, logoutHandler } = useContext(LoginAuthContext);
  const { postData, isLoading, isError } = usePostData();
  const logout = async () => {
    const response = await postData("logout", {}, token);
    logoutHandler();
    navigate("/");
    onHandleDropDown();
  };
  return (
    <div
      className={`absolute z-[10000] right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-xl py-1 transition-all duration-200 ${
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
          {selectedUser?.email || selectedUser?.name}
        </p>
      </div>

      <Link
        to="/my-account"
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
        onClick={() => onHandleDropDown(false)}
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
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        {t("navigation.profile")}
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
  );
};

export default UserDropDown;
