import React, { useState, useEffect, useContext } from "react";
import Container from "Components/Container/Container";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import CategorySlider from "Components/Sliders/CategorySlider";
import { useTranslation } from "react-i18next";
import useAuthFetchNoLang from "Hooks/useAuthFetchNoLang";
import IsLoading from "Components/RequestHandler/IsLoading";
import Slider from "Pages/ForYou/Slider/Slider";

const MyCourses = () => {
  const { t } = useTranslation();
  const { token } = useContext(LoginAuthContext);
  const { fetchData, isLoading } = useAuthFetchNoLang();
  const [purchasedCourses, setPurchasedCourses] = useState([]);

  useEffect(() => {
    const loadPurchasedCourses = async () => {
      if (token) {
        const response = await fetchData("my-courses", token);
        if (response?.success && response?.data) {
          setPurchasedCourses(response.data);
        }
      }
    };

    loadPurchasedCourses();
  }, [token]);

  if (isLoading) {
    return <IsLoading />;
  }

  return (
    <main className="py-secondary lg:py-primary min-h-screen">
      <Container className="flex flex-col gap-y-20 lg:gap-y-28">
        <CategorySlider />

        {/* Purchased Courses */}
        {purchasedCourses.length > 0 ? (
          <Slider title={t("my_courses.purchased_courses") || "My Purchased Courses"} data={purchasedCourses} />
        ) : (
          <div className="text-center py-10">
            <p className="text-white text-lg">{t("my_courses.no_courses") || "You haven't purchased any courses yet."}</p>
          </div>
        )}

        {/* My Collection - Empty for now */}
        <Slider title={t("for_you.my_list") || "My Collection"} data={[]} />
      </Container>
    </main>
  );
};

export default MyCourses;
