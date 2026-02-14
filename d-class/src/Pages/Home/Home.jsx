import Hero from "./Hero/Hero";
import LatestCourses from "Components/Sliders/LatestCourses";
import { useTranslation } from "react-i18next";
import JoinUs from "./joinUs/JoinUs";
import Container from "Components/Container/Container";
import RegisterNow from "./RegisterNow/RegisterNow";
import useApiQuery from "Hooks/useApiQuery";
import { useEffect, useContext } from "react";
import IsLoading from "Components/RequestHandler/IsLoading";
import Reels from "./Reels/Reels";
import CategorySlider from "Components/Sliders/CategorySlider";
import InstructorProfileSlider from "Components/Sliders/InstructorProfileSlider";
import FrequentlyAskedQuestions from "Components/FQ/FrequentlyAskedQuestions";
import { CategoriesContext } from "Context/General/CategoriesContext";

const Home = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useApiQuery("home");
  const { setCategoriesData } = useContext(CategoriesContext);

  // Populate categories context from home response
  useEffect(() => {
    if (data?.data) {
      setCategoriesData(data.data.categories);
    }
  }, [data]);

  if (isLoading) {
    return <IsLoading />;
  }

  if (data) {
    return (
      <main className="overflow-hidden">
        <Hero courses={data?.data?.featured_courses} hero={data?.data?.hero} />

        {/* Sections with consistent spacing */}
        <div className="flex flex-col gap-y-20 lg:gap-y-64 pt-pageTop lg:pt-32 pb-20 lg:pb-64">
          <Container>
            <CategorySlider />
          </Container>
          <RegisterNow joinUs={data?.data?.join_us} />
          <Reels trending={data?.data?.trending} />
          <LatestCourses
            data={data?.data?.newlyAddedCourses}
            title={t("for_you.new_to_master_class")}
          />
          {data?.instructor_profile && data.instructor_profile.length > 0 && (
            <Container>
              <InstructorProfileSlider
                data={data.instructor_profile}
                title={t("for_you.our_instructors")}
              />
            </Container>
          )}
          <JoinUs />
          <FrequentlyAskedQuestions
            title={t("home.faq_title")}
            items={data?.data?.faq}
          />
        </div>
      </main>
    );
  }
};

export default Home;
