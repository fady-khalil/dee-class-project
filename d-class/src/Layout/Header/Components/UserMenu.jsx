import { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CaretDown } from "@phosphor-icons/react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";

const UserMenu = () => {
  const { t } = useTranslation();
  const { selectedUser, logoutHandler, token, isAuthenticated } =
    useContext(LoginAuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { postData, isLoading } = usePostData();

  const logout = async () => {
    await postData("logout", {}, token);
    logoutHandler();
    navigate("/");
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = isAuthenticated
    ? [
        { label: t("navigation.my_account"), path: "/my-account" },
        { label: t("navigation.my_progress"), path: "/my-progress" },
      ]
    : [
        { label: t("navigation.my_account"), path: "/my-account" },
        { label: t("navigation.my_courses"), path: "/my-courses" },
      ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger — avatar only */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-x-1.5 cursor-pointer group"
      >
        <div className="text-white bg-lightGrey rounded-full font-bold text-lg h-10 w-10 flex items-center justify-center group-hover:bg-gray-600 transition-colors duration-200">
          {selectedUser?.name?.charAt(0) || "U"}
        </div>
        <CaretDown
          size={14}
          className={`text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`absolute z-[10000] end-0 mt-2 w-56 liquid-glass rounded-xl py-1 transition-all duration-200 ${
          isOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 translate-y-1 invisible"
        }`}
        style={{ background: "rgba(40, 40, 50, 0.55)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
      >
        {/* User info */}
        <div className="px-4 py-3 border-b glass-divider">
          <p className="text-sm text-gray-400">{t("general.signed_in_as")}</p>
          <p className="text-sm font-medium text-white truncate">
            {selectedUser?.email || selectedUser?.name}
          </p>
        </div>

        {/* Menu links */}
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className="glass-item flex items-center px-4 py-2.5 text-sm text-white/80 hover:text-white"
          >
            {item.label}
          </Link>
        ))}

        {/* Logout */}
        <div className="border-t glass-divider">
          <button
            onClick={logout}
            className="glass-item flex w-full items-center px-4 py-2.5 text-sm text-red-400 hover:text-red-300"
          >
            {isLoading ? <Spinner isSmall /> : t("navigation.logout")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
