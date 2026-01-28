import React from "react";
import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import BASE_URL from "Utilities/BASE_URL";

const Instructor = ({ data }) => {
  const { t } = useTranslation();

  // Construct image URL from profileImage path
  const imageUrl = data?.profileImage
    ? `${BASE_URL.replace("/api", "")}/${data.profileImage}`
    : null;

  return (
    <section className="pt-primary">
      <Container>
        <div className="flex lg:items-center flex-col lg:flex-row  gap-10">
          <div className="w-48 h-48 lg:w-72 lg:h-72 rounded-full overflow-hidden">
            <img
              src={imageUrl}
              alt={data?.name}
              className="w-48 h-48 lg:w-72 lg:h-72 rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2 lg:gap-4 flex-1">
            <h3 className="text-2xl font-bold text-white">{data?.name}</h3>
            <p className="text-white lg:text-lg lg:w-3/4">{data?.bio}</p>

            <Link
              to={`/instructor-profile/${data?.slug}`}
              className="bg-primary mt-6 lg:mt-0 w-max text-white rounded-md px-6 py-2 flex items-center gap-x-2"
            >
              {t("courses.view_profile")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Instructor;
