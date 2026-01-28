import React from "react";

const NewsData = ({ content }) => {
  if (!content) return null;

  return (
    <div className="mt-10 leading-relaxed">
      <div className="prose prose-lg max-w-none">
        {typeof content === "string" ? (
          <p className="text-gray-800">{content}</p>
        ) : (
          // If content is an object with HTML or other structured format
          <div dangerouslySetInnerHTML={{ __html: content.html || content }} />
        )}
      </div>
    </div>
  );
};

export default NewsData;
