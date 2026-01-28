import React from "react";
import { useTranslation } from "react-i18next";

import Container from "Components/Container/Container";

const TrailerContent = ({ isPlaying, data }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Don't render content when video is playing
  if (isPlaying) return null;

  return (
    <div className="flex flex-col justify-center w-full mt-4 lg:mt-0 lg:absolute lg:h-full lg:top-1/2 lg:-translate-y-1/2 lg:left-0 z-10">
      <Container>
        <div className={`${isRTL ? "lg:w-1/3" : "lg:w-1/2"}`}>
          {/* Course Title */}
          <h1
            className={`
              text-white text-3xl md:text-4xl lg:text-6xl font-bold 
              relative after:absolute after:-bottom-6 after:w-[62px] after:h-1 
              after:bg-white after:rounded-full
              ${isRTL ? "after:right-0 leading-tight" : "after:left-0"}
            `}
          >
            {data?.name}
          </h1>

          {/* Instructor Name */}
          {data?.instructor?.name && (
            <p className="hidden lg:block pt-12 text-white text-2xl">
              {data.instructor.name}
            </p>
          )}

          {/* Course Description */}
          {data?.description && (
            <div
              className={`
                hidden lg:block mt-6 text-xl text-white
                ${isRTL ? "leading-relaxed" : ""}
              `}
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
        </div>
      </Container>
    </div>
  );
};

export default TrailerContent;
