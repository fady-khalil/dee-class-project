import React from "react";

const Banner = ({ newsData }) => {
  if (!newsData) {
    return <div className="col-span-2">Loading...</div>;
  }

  return (
    <div className="col-span-2">
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Related Categories</h3>
        <div className="flex flex-col gap-2">
          {newsData?.related_categories?.map((category, index) => (
            <a
              key={index}
              href={`/news/category/${category.slug}`}
              className="text-primary hover:underline"
            >
              {category.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
