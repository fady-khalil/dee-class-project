import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useContext, useState } from "react";
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
import MyCourses from "Pages/MyCourses/MyCourses";
// auth
import Register from "Pages/Auth/Register/Register";
import AuthCallback from "Pages/Auth/Register/AuthCallback";
import Login from "Pages/Auth/login/Login";
import VerifyEmail from "Pages/Auth/VerifyEmail/VerifyEmail";
import ForgotPassword from "Pages/Auth/ForgotPassword/ForgotPassword";
// gift
import GiftCode from "Pages/Gift/GiftCode";
import GiftLogin from "Pages/Gift/GiftLogin";
import GiftRegister from "Pages/Gift/GiftRegister";
import GiftVerifyEmail from "Pages/Gift/GiftVerifyEmail";
import GiftSuccess from "Pages/Gift/GiftSuccess";
import GiftPlan from "Pages/Gift/GiftPlan";
import GiftPurchaseSuccess from "Pages/Gift/GiftPurchaseSuccess";
// general
import NotFound from "Pages/General/NotFound";
import Success from "Pages/Success";
import PaymentCancel from "Pages/PaymentCancel";
import Privacy from "Pages/General/Privacy";
import Terms from "Pages/General/Terms";
import Contact from "Pages/General/Contact";
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
  const { isAuthenticated } = useContext(LoginAuthContext);

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

  return (
    <div className="App">
      {isAuthenticated ? <AutenticatedHeader /> : <Header />}
      <ScrollToTop />
      <Routes>
        {/* Common routes */}
        <Route path="/about" element={<About />} />
        <Route path="/for-business" element={<AtWork />} />
        {/* courses and categories */}
        <Route path="/categories" element={<MainCategoryLandingScreen />} />
        <Route path="/course/:slug" element={<CourseBySlug />} />

        {/* news */}
        <Route path="/news" element={<NewsMainPage />} />
        <Route path="/news-by-category" element={<NewsByCategoriesScreen />} />
        <Route path="/news-detailed/:id" element={<NewsDetailed />} />
        <Route path="/success" element={<Success />} />
        <Route path="/payment-cancelled" element={<PaymentCancel />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/my-courses" element={<MyCourses />} />

        {/* instructor profile */}
        <Route
          path="/instructor-profile/:slug"
          element={<InstructorProfile />}
        />
        {/* general */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/course/watch-series/:slug" element={<WatchSeries />} />
        <Route
          path="/course/watch-playlist/:slug"
          element={<WatchPlaylist />}
        />
        <Route path="/course/watch-single/:slug" element={<WatchSingle />} />
        {/* Gift routes - available for both authenticated and unauthenticated users */}
        <Route path="/gift" element={<GiftCode />} />
        <Route path="/gift/login" element={<GiftLogin />} />
        <Route path="/gift/register" element={<GiftRegister />} />
        <Route path="/gift/verify-email" element={<GiftVerifyEmail />} />
        <Route path="/gift/success" element={<GiftSuccess />} />

        {/* Conditional routes based on authentication status */}
        {isAuthenticated ? (
          <>
            {/* Redirect root to categories for authenticated users */}
            <Route index element={<Navigate to="/categories" replace />} />
            <Route path="/my-profiles" element={<ManageProfiles />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/my-progress" element={<MyProgress />} />
            {/* Gift plan purchase - only for authenticated users */}
            <Route path="/gift/plan" element={<GiftPlan />} />
            <Route path="/gift/purchase-success" element={<GiftPurchaseSuccess />} />
          </>
        ) : (
          <>
            <Route index element={<Home />} />
            <Route path="/assement" element={<Assesments />} />
            <Route
              path="/assessment-complete"
              element={<AssessmentComplete />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </>
        )}
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
