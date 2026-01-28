const fixImageUrl = (image) => {
  return image?.replace(/\\/g, "/");
};

export default fixImageUrl;
