// the course type should be auto generated when we make data entry for the course
// the course type should be based on the course content
// the types are only 3 : single , series , playlist and they are fix always as typo

const response_of_course_by_slug = {
  // the old responose +
  type: "single or series or playlist",
  trailer_video: "in both cases if is logged in or not",

  single_course: {
    response: "api.video.object", // if is looged in full, and if not onlt the thumbnail
  },
  series_courses: [
    {
      title: "",
      description: "",
      courseObjectFromAPIVIDE: {
        // if logied in i need th full structire
        // if not logged in i need only the thumbnail
      },
    },
  ],
  playlist_courses: [
    {
      chapeter: "",
      lessons: [
        {
          title: "",
          description: "",
          courseObjectFromAPIVIDE: {
            // if logied in i need th full structire
            // if not logged in i need only the thumbnail
          },
        },
      ],
    },
  ],

  //   bases on type the 2 other should be null,per example,if type is single
  single_course: { response: "api.video.object" },
  series_courses: null,
  playlist_courses: null,
};
