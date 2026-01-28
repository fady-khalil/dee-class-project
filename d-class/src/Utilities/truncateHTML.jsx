import truncate from "truncate-html";

export const truncateHTML = (htmlString, limit) => {
  return truncate(htmlString, {
    length: limit,
    ellipsis: "...",
    stripTags: false, // Keep the tags
  });
};
