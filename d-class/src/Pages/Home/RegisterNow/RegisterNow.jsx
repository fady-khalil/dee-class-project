import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./style.css";
import logo from "assests/logos/small-logo.png";
import backgroud from "assests/bghomd.png";
import Container from "Components/Container/Container";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";

const RegisterNow = ({ joinUs }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, isVerified, isAuthenticated, allowedCourses } =
    useContext(LoginAuthContext);

  const getButtonConfig = () => {
    if (!isLoggedIn) {
      return { text: t("navigation.sign_up"), action: () => navigate("/register") };
    } else if (!isVerified) {
      return { text: t("general.verify_email") || "Verify Email", action: () => navigate("/verify-email") };
    } else if (isAuthenticated || allowedCourses?.length > 0) {
      return { text: t("buttons.check_my_courses") || "Check My Courses", action: () => navigate("/my-courses") };
    } else {
      return { text: t("general.finish_sign_up") || "Get a Plan", action: () => navigate("/plans") };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <section className="text-white overflow-hidden relative py-8 lg:py-10">
      <div className="absolute inset-0">
        <img src={backgroud} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="hidden xl:block relative z-10">
        <div className="relative max-w-5xl mx-auto liquid-glass rounded-2xl px-12 py-14">
          <h2 className="text-4xl font-bold text-center leading-tight">
            {joinUs?.title || t("general.register_title")}
          </h2>

          <p className="text-center w-2/3 mt-10 mx-auto text-xl leading-relaxed text-lightWhite whitespace-pre-line">
            {joinUs?.text || t("general.register_now_text")}
          </p>

          <div className="flex items-center justify-center gap-x-6 mt-12">
            <button
              onClick={buttonConfig.action}
              className="bg-primary hover:bg-darkPrimary transition-colors duration-300 px-8 text-white py-3 rounded-xl font-medium shadow-lg shadow-primary/20"
            >
              {buttonConfig.text}
            </button>
            <div className="w-10 h-10 flex items-center justify-center bg-black/70 rounded-full p-1 border border-white/10">
              <img className="w-6 h-6 object-contain" src={logo} alt="" />
            </div>
          </div>
        </div>
      </div>

      <div className="xl:hidden relative z-10">
        <Container>
          <div className="relative liquid-glass rounded-2xl px-6 py-8">
            <h2 className="text-3xl font-bold text-center mb-2">
              {joinUs?.title || t("general.register_now")}
            </h2>

            <p className="text-center mt-4 mx-auto text-base text-lightWhite whitespace-pre-line">
              {joinUs?.text || t("general.register_now_text")}
            </p>

            <div className="flex items-center justify-center gap-x-4 mt-8">
              <button
                onClick={buttonConfig.action}
                className="bg-primary hover:bg-darkPrimary transition-colors duration-300 px-6 text-white py-2.5 rounded-xl font-medium shadow-md"
              >
                {buttonConfig.text}
              </button>
              <div className="w-9 h-9 flex items-center justify-center bg-black/70 rounded-full p-1 border border-white/10">
                <img className="w-5 h-5 object-contain" src={logo} alt="" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
};

export default RegisterNow;
