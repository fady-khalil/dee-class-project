import React from "react";
import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
} from "@phosphor-icons/react";
import BASE_URL from "Utilities/BASE_URL";

const InstructorHero = ({ data }) => {
  // Build full image URL - remove /api from BASE_URL for static files
  const getImageUrl = () => {
    const imagePath = data?.profileImage || data?.image;
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL.replace("/api", "")}/${imagePath}`;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="w-full py-16">
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Profile Image */}
        <div className="w-40 h-40 md:w-60 md:h-60 rounded-full overflow-hidden shadow-lg">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={data?.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Name and Bio */}
        <div className="flex flex-col md:max-w-2xl">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
            {data?.name}
          </h1>
          <p className="text-base text-gray-300 mb-4 leading-relaxed">
            {data?.bio}
          </p>

          {/* Social Links */}
          <div className="flex gap-3">
            {data?.facebook && (
              <a
                href={data.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                <FacebookLogo size={20} weight="fill" />
              </a>
            )}

            {data?.instagram && (
              <a
                href={data.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                <InstagramLogo size={20} weight="fill" />
              </a>
            )}

            {data?.linkedin && (
              <a
                href={data.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                <LinkedinLogo size={20} weight="fill" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorHero;
