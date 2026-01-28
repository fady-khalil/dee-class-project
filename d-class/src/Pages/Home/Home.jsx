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
import { useContext } from "react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import InstructorProfileSlider from "Components/Sliders/InstructorProfileSlider";

const Home = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, fetchData } = useFetch("");
  const { allowedCourses, isAuthenticated } = useContext(LoginAuthContext);

  const handleDeeClassRedirect = () => {
    // For iOS
    const iOSDeepLink = "deeclass://";
    // For Android
    const androidDeepLink =
      "intent://#Intent;scheme=deeclass;package=com.deeclass.app;end";

    // Detect platform
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isAndroid) {
      window.location.href = androidDeepLink;
    } else if (isIOS) {
      window.location.href = iOSDeepLink;
    } else {
      // Fallback for desktop or if app is not installed
      window.location.href = "https://deeclass.com/download"; // Replace with your app store link
    }
  };

  useEffect(() => {
    fetchData("home");
  }, []);

  console.log(data?.hero)

  if (isLoading) {
    return <IsLoading />;
  }

  if (data) {
    return (
      <main>
        {/* <button
          onClick={handleDeeClassRedirect}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
        >
          Open DeeClass App
        </button> */}
        <Hero courses={data?.data?.featured_courses} hero={data?.data?.hero} />
        <MobileCourseSlider courses={data?.data?.featured_coursesnow} />
        <RegisterNow joinUs={data?.data?.join_us} />
        <Reels trending={data?.data?.trending} />
        <LatestCourses
          data={data?.data?.newlyAddedCourses}
          title={t("for_you.new_to_master_class")}
        />

        <Container className="lg:py-primary py-secondary">
          <CategorySlider />
        </Container>
        <Container className="lg:py-primary py-secondary">
          {data?.instructor_profile && data.instructor_profile.length > 0 && (
            <InstructorProfileSlider
              data={data.instructor_profile}
              title={t("for_you.our_instructors")}
            />
          )}
        </Container>
        <JoinUs />
      </main>
    );
  }
};

export default Home;
