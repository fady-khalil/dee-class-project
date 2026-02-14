import React from "react";
import { useParams } from "react-router-dom";
import useApiQuery from "Hooks/useApiQuery";
import IsLoading from "Components/RequestHandler/IsLoading";
import Container from "Components/Container/Container";
import InstructorHero from "./Components/InstructorHero";
import CourseSlider from "./Components/CourseSlider";
import AboutSection from "./Components/AboutSection";

const InstructorProfile = () => {
  const { slug } = useParams();
  const { data, isLoading } = useApiQuery(slug ? `instructors/${slug}` : null);

  if (isLoading) {
    return <IsLoading />;
  }

  // if (error) {
  //   return <IsError />;
  // }

  const instructorData = data?.data;

  if (instructorData) {
    return (
      <div className="min-h-screen pt-pageTop lg:pt-primary pb-16 lg:pb-primary">
        <Container>
          {/* Hero Section */}
          <InstructorHero data={instructorData} />

          {/* About Section */}
          <AboutSection data={instructorData} />

          <CourseSlider data={instructorData?.courses} />
        </Container>
      </div>
    );
  }
};

export default InstructorProfile;
