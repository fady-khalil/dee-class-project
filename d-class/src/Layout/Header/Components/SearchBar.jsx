import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import useSearch from "Hooks/useSearch";
import SearchDropdown from "./SearchDropdown";

const SearchBar = ({ isMobile = false }) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const { results, suggestions, isLoading, loadSuggestions } = useSearch(query);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(query.trim())}`);
      collapse();
    }
  };

  const collapse = () => {
    setIsExpanded(false);
    setShowDropdown(false);
    setQuery("");
  };

  const handleFocus = () => setShowDropdown(true);

  const closeDropdown = () => {
    setShowDropdown(false);
    collapse();
  };

  // Click-outside and Escape to collapse
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        collapse();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") collapse();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isExpanded]);

  // Auto-focus on expand
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isExpanded]);

  // ── Mobile: full-screen overlay ──
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => { setIsExpanded(true); loadSuggestions(); }}
          className="text-white p-2 hover:text-primary transition-colors"
          aria-label="Search"
        >
          <MagnifyingGlass size={24} weight="bold" />
        </button>

        <div
          className={`fixed inset-0 bg-black/95 backdrop-blur-sm z-[10001] flex flex-col items-center pt-24 px-5 transition-all duration-300 ${
            isExpanded ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
          ref={containerRef}
        >
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto relative">
            <div className="flex items-center bg-white/[0.08] rounded-xl border border-white/[0.12] focus-within:border-primary/60 focus-within:bg-white/[0.12] transition-all duration-200 shadow-lg shadow-black/40">
              <div className="ps-4">
                <MagnifyingGlass size={22} className="text-gray-400" weight="bold" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="bg-transparent w-full text-white text-base focus:outline-none py-3.5 px-3 placeholder:text-gray-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFocus}
                placeholder={t("navigation.search")}
              />
              <button
                type="button"
                onClick={collapse}
                className="text-gray-400 hover:text-white pe-4 transition-colors"
              >
                <X size={22} weight="bold" />
              </button>
            </div>

            {showDropdown && (
              <SearchDropdown
                results={results}
                suggestions={suggestions}
                query={query}
                isLoading={isLoading}
                onClose={closeDropdown}
              />
            )}
          </form>
        </div>
      </>
    );
  }

  // ── Desktop: icon → expands inline ──
  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Collapsed: just the icon */}
      {!isExpanded && (
        <button
          type="button"
          onClick={() => { setIsExpanded(true); loadSuggestions(); }}
          className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/[0.08] transition-all duration-200"
          aria-label="Search"
        >
          <MagnifyingGlass size={22} weight="bold" />
        </button>
      )}

      {/* Expanded: full search field */}
      {isExpanded && (
        <div className="flex items-center w-80 bg-white/[0.08] border border-white/[0.15] focus-within:border-primary/50 focus-within:bg-white/[0.12] rounded-lg transition-all duration-200 animate-[searchExpand_0.25s_ease-out]">
          <div className="ps-3">
            <MagnifyingGlass size={18} className="text-gray-400" weight="bold" />
          </div>

          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent w-full text-white text-sm focus:outline-none py-2.5 px-2.5 placeholder:text-gray-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              placeholder={t("navigation.search")}
            />
          </form>

          <button
            type="button"
            onClick={collapse}
            className="text-gray-500 hover:text-white pe-3 transition-colors"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      )}

      {isExpanded && showDropdown && (
        <SearchDropdown
          results={results}
          suggestions={suggestions}
          query={query}
          isLoading={isLoading}
          onClose={closeDropdown}
        />
      )}
    </div>
  );
};

export default SearchBar;
