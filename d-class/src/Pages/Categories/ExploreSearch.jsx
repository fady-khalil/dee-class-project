import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import useSearch from "Hooks/useSearch";
import SearchDropdown from "Layout/Header/Components/SearchDropdown";

const ExploreSearch = () => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { results, suggestions, isLoading } = useSearch(query);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      setQuery("");
    }
  };

  const clear = () => {
    setQuery("");
    setShowDropdown(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!showDropdown) return;

    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  return (
    <div ref={containerRef} className="relative w-64 sm:w-72 lg:w-80">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center rounded-full bg-white/[0.08] border border-white/[0.1] focus-within:border-primary/50 focus-within:bg-white/[0.12] transition-all duration-200">
          <div className="ps-4">
            <MagnifyingGlass size={18} className="text-gray-400" weight="bold" />
          </div>
          <input
            type="text"
            className="bg-transparent w-full text-white text-sm focus:outline-none py-3 px-3 placeholder:text-gray-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder={t("navigation.search")}
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="text-gray-500 hover:text-white pe-4 transition-colors"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <SearchDropdown
          results={results}
          suggestions={suggestions}
          query={query}
          isLoading={isLoading}
          onClose={clear}
        />
      )}
    </div>
  );
};

export default ExploreSearch;
