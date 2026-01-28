import React from "react";
import { Link } from "react-router-dom";
import BASE_URL from "Utilities/BASE_URL";

const InstructorCard = ({ data }) => {
  if (!data) return null;

  // Handle different image field structures
  // Backend may return: profileImage (string), profileImage.data (object), or image
  let imagePath = null;
  if (typeof data?.profileImage === "string" && data.profileImage) {
    imagePath = data.profileImage;
  } else if (data?.profileImage?.data) {
    imagePath = data.profileImage.data;
  } else if (typeof data?.image === "string" && data.image) {
    imagePath = data.image;
  } else if (data?.image?.data) {
    imagePath = data.image.data;
  }

  // Build full URL - remove /api from BASE_URL for static files
  const fullImageUrl = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `${BASE_URL.replace("/api", "")}/${imagePath}`
    : null;

  return (
    <div>
      <Link
        to={`/instructor-profile/${data?.slug}`}
        className="flex items-center gap-x-4 text-white hover:text-primary transition-all duration-300 hover:underline"
      >
        {fullImageUrl && (
          <img
            src={fullImageUrl}
            alt={data?.name}
            className="w-16 h-16 object-cover rounded-md"
          />
        )}
        <p className="text-xl font-bold">{data?.name}</p>
      </Link>
      {data?.description && (
        <p
          className="text-lightWhite text-xs mt-2 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: data?.description }}
        ></p>
      )}
    </div>
  );
};

export default InstructorCard;
