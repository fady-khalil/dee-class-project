import logo from "assests/logos/small-logo.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SingleCourse = ({ courseData, isAuthenticated, isPurchased }) => {
  const { t } = useTranslation();
  return (
    <div className="lg:w-3/4 mx-auto py-primary">
      <h2 className="text-2xl lg:text-3xl text-white mb-10 text-center">
        {t("courses.single_course_title", { courseName: courseData?.name })}
      </h2>
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1 shadow-md shadow-white/10 rounded-xl overflow-hidden relative">
          <img
            className="rounded-xl max-h-[300px] w-full object-cover"
            src={
              isAuthenticated || isPurchased
                ? courseData?.api_video_object?.assets?.thumbnail
                : courseData?.thumbnail
            }
            alt={courseData?.title}
          />
        </div>
        <div className="text-white flex-col flex-1">
          <h3 className="text-2xl lg:text-3xl mb-1 lg:mb-3 font-bold">
            {courseData?.name}
          </h3>
          <p
            className="text-lightWhite"
            dangerouslySetInnerHTML={{ __html: courseData?.description }}
          ></p>

          {isAuthenticated || isPurchased ? (
            <Link
              className="w-max flex items-center gap-x-2 bg-black border border-primary mt-6 text-white rounded-lg px-4 py-2"
              to={`/course/watch-single/${courseData?.slug}`}
            >
              <img src={logo} alt="logo" className="w-6 h-6" />
              <p>{t("courses.start_watching")}</p>
            </Link>
          ) : (
            <Link
              className="mt-6 flex w-max bg-darkPrimary hover:bg-primary transition-all duration-300 px-4 py-2 text-white rounded-lg"
              to={`/plans`}
            >
              {t("courses.join_to_watch")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleCourse;
