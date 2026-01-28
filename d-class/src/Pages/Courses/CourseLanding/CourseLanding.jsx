import React from "react";
import SingleCourse from "./components/SingleCourse/SingleCourse";
import SeriesCourse from "./components/SeriesCourse/SeriesCourse";
import PlaylistCourse from "./components/PlaylistCourse/PlaylistCourse";

import Container from "Components/Container/Container";
const CourseLanding = ({ data, isAuthenticated, isLoggedIn, isPurchased }) => {
  // Render different components based on course_type
  const renderCourseContent = () => {
    switch (data?.course_type) {
      case "single":
        return (
          <SingleCourse
            courseData={data}
            isAuthenticated={isAuthenticated}
            isLoggedIn={isLoggedIn}
            isPurchased={isPurchased}
          />
        );
      case "series":
        return (
          <SeriesCourse
            courseData={data}
            isAuthenticated={isAuthenticated}
            isLoggedIn={isLoggedIn}
            isPurchased={isPurchased}
          />
        );
      case "playlist":
        return (
          <PlaylistCourse
            courseData={data}
            isAuthenticated={isAuthenticated}
            isLoggedIn={isLoggedIn}
            isPurchased={isPurchased}
          />
        );
      default:
        return <div className="error-message">Unknown course type</div>;
    }
  };

  return (
    <section>
      <Container>{renderCourseContent()}</Container>
    </section>
  );
};

export default CourseLanding;
