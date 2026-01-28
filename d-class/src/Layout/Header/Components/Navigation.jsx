import React, { useState, useRef, useEffect } from "react";
import GetLinks from "Content/header";
import { Link } from "react-router-dom";
import {
  CaretDown,
  CaretRight,
  CaretUp,
  CaretLeft,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const content = GetLinks();
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRef = useRef(null);

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="text-white ">
      <ul className="flex gap-x-6 capitalize" ref={menuRef}>
        {content.map(({ name, path, mega, data }, index) =>
          mega ? (
            <button
              key={index}
              className={`capitalize transition-all duration-300 flex items-center gap-x-2 ${
                openMenuIndex === index
                  ? "text-primary "
                  : "text-white hover:text-lightWhite"
              }  relative`}
              onClick={() => toggleMenu(index)}
            >
              {name}
              {openMenuIndex === index ? (
                <CaretUp size={16} />
              ) : (
                <CaretDown size={16} />
              )}
              {openMenuIndex === index && (
                <div className="absolute top-10 left-0 w-[max-content] flex flex-col items-start text-start bg-black border text-white border-lightGrey py-2 rounded-lg z-[1000000] ">
                  {/* Show only first 6 courses */}
                  {data?.slice(0, 8).map((item, index) => (
                    <Link
                      key={index}
                      className="flex px-4 items-center justify-between w-full gap-x-32   hover:bg-lightGrey  rounded-sm"
                      to={`/categories`}
                      state={{ slug: item.slug }}
                    >
                      <p className="w-full  py-4  flex-1 flex" key={index}>
                        {item.title}
                      </p>
                      {i18n.language === "ar" ? (
                        <CaretLeft size={16} />
                      ) : (
                        <CaretRight size={16} />
                      )}
                    </Link>
                  ))}

                  {/* View all categories button */}
                  <div className="w-full mt-2 px-4 border-t border-lightGrey pt-2">
                    <Link
                      to="/categories"
                      className="flex items-center justify-center w-full py-3 px-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-all"
                    >
                      {t("general.view_all_categories")}
                    </Link>
                  </div>
                </div>
              )}
            </button>
          ) : (
            <Link to={path} key={index}>
              {name}
            </Link>
          )
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
