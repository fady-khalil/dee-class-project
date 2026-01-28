import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import logo from "assests/logos/dclass.png";
import { X } from "@phosphor-icons/react";
import GetDrawerLinks from "Content/drawer";
import Registartion from "./Registartion";
import LanguageSwitcher from "Components/Button/LanguageSwitcher";

const Drawer = ({ isOpen, onToggle }) => {
  const drawerLinks = GetDrawerLinks();

  // Prevent body scrolling when drawer is open
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

  return (
    <div
      className={`fixed top-0 right-0 w-[100%] h-[100dvh] z-[10000000] transition-all duration-300 shadow-lg shadow-white/30 bg-black overflow-y-auto ${
        isOpen ? "translate-x-0 " : "translate-x-full"
      }`}
    >
      {/* header */}
      <div className="sticky top-0 flex items-center justify-between text-white py-4 px-4 border-b border-white bg-black z-10">
        <Link onClick={onToggle} to="/">
          <img className="w-28" src={logo} alt="" />
        </Link>
        <button onClick={onToggle}>
          <X size={24} />
        </button>
      </div>

      {/* menu links */}
      <div className="flex flex-col gap-4 text-white py-3 px-4">
        {drawerLinks.map((link, index) => (
          <Link
            onClick={onToggle}
            className="border-b border-white/30 py-3 capitalize"
            to={link.path}
            key={index}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* registration */}
      <div className="flex flex-wrap items-center justify-center mt-10 text-white py-3 px-2 ">
        <Registartion onToggle={onToggle} />
      </div>

      <div className="flex items-center justify-center mt-10 text-white py-3 px-2 mt-auto">
        <LanguageSwitcher isDrawer={true} />
      </div>
    </div>
  );
};

export default Drawer;
