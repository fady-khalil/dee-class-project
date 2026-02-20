import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IsLoading from "Components/RequestHandler/IsLoading";
import TrailerVideo from "./TrailerVideo/TrailerVideo";
import CourseLanding from "./CourseLanding/CourseLanding";
import Instructor from "./Instructor/Instructor";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import BASE_URL from "Utilities/BASE_URL";

const CourseBySlug = () => {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const { isAuthenticated, token, isLoggedIn, selectedUser, allowedCourses } =
    useContext(LoginAuthContext);

  const customFetch = async (url, authToken = null) => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${BASE_URL}/${i18n.language}/${url}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  const getAuthCourse = async () => {
    // Additional validation to ensure we never proceed without proper auth data
    if (!token) {
      console.error("getAuthCourse called without token!");
      return;
    }
    if (!selectedUser?.id) {
      console.error("getAuthCourse called without selectedUser.id!");
      return;
    }

    try {
      setIsLoading(true);
      const result = await customFetch(
        `courses/${slug}?profile_id=${selectedUser?.id}`,
        token
      );
      setData(result);
    } catch (error) {
      console.log("getAuthCourse error:", error);

      // Fallback: If authenticated endpoint fails, try non-authenticated as backup
      if (error.message.includes("500")) {
        console.log(
          "🔄 Fallback: Trying non-authenticated endpoint due to 500 error"
        );
        try {
          const fallbackResult = await customFetch(`courses/${slug}`);
          setData(fallbackResult);
          console.log("✅ Fallback successful");
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCourse = async () => {
    try {
      setIsLoading(true);
      const result = await customFetch(`courses/${slug}`);
      setData(result);
    } catch (error) {
      console.log("getCourse error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Wait for authentication context to initialize from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthInitialized(true);
    }, 50); // Small delay to allow auth context to load from localStorage

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't make API calls until auth has been initialized
    if (!authInitialized) {
      return;
    }

    if (isAuthenticated && selectedUser?.id && token) {
      getAuthCourse();
    } else if (!isAuthenticated) {
      console.log("User not authenticated, calling getCourse");
      getCourse();
    } else {
    }
    // If isAuthenticated is true but we don't have token or selectedUser.id yet, wait
  }, [slug, selectedUser?.id, token, isAuthenticated, authInitialized]);

  // Check if the course is purchased (allowedCourses is an array of course ID strings)
  useEffect(() => {
    const courseId = data?.data?._id;
    if (allowedCourses && allowedCourses.length > 0 && courseId) {
      const courseIsPurchased = allowedCourses.some(
        (id) => id === courseId || id === courseId.toString()
      );
      setIsPurchased(courseIsPurchased);
    }
  }, [allowedCourses, data]);

  // Show loading while fetching, waiting for auth initialization, or waiting for selectedUser.id when authenticated
  if (isLoading || !authInitialized || (isAuthenticated && !selectedUser?.id)) {
    return <IsLoading />;
  }

  // Extract course data from API response
  const courseData = data?.data;

  if (courseData) {
    return (
      <main>
        <TrailerVideo
          isAuthenticated={isAuthenticated}
          data={courseData}
          videoId={courseData?.trailer?.videoId}
          isPurchased={isPurchased}
        />
        <Instructor data={courseData?.instructor} />
        <CourseLanding
          isAuthenticated={isAuthenticated}
          isLoggedIn={isLoggedIn}
          data={courseData}
          isPurchased={isPurchased}
        />
      </main>
    );
  }

  // Return null if no data and not loading
  return null;
};

export default CourseBySlug;
