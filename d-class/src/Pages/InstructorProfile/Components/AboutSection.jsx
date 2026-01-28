import React from "react";

const AboutSection = ({ data }) => {
  return (
    <div className=" py-8">
      <div className="bg-grey rounded-xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-6 pb-3 border-b border-gray-700">
          About {data?.name}
        </h2>

        <div
          className="text-gray-300 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: data?.description }}
        />
      </div>
    </div>
  );
};

export default AboutSection;
