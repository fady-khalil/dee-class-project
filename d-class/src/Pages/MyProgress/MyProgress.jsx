import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Container from "Components/Container/Container";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import IsLoading from "Components/RequestHandler/IsLoading";
import IsError from "Components/RequestHandler/IsError";
import ContinueWatching from "Pages/ForYou/ContinueWatching/ContinueWatching";
import CompletedCourses from "./CompletedCourses";
import BASE_URL from "Utilities/BASE_URL";

const MyProgress = () => {
  const { token, selectedUser } = useContext(LoginAuthContext);
  const { t, i18n } = useTranslation();
  const profileId = selectedUser?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-progress", profileId, i18n.language],
    queryFn: async () => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const body = { profile_id: profileId };

      // Sync completed courses first
      await fetch(`${BASE_URL}/${i18n.language}/sync-completed-courses`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      // Then fetch progress
      const res = await fetch(`${BASE_URL}/${i18n.language}/my-progress`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to fetch progress");
      const result = await res.json();
      return result.data;
    },
    enabled: !!profileId && !!token,
  });

  if (isLoading) return <IsLoading />;
  if (isError) return <IsError />;

  const hasContinueWatching = data?.continue_watching?.length > 0;
  const hasCompletedCourses = data?.completed_courses?.length > 0;
  const hasNoData = !hasContinueWatching && !hasCompletedCourses;

  if (hasNoData) {
    return (
      <main className="py-pageTop lg:py-primary">
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
    <main className="py-pageTop lg:py-primary">
      <Container className="flex flex-col gap-y-10 lg:gap-y-14">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            {t("progress.my_progress") || "My Progress"}
          </h1>
          <p className="text-gray-400 text-base lg:text-lg">
            {t("progress.subtitle") || "Track your learning journey and pick up where you left off"}
          </p>
        </div>

        {hasContinueWatching && (
          <ContinueWatching data={data.continue_watching} />
        )}

        {hasCompletedCourses && (
          <CompletedCourses data={data.completed_courses} />
        )}
      </Container>
    </main>
  );
};

export default MyProgress;
