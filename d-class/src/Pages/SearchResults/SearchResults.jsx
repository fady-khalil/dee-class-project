import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MagnifyingGlass, User, FolderOpen } from "@phosphor-icons/react";
import BASE_URL from "Utilities/BASE_URL";
import Spinner from "Components/RequestHandler/Spinner";
import Container from "Components/Container/Container";

const getThumb = (course) => {
  if (course?.thumbnail) return course.thumbnail;
  if (course?.image) return `${BASE_URL.replace("/api", "")}/${course.image}`;
  return null;
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setIsLoading(true);
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/${i18n.language}/search?q=${encodeURIComponent(q)}&pageSize=20`
        );
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [q, i18n.language]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-white text-lg">{t("search.searching")}</p>
      </div>
    );
  }

  const hasResults =
    data?.courses?.length || data?.instructors?.length || data?.categories?.length;

  return (
    <div className="min-h-screen bg-black pt-pageTop lg:pt-primary pb-16 lg:pb-primary">
      <Container>
        <h1 className="text-white text-2xl sm:text-3xl font-bold mb-8">
          {t("search.results_for")} &ldquo;{q}&rdquo;
        </h1>

        {!hasResults && (
          <div className="flex flex-col items-center justify-center py-20">
            <MagnifyingGlass size={48} className="text-gray-500 mb-4" />
            <p className="text-gray-400 text-xl">{t("search.no_results")}</p>
            <p className="text-gray-500 text-sm mt-2">{t("search.try_different")}</p>
          </div>
        )}

        {/* Instructors row */}
        {data?.instructors?.length > 0 && (
          <section className="mb-8 lg:mb-10">
            <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} /> {t("search.instructors")}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {data.instructors.map((inst) => (
                <Link
                  key={inst._id}
                  to={`/instructor-profile/${inst.slug}`}
                  className="flex flex-col items-center gap-2 min-w-[100px]"
                >
                  {inst.profileImage ? (
                    <img
                      src={`${BASE_URL.replace("/api", "")}/${inst.profileImage}`}
                      alt={inst.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                      <User size={24} className="text-gray-400" />
                    </div>
                  )}
                  <p className="text-white text-sm text-center truncate w-24">{inst.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Categories row */}
        {data?.categories?.length > 0 && (
          <section className="mb-8 lg:mb-10">
            <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <FolderOpen size={20} /> {t("search.categories")}
            </h2>
            <div className="flex gap-3 flex-wrap">
              {data.categories.map((cat) => (
                <Link
                  key={cat._id}
                  to="/categories"
                  className="bg-white/10 hover:bg-primary/30 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Course grid */}
        {data?.courses?.length > 0 && (
          <section>
            <h2 className="text-white text-lg font-semibold mb-4">{t("search.courses")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-x-8 lg:gap-y-16">
              {data.courses.map((course) => (
                <Link
                  to={`/course/${course.slug}`}
                  key={course._id}
                  className="rounded-lg"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={getThumb(course)}
                      className="rounded-lg h-[200px] lg:h-[240px] w-full object-cover transition-transform duration-300 hover:scale-105"
                      alt={course.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="text-start mt-2">
                    <h3 className="text-white text-lg font-medium line-clamp-2">{course.name}</h3>
                    {course.instructor?.name && (
                      <p className="text-gray-400 text-sm mt-1">{course.instructor.name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
};

export default SearchResults;
