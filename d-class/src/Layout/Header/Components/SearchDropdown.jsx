import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, User, FolderOpen, BookOpen, Clock } from "@phosphor-icons/react";
import BASE_URL from "Utilities/BASE_URL";

const getThumb = (course) => {
  if (course?.thumbnail) return course.thumbnail;
  if (course?.image) return `${BASE_URL.replace("/api", "")}/${course.image}`;
  return null;
};

const SearchDropdown = ({ results, suggestions, query, isLoading, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const trimmed = query?.trim() || "";

  // Suggestions view (empty or short query)
  if (trimmed.length < 2) {
    if (!suggestions?.length) return null;
    return (
      <div className="absolute top-full left-0 right-0 mt-1 liquid-glass rounded-xl z-[9999] max-h-80 overflow-y-auto">
        <div className="p-3">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            {t("search.suggestions")}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => go(`/search-results?q=${encodeURIComponent(s)}`)}
                className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-primary/30 text-white text-sm px-3 py-1.5 rounded-full transition-colors"
              >
                <Clock size={14} className="text-gray-400" />
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 liquid-glass rounded-xl z-[9999] p-4">
        <p className="text-gray-400 text-sm text-center">{t("search.searching")}</p>
      </div>
    );
  }

  const hasResults =
    results?.courses?.length || results?.instructors?.length || results?.categories?.length;

  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 liquid-glass rounded-xl z-[9999] p-4">
        <p className="text-gray-400 text-sm text-center">{t("search.no_results")}</p>
        <p className="text-gray-500 text-xs text-center mt-1">{t("search.try_different")}</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 liquid-glass rounded-xl z-[9999] max-h-[420px] overflow-y-auto">
      {/* Courses */}
      {results.courses?.length > 0 && (
        <div className="p-3 border-b glass-divider">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen size={14} /> {t("search.courses")}
          </p>
          {results.courses.map((c) => (
            <button
              key={c._id}
              onClick={() => go(`/course/${c.slug}`)}
              className="flex items-center gap-3 w-full text-start p-2 rounded-lg glass-item"
            >
              {getThumb(c) ? (
                <img src={getThumb(c)} alt="" className="w-12 h-8 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-8 rounded bg-white/10 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-white text-sm truncate">{c.name}</p>
                {c.instructor?.name && (
                  <p className="text-gray-400 text-xs truncate">{c.instructor.name}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Instructors */}
      {results.instructors?.length > 0 && (
        <div className="p-3 border-b glass-divider">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User size={14} /> {t("search.instructors")}
          </p>
          {results.instructors.map((i) => (
            <button
              key={i._id}
              onClick={() => go(`/instructor-profile/${i.slug}`)}
              className="flex items-center gap-3 w-full text-start p-2 rounded-lg glass-item"
            >
              {i.profileImage ? (
                <img
                  src={`${BASE_URL.replace("/api", "")}/${i.profileImage}`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-gray-400" />
                </div>
              )}
              <p className="text-white text-sm truncate">{i.name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Categories */}
      {results.categories?.length > 0 && (
        <div className="p-3 border-b glass-divider">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FolderOpen size={14} /> {t("search.categories")}
          </p>
          {results.categories.map((c) => (
            <button
              key={c._id}
              onClick={() => go(`/categories`)}
              className="flex items-center gap-3 w-full text-start p-2 rounded-lg glass-item"
            >
              <FolderOpen size={18} className="text-primary flex-shrink-0" />
              <p className="text-white text-sm truncate">{c.title}</p>
            </button>
          ))}
        </div>
      )}

      {/* See all */}
      <button
        onClick={() => go(`/search-results?q=${encodeURIComponent(trimmed)}`)}
        className="w-full p-3 text-center text-primary text-sm glass-item flex items-center justify-center gap-2"
      >
        <MagnifyingGlass size={16} />
        {t("search.see_all")} &ldquo;{trimmed}&rdquo;
      </button>
    </div>
  );
};

export default SearchDropdown;
