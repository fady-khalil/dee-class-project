import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePost from "Hooks/usePostData.js";
import Spinner from "Components/RequestHandler/Spinner";
// inner components
import ContinueWatching from "./ContinueWatching/ContinueWatching";
import Slider from "./Slider/Slider";

const ForYou = () => {
  const { t, i18n } = useTranslation();
  const { selectedUser, token, logoutHandler } = useContext(LoginAuthContext);
  const { postData, isLoading, error } = usePost();
  const [forYouCourses, setForYouCourses] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [expiredToken, setExpiredToken] = useState(false);

  const getForYouData = async () => {
    const body = {
      profile_id: selectedUser.id,
    };
    const response = await postData("profile-for-you", body, token);
    if (response.success) {
      setForYouCourses(response.data);
      setErrorMessage(null); // Clear any previous error message
    } else if (response.status === 401) {
      setExpiredToken(true);
    } else {
      setErrorMessage(response?.message);
    }
  };

  useEffect(() => {
    getForYouData();
  }, []);

  if (isLoading) {
    return (
      <div className="col-span-12 xl:col-span-9 flex items-center  mt-10 flex-col gap-4">
        <Spinner />
        <p className="text-white text-lg font-bold">{t("general.loading")}</p>
      </div>
    );
  }

  if (expiredToken) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-6 rounded-lg shadow-md w-full h-max max-w-lg col-span-12 xl:col-span-9">
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-amber-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-amber-800 font-medium text-lg">
              {t("auth.login.session_expired")}
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => {
                window.location.href = "/login";
                logoutHandler();
              }}
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              {t("navigation.sign_in")}
            </button>
            <button
              onClick={() => {
                window.location.reload();
                logoutHandler();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              {t("auth.logout.cancel")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg w-max h-max">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-red-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-700 font-medium">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`col-span-12 xl:col-span-9 ${
        i18n.language === "ar"
          ? "custom_container-ar-reverse"
          : "custom_container-en-reverse"
      }`}
    >
      <div className="flex flex-col gap-y-20">
        <ContinueWatching data={forYouCourses?.continue_watching} />
        <Slider
          title={t("for_you.recommended_courses")}
          data={forYouCourses?.recommended_courses}
        />
        <Slider
          title={t("for_you.new_added")}
          data={forYouCourses?.new_added}
        />
        <Slider title={t("for_you.my_list")} data={forYouCourses?.my_list} />
      </div>
    </div>
  );
};

export default ForYou;
