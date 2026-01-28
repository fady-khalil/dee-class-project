import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import "i18n/i18n";
import { useTranslation } from "react-i18next";
import ScrollToTop from "Helpers/ScrollToTop";
// Layout
import Footer from "Layout/Footer/Footer";
import Header from "Layout/Header/Header";
import AutenticatedHeader from "Layout/Header/AutenticatedHeader";
// Pages
import Home from "Pages/Home/Home";
import About from "Pages/About/About";
// Components
import Assesments from "Pages/Assesments/Assesments";
import AtWork from "Pages/AtWork/AtWork";
import Plans from "Pages/Plans/Plans";
// news
import NewsMainPage from "Pages/News/NewsMainPage";
import NewsByCategoriesScreen from "Pages/News/NewsByCategory/NewsByCategoriesScreen";
import NewsDetailed from "Pages/News/NewsDetailed/NewsDetailed";
// Courses
import MainCategoryLandingScreen from "Pages/Categories/MainCategoryLandingScreen";
import CourseBySlug from "Pages/Courses/CourseBySlug";
import WatchSeries from "Pages/Watch/WatchSeries/WatchSeries";
import WatchPlaylist from "Pages/Watch/WatchPlaylist/WatchPlaylist";
import WatchSingle from "Pages/Watch/WatchSingle/WatchSingle";
// auth
import Register from "Pages/Auth/Register/Register";
import AuthCallback from "Pages/Auth/Register/AuthCallback";
import Login from "Pages/Auth/login/Login";
// general
import NotFound from "Pages/General/NotFound";
import Success from "Pages/Success";
import Privacy from "Pages/General/Privacy";
import Terms from "Pages/General/Terms";
// assessment
import AssessmentComplete from "Pages/Assesments/AssessmentComplete";
// context
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
// instructor profile
import InstructorProfile from "Pages/InstructorProfile/InstructorProfile";
// authenticated page
import ManageProfiles from "Pages/Profiles/ManageProfiles";
import MyAccount from "Pages/Account/MyAccount";
import MyProgress from "Pages/MyProgress/MyProgress";

const App = () => {
  const { i18n } = useTranslation();
  const { isAuthenticated, selectedUser } = useContext(LoginAuthContext);

  useEffect(() => {
    const updateFontClass = () => {
      const htmlElement = document.documentElement;
      const currentLanguage = i18n.language;

      if (currentLanguage === "ar") {
        htmlElement.classList.add("arabic");
      } else {
        htmlElement.classList.remove("arabic");
      }
    };

    // Update font class on load
    updateFontClass();

    // Listen for language change
    i18n.on("languageChanged", updateFontClass);

    // Cleanup listener on unmount
    return () => {
      i18n.off("languageChanged", updateFontClass);
    };
  }, []);

  // Guard route if user is authenticated but no profile is selected
  const ProfileGuard = ({ children }) => {
    if (isAuthenticated && !selectedUser) {
      return <Navigate to="/my-profiles" replace />;
    }
    return children;
  };

  return (
    <div className="App">
      {isAuthenticated ? <AutenticatedHeader /> : <Header />}
      <ScrollToTop />
      <Routes>
        {/* Common routes accessible to all users (not authenticated) and even if authenticated and no profile is selected  */}
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Routes that require profile selection if authenticated so if is logged in and authenticated but no profile is selected it will redirect to /my-profiles */}
        <Route
          path="/categories"
          element={
            <ProfileGuard>
              <MainCategoryLandingScreen />
            </ProfileGuard>
          }
        />
        <Route
          path="/course/:slug"
          element={
            <ProfileGuard>
              <CourseBySlug />
            </ProfileGuard>
          }
        />
        <Route
          path="/news"
          element={
            <ProfileGuard>
              <NewsMainPage />
            </ProfileGuard>
          }
        />
        <Route
          path="/news-by-category"
          element={
            <ProfileGuard>
              <NewsByCategoriesScreen />
            </ProfileGuard>
          }
        />
        <Route
          path="/news-detailed/:id"
          element={
            <ProfileGuard>
              <NewsDetailed />
            </ProfileGuard>
          }
        />
        <Route
          path="/success"
          element={
            <ProfileGuard>
              <Success />
            </ProfileGuard>
          }
        />
        <Route
          path="/instructor-profile/:slug"
          element={
            <ProfileGuard>
              <InstructorProfile />
            </ProfileGuard>
          }
        />

        {/* Authenticated user routes */}
        {isAuthenticated ? (
          <>
            <Route
              path="/course/watch-series/:slug"
              element={
                <ProfileGuard>
                  <WatchSeries />
                </ProfileGuard>
              }
            />
            <Route
              path="/course/watch-playlist/:slug"
              element={
                <ProfileGuard>
                  <WatchPlaylist />
                </ProfileGuard>
              }
            />
            <Route
              path="/course/watch-single/:slug"
              element={
                <ProfileGuard>
                  <WatchSingle />
                </ProfileGuard>
              }
            />
            <Route
              path="/"
              element={
                selectedUser ? (
                  <MainCategoryLandingScreen />
                ) : (
                  <Navigate to="/my-profiles" replace />
                )
              }
            />
            <Route path="/my-profiles" element={<ManageProfiles />} />
            <Route
              path="/my-account"
              element={
                selectedUser ? (
                  <MyAccount />
                ) : (
                  <Navigate to="/my-profiles" replace />
                )
              }
            />
            <Route
              path="/my-progress"
              element={
                selectedUser ? (
                  <MyProgress />
                ) : (
                  <Navigate to="/my-profiles" replace />
                )
              }
            />
          </>
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/assement" element={<Assesments />} />
            <Route
              path="/assessment-complete"
              element={<AssessmentComplete />}
            />
            <Route path="/for-business" element={<AtWork />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/plans" element={<Plans />} />
          </>
        )}

        {/* 404 - must be last */}
        <Route
          path="*"
          element={
            <ProfileGuard>
              <NotFound />
            </ProfileGuard>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
