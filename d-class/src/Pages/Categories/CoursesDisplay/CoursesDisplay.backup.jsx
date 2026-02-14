import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import useFetch from "Hooks/useFetch";
import { Link } from "react-router-dom";
import Spinner from "Components/RequestHandler/Spinner";
import ForYou from "Pages/ForYou/ForYou";
import BASE_URL from "Utilities/BASE_URL";

// Get thumbnail URL
const getCourseThumbnail = (course) => {
  if (course?.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
  if (course?.thumbnail) return course.thumbnail;
  if (course?.image) return `${BASE_URL.replace("/api", "")}/${course.image}`;
  if (course?.mobileImage) return `${BASE_URL.replace("/api", "")}/${course.mobileImage}`;
  return null;
};

const CoursesDisplay = ({ activeCategorySlug }) => {
  const { t, i18n } = useTranslation();
  const { data: courses, isLoading: coursesLoading, fetchData } = useFetch(``);

  useEffect(() => {
    // Only fetch data if we're not on the "for-you" tab
    if (activeCategorySlug !== "for-you") {
      fetchData(`courses/category/${activeCategorySlug}`);
    }
  }, [activeCategorySlug]);

  // Handle "For You" tab display
  if (activeCategorySlug === "for-you") {
    return <ForYou />;
  }

  if (coursesLoading) {
    return (
      <div className="col-span-12 xl:col-span-9 flex items-center  mt-10 flex-col gap-4">
        <Spinner />
        <p className="text-white text-lg font-bold">{t("general.loading")}</p>
      </div>
    );
  }

  // Extract data from the API response
  const categoryData = courses?.data?.category;
  const coursesData = courses?.data?.courses;

  return (
    <div
      className={`col-span-12 xl:col-span-9 ${
        i18n.language === "ar"
          ? "custom_container-ar-reverse"
          : "custom_container-en-reverse"
      }`}
    >
      <h1 className="text-2xl sm:text-3xl xxl:text-4xl text-white font-bold mb-10 lg:mb-5">
        {categoryData?.title}
      </h1>
      <div
        className={`text-white grid grid-cols-1 md:grid-cols-2  xxl:grid-cols-2 gap-x-8 gap-y-24`}
      >
        {coursesData?.map((course, index) => (
          <Link
            to={`/course/${course.slug}`}
            className="relative rounded-lg"
            key={index}
          >
            {course?.tags && (
              <div
                className={`absolute top-4 lg:top-2 ${
                  i18n.language === "ar" ? "left-2" : "right-2 "
                } flex flex-wrap gap-1 z-10`}
              >
                {course?.tags?.map((tag, index) => (
                  <span
                    className="px-2 py-0.5 text-sm rounded-lg shadow-md capitalize"
                    key={index}
                    style={{
                      backgroundColor: tag.color,
                      color: tag.text_color,
                    }}
                  >
                    {tag?.name}
                  </span>
                ))}
              </div>
            )}
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={getCourseThumbnail(course)}
                className="rounded-lg h-[200px] lg:h-[260px] w-full object-cover transition-transform duration-300 hover:scale-105 "
                alt={course.name}
                loading="lazy"
              />
            </div>
            <div className="text-start mt-2">
              <h3 className="text-lg sm:text-xl font-medium line-clamp-2">
                {course.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {coursesData?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-400 text-xl">{t("No courses found")}</p>
        </div>
      )}
    </div>
  );
};

export default CoursesDisplay;
