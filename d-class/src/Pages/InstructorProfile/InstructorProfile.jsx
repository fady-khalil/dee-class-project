import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetch from "Hooks/useFetch";
import IsLoading from "Components/RequestHandler/IsLoading";
import Container from "Components/Container/Container";
import InstructorHero from "./Components/InstructorHero";
import CourseSlider from "./Components/CourseSlider";
import AboutSection from "./Components/AboutSection";
const InstructorProfile = () => {
  const { slug } = useParams();
  const { data, isLoading, error, fetchData } = useFetch();

  useEffect(() => {
    fetchData(`instructors/${slug}`);
  }, [slug]);

  if (isLoading) {
    return <IsLoading />;
  }

  // if (error) {
  //   return <IsError />;
  // }

  const instructorData = data?.data;

  if (instructorData) {
    return (
      <div className="min-h-screen pt-16 pb-24 ">
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
