import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAssessment } from "Context/AssessmentContext";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";

const AuthButtons = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { state: assessmentState } = useAssessment();
  const { isLoggedIn, isAuthenticated, logoutHandler, allowedCourses, token } =
    useContext(LoginAuthContext);
  const navigate = useNavigate();
  const { postData, isLoading } = usePostData();

  const handleClick = (to) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate();
      setTimeout(() => navigate(to), 300);
    }
  };

  const logout = async () => {
    await postData("logout", {}, token);
    logoutHandler();
    navigate("/");
  };

  const isAssessmentDone =
    assessmentState?.status === "completed" || assessmentState?.status === "in_progress";
  const registerPath = isAssessmentDone ? "/plans" : "/register";
  const registerLabel = isAssessmentDone
    ? t("general.finish_sign_up")
    : t("navigation.sign_up");

  // Logged in but not fully authenticated (no subscription)
  if (isLoggedIn && !isAuthenticated) {
    return (
      <div className="flex items-center gap-x-3">
        <Link
          to={allowedCourses?.length > 0 ? "/my-courses" : "/plans"}
          state={{ isSignedIn: true }}
          onClick={handleClick(allowedCourses?.length > 0 ? "/my-courses" : "/plans")}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          {allowedCourses?.length > 0
            ? t("general.check_my_courses")
            : t("general.finish_sign_up")}
        </Link>
        <button
          onClick={logout}
          className="border border-white/40 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
        >
          {isLoading ? <Spinner isSmall /> : t("navigation.logout")}
        </button>
      </div>
    );
  }

  // Not logged in — show Sign In + Register
  return (
    <div className="flex items-center gap-x-4">
      <Link
        to="/login"
        onClick={handleClick("/login")}
        className="text-white hover:text-primary transition-colors capitalize font-medium"
      >
        {t("navigation.sign_in")}
      </Link>
      <Link
        to={registerPath}
        onClick={handleClick(registerPath)}
        className="bg-primary text-white px-4 py-2 rounded-lg capitalize font-bold hover:bg-primary/90 transition-colors"
      >
        {registerLabel}
      </Link>
    </div>
  );
};

export default AuthButtons;
