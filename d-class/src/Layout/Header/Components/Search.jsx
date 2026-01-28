import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlass } from "@phosphor-icons/react";

const Search = () => {
  const [query, setQuery] = useState("");
  const { t, i18n } = useTranslation();

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handle search logic here, e.g., call an API or filter data based on `query`
    console.log("Searching for:", query);
  };

  return (
    <div className={`flex-1 ${i18n.language === "ar" ? "px-0" : "px-14"} `}>
      <form
        onSubmit={handleSearchSubmit}
        className="bg-lightGrey flex border-2 border-transparent rounded-md  focus-within:border-gray-600"
      >
        <div className="py-2 px-2">
          <MagnifyingGlass color="white" size={24} />
        </div>
        <input
          type="text"
          className="bg-transparent px-6 w-full text-white focus:outline-0"
          value={query}
          onChange={handleInputChange}
          placeholder={t("navigation.search")}
        />
      </form>
    </div>
  );
};

export default Search;
