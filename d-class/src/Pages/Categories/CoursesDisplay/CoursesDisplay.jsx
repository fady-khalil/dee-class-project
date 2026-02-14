import { useTranslation } from "react-i18next";
import useApiQuery from "Hooks/useApiQuery";
import Spinner from "Components/RequestHandler/Spinner";
import ForYou from "Pages/ForYou/ForYou";
import CourseCard from "./CourseCard";

const CoursesDisplay = ({ activeCategorySlug }) => {
  const { t } = useTranslation();
  const { data: courses, isLoading: coursesLoading } = useApiQuery(
    activeCategorySlug && activeCategorySlug !== "for-you"
      ? `courses/category/${activeCategorySlug}`
      : null
  );

  if (activeCategorySlug === "for-you") {
    return <ForYou />;
  }

  if (coursesLoading) {
    return (
      <div className="flex items-center mt-10 flex-col gap-4">
        <Spinner />
        <p className="text-white text-lg font-bold">{t("general.loading")}</p>
      </div>
    );
  }

  const categoryData = courses?.data?.category;
  const coursesData = courses?.data?.courses;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-8">
        <h2 className="text-2xl sm:text-3xl text-white font-bold">
          {categoryData?.title}
        </h2>
        {coursesData?.length > 0 && (
          <span className="text-sm text-white/40 font-medium">
            {coursesData.length} {t("course_card.courses", "Courses")}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 lg:gap-y-10">
        {coursesData?.map((course, index) => (
          <CourseCard key={course._id || index} course={course} />
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
