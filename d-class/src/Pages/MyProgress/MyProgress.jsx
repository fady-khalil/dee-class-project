import React, { useState, useEffect, useContext } from "react";
import Container from "Components/Container/Container";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostData from "Hooks/usePostData";
import IsLoading from "Components/RequestHandler/IsLoading";
import ContinueWatching from "Pages/ForYou/ContinueWatching/ContinueWatching";
import CompletedCourses from "./CompletedCourses";
import { useTranslation } from "react-i18next";
import IsError from "Components/RequestHandler/IsError";

const MyProgress = () => {
  const { token, selectedUser } = useContext(LoginAuthContext);
  const { postData, isLoading } = usePostData();
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState(null);
  const { t } = useTranslation();

  const getMyProgress = async () => {
    const body = {
      profile_id: selectedUser?.id,
    };
    try {
      // First sync completed courses (fix any that should be marked complete)
      await postData("sync-completed-courses", body, token);

      // Then get progress data
      const response = await postData("my-progress", body, token);
      if (response.status === 200) {
        console.log("=== My Progress API Response ===");
        console.log("continue_watching:", response.data?.continue_watching);
        console.log("completed_courses:", response.data?.completed_courses);
        setData(response.data);
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
  };

  useEffect(() => {
    if (selectedUser?.id) {
      getMyProgress();
    }
  }, [selectedUser?.id]);

  if (isLoading) {
    return <IsLoading />;
  }

  if (isError) {
    return <IsError />;
  }

  // Check if there's any data to show
  const hasContinueWatching = data?.continue_watching?.length > 0;
  const hasCompletedCourses = data?.completed_courses?.length > 0;
  const hasNoData = !hasContinueWatching && !hasCompletedCourses;

  if (hasNoData) {
    return (
      <main className="py-primary">
        <Container className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              {t("progress.my_progress") || "My Progress"}
            </h1>
            <p className="text-gray-400 text-lg">
              {t("progress.no_progress") || "You haven't started watching any courses yet. Start exploring and your progress will appear here!"}
            </p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-secondary lg:py-primary">
      <Container className="flex flex-col gap-y-10 lg:gap-y-14">
        {/* Header Section */}
        <div className="flex flex-col gap-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            {t("progress.my_progress") || "My Progress"}
          </h1>
          <p className="text-gray-400 text-base lg:text-lg">
            {t("progress.subtitle") || "Track your learning journey and pick up where you left off"}
          </p>
        </div>

        {/* Continue Watching Section */}
        {hasContinueWatching && (
          <ContinueWatching data={data.continue_watching} />
        )}

        {/* Completed Courses Section */}
        {hasCompletedCourses && (
          <CompletedCourses data={data.completed_courses} />
        )}
      </Container>
    </main>
  );
};

export default MyProgress;
