// Helper function to fetch reels data from your API
// Replace the URL with your actual API endpoint

export const fetchReelsData = async () => {
  try {
    // You would replace this with your actual API call
    // const response = await fetch('your-api-endpoint/reels');
    // const data = await response.json();
    // return data;

    // For now, returning mock data
    return getMockReelsData();
  } catch (error) {
    console.error("Error fetching reels data:", error);
    return getMockReelsData(); // Fallback to mock data
  }
};

// Mock data for development
export const getMockReelsData = () => {
  return [
    {
      id: 1,
      title: "Learn UX Design",
      description: "Master the fundamentals of user experience",
      videoId: "vi7gr2B2QxcYaJkzXErlEygN",
      course_id: "ux-design-101",
      views: 1245,
      duration: "00:45",
    },
    {
      id: 2,
      title: "Web Development Essentials",
      description: "Build modern websites from scratch",
      videoId: "vi2SpK0SKOk6JN9Zp5TORAtM",
      course_id: "web-dev-basics",
      views: 984,
      duration: "00:32",
    },
    {
      id: 3,
      title: "Digital Marketing",
      description: "Grow your online presence effectively",
      videoId: "vi6kGsfmzqMgJDDizTb1LCjW",
      course_id: "digital-marketing-101",
      views: 1578,
      duration: "00:37",
    },
    {
      id: 4,
      title: "Mobile App Development",
      description: "Create powerful mobile experiences",
      videoId: "vi4m4UJLjSvOFPVKdvEJ1f0E",
      course_id: "mobile-dev-101",
      views: 876,
      duration: "00:29",
    },
    // {
    //   id: 5,
    //   title: "UI Design Masterclass",
    //   description: "Create beautiful user interfaces",
    //   videoId: "vi70cHY5STNykFmLlxH3Rsl5JMWvwLk3j",
    //   course_id: "ui-design-masterclass",
    //   views: 1122,
    //   duration: "00:41",
    // },
    // {
    //   id: 6,
    //   title: "Data Science Fundamentals",
    //   description: "Learn to analyze and visualize data",
    //   videoId: "vi6HE5xiLwEvbmWfhTEzybuoeSdVuLIxA",
    //   course_id: "data-science-101",
    //   views: 1435,
    //   duration: "00:38",
    // },
  ];
};
