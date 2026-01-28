import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAssessment } from "../../Context/AssessmentContext";
import usePostData from "../../Hooks/usePostData";
import Spinner from "../../Components/RequestHandler/Spinner";
import Container from "../../Components/Container/Container";

function AssessmentComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const { postData } = usePostData();
  const { state: assessmentState, resetAssessment } = useAssessment();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Get results from location state or context
  const [result, setResult] = useState(
    location.state?.result || assessmentState.result
  );

  const [data, setData] = useState(null);

  useEffect(() => {
    if (assessmentState.status === "completed") {
      fetchRecommendedCourses();
    }
  }, []);

  const fetchRecommendedCourses = async () => {
    setLoading(true);
    try {
      const data = {
        core_topic_ids: assessmentState.coreTopics,
        learning_time_ids: assessmentState.timings,
      };
      // Simple API call with core_topic_ids and learning_time_ids
      const fetchedResult = await postData("recomended-courses", data);

      if (fetchedResult) {
        setResult(fetchedResult);
        setData(fetchedResult?.data?.courses);
      }

      console.log(fetchedResult?.data?.courses, "fetchedResult");
    } catch (error) {
      console.error("Error fetching recommended courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewAssessment = () => {
    resetAssessment();
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner />
      </div>
    );
  }

  if (!result) {
    return <div className="text-white text-center p-8">Loading results...</div>;
  }

  return (
    <div className="text-white lg:py-primary py-secondary ">
      <Container>
        <h1 className="text-3xl font-bold text-center mb-8">
          {t("assesment.recommended_courses")}
        </h1>

        <p className="text-center text-gray-400 mb-12">
          {t("assesment.recommended_courses_description")}
        </p>

        {/* Display recommended courses here */}
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {data?.map(
              (
                {
                  description,
                  name,
                  slug,
                  video_with_api_video_object,
                  learningTimes,
                  coreTopics,
                },
                index
              ) => (
                <Link
                  to={`/course/${slug}`}
                  key={index}
                  className="bg-darkGrey rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 flex flex-col shadow-md hover:shadow-lg"
                >
                  <div className="relative overflow-hidden group">
                    <img
                      src={video_with_api_video_object?.assets?.thumbnail}
                      alt={name}
                      className="w-full h-[250px] object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90"></div>

                    <div className="absolute bottom-3 right-3 flex flex-col items-end gap-2">
                      <div className="">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {learningTimes?.slice(0, 1)?.map((time, idx) => (
                            <span
                              key={`time-${idx}`}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white shadow-sm"
                            >
                              {time.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="">
                        <div className="flex flex-wrap gap-1.5 max-w-full">
                          {coreTopics?.slice(0, 3)?.map((topic, idx) => (
                            <span
                              key={`topic-${idx}`}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-sm border border-white/20"
                            >
                              {topic.name}
                            </span>
                          ))}
                          {coreTopics?.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-sm border border-white/20">
                              +{coreTopics.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {name}
                    </h3>
                    <p
                      className="text-gray-400 text-sm line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  </div>
                  <div className="px-4 pb-4">
                    <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                      View Course
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          <Link
            to="/plans"
            className="bg-primary text-white px-8 py-3 rounded-md hover:bg-primary/80 transition-colors"
          >
            Finish Signup
          </Link>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleStartNewAssessment}
            className="text-primary underline"
          >
            Start new assessment
          </button>
        </div>
      </Container>
    </div>
  );
}

export default AssessmentComplete;
