import Hero from "./Hero/Hero";
import LatestCourses from "Components/Sliders/LatestCourses";
import MobileCourseSlider from "./Hero/Components/MobileCourseSlider";
import { useTranslation } from "react-i18next";
import JoinUs from "./joinUs/JoinUs";
import Container from "Components/Container/Container";
import RegisterNow from "./RegisterNow/RegisterNow";
import useFetch from "Hooks/useFetch";
import { useEffect } from "react";
import IsLoading from "Components/RequestHandler/IsLoading";
import Reels from "./Reels/Reels";
import CategorySlider from "Components/Sliders/CategorySlider";
import InstructorProfileSlider from "Components/Sliders/InstructorProfileSlider";

const Home = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, fetchData } = useFetch("");

  useEffect(() => {
    fetchData("home");
  }, []);

  if (isLoading) {
    return <IsLoading />;
  }

  if (data) {
    return (
      <main className="overflow-x-hidden">
        <Hero courses={data?.data?.featured_courses} hero={data?.data?.hero} />

        {/* Sections with consistent spacing */}
        <div className="flex flex-col gap-y-16 sm:gap-y-24 lg:gap-y-36 xl:gap-y-44 pt-16 sm:pt-20 lg:pt-28">
          <RegisterNow joinUs={data?.data?.join_us} />
          <Reels trending={data?.data?.trending} />
          <LatestCourses
            data={data?.data?.newlyAddedCourses}
            title={t("for_you.new_to_master_class")}
          />
          <Container>
            <CategorySlider />
          </Container>
          {data?.instructor_profile && data.instructor_profile.length > 0 && (
            <Container>
              <InstructorProfileSlider
                data={data.instructor_profile}
                title={t("for_you.our_instructors")}
              />
            </Container>
          )}
          <JoinUs />
        </div>
      </main>
    );
  }
};

export default Home;
