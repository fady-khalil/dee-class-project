import { useState, useRef, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CaretDown, CaretUp, CaretRight, CaretLeft } from "@phosphor-icons/react";
import { CategoriesContext } from "Context/General/CategoriesContext";
import GetLinks from "Content/header";

const BrowseMenu = () => {
  const { t, i18n } = useTranslation();
  const { categories } = useContext(CategoriesContext);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const content = GetLinks();
  const DirectionCaret = i18n.language === "ar" ? CaretLeft : CaretRight;
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Non-mega links (Contact, Plans)
  const navLinks = content.filter((item) => !item.mega);

  // Position dropdown below button
  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideButton = menuRef.current?.contains(event.target);
      const isInsideDropdown = dropdownRef.current?.contains(event.target);
      if (!isInsideButton && !isInsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-x-6" ref={menuRef}>
      {/* Browse button with mega-menu */}
      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`capitalize transition-all duration-300 flex items-center gap-x-2 font-medium text-lg ${
            isOpen ? "text-primary" : "text-white hover:text-lightWhite"
          }`}
        >
          {t("navigation.browse")}
          {isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
        </button>

        {/* Mega-menu dropdown — portaled to body so backdrop-filter works */}
        {createPortal(
          <div
            ref={dropdownRef}
            className={`fixed min-w-[420px] liquid-glass rounded-xl z-[10001] transition-all duration-200 ${
              isOpen
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 -translate-y-2 invisible pointer-events-none"
            }`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="py-2">
              {categories?.slice(0, 8).map((item, index) => (
                <Link
                  key={index}
                  to="/categories"
                  state={{ slug: item.slug }}
                  onClick={() => setIsOpen(false)}
                  className="glass-item flex items-center justify-between px-4 py-3 text-white"
                >
                  <span>{item.title}</span>
                  <DirectionCaret size={16} />
                </Link>
              ))}
            </div>

            <div className="px-4 pb-3 pt-2 border-t glass-divider">
              <Link
                to="/categories"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-all font-medium"
              >
                {t("general.view_all_categories")}
              </Link>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Additional nav links (Plans, Contact) */}
      {navLinks.map((link) => (
        <Link
          key={link.id}
          to={link.path}
          className="text-white hover:text-primary transition-all duration-300 font-medium text-lg capitalize"
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default BrowseMenu;
