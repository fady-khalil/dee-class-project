import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import Container from "Components/Container/Container";
import IsLoading from "Components/RequestHandler/IsLoading";
import IsError from "Components/RequestHandler/IsError";
import CategorySlider from "Components/Sliders/CategorySlider";
import CourseCard from "Pages/Categories/CoursesDisplay/CourseCard";
import BASE_URL from "Utilities/BASE_URL";

const MyCollection = () => {
  const { t, i18n } = useTranslation();
  const { token, selectedUser } = useContext(LoginAuthContext);
  const profileId = selectedUser?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-collection", profileId, i18n.language],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/${i18n.language}/my-list?profile_id=${profileId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch collection");
      const result = await res.json();
      return result.data || [];
    },
    enabled: !!profileId && !!token,
  });

  if (isLoading) return <IsLoading />;
  if (isError) return <IsError />;

  const savedCourses = data || [];

  return (
    <main className="pb-16 lg:pb-primary pt-pageTop lg:pt-primary">
      <Container>
        <h1 className="text-3xl font-bold text-white sm:text-4xl mb-10">
          {t("navigation.my_collection")}
        </h1>

        <CategorySlider />

        <div className="mt-10 lg:mt-14">
          {savedCourses.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {savedCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
              <p className="text-gray-400 text-lg text-center">
                {t("for_you.no_content")}
              </p>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
};

export default MyCollection;
