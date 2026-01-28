import React from "react";
// import { format } from "date-fns";

const NewsInfo = ({ news }) => {
  if (!news) return null;

  // Format date if it exists
  // const formattedDate = news.date
  //   ? format(new Date(news.date), "MMMM dd, yyyy")
  //   : "";

  return (
    <div className="mt-10">
      <h1 className="text-2xl lg:text-4xl font-bold">{news.title}</h1>
      <div className="flex flex-wrap gap-4 my-2 text-gray-600">
        {/* {formattedDate && <p className="text-sm">{formattedDate}</p>} */}
        {news.author && <p className="text-sm">By {news.author}</p>}
      </div>
      {news.image && (
        <div className="mt-6">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-auto max-h-[500px] object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default NewsInfo;
